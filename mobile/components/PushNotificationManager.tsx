import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useAuth } from "@clerk/clerk-expo";
import { useRootNavigationState, router } from "expo-router";
import { useApiClient } from "@/utils/api";
import { registerForPushNotifications } from "@/utils/registerForPushNotifications";
import { activeChatTracker } from "@/utils/activeChatTracker";

export default function PushNotificationManager() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const rootNavigation = useRootNavigationState();
  const isRouterReady = !!rootNavigation?.key;
  const api = useApiClient();

  const registeredTokenRef = useRef<string | null>(null);
  const pendingNotificationRef = useRef<any>(null);

  // 1. Register Token once authenticated
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let isCancelled = false;

    const registerToken = async () => {
      try {
        const { token, platform, deviceId } = await registerForPushNotifications();
        if (!token) {
          console.log("No push token obtained. Skipping registration.");
          return;
        }

        // Avoid registering the same token repeatedly in the same session
        if (registeredTokenRef.current === token) return;

        // Ensure Clerk session token is ready before sending protected request
        let authToken: string | null = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          authToken = await getToken();
          if (authToken || isCancelled) break;
          console.log(`Clerk auth token not ready yet. Retrying attempt ${attempt}/3...`);
          await new Promise((res) => setTimeout(res, 1000));
        }

        if (!authToken) {
          console.warn("Could not retrieve Clerk auth token for push notification registration.");
          return;
        }

        if (isCancelled) return;

        console.log("Sending push token to backend for registration...");
        await api.post("/notifications/push-token", {
          token,
          platform,
          deviceId,
        });

        registeredTokenRef.current = token;
        console.log("Push token registered successfully.");
      } catch (error: any) {
        if (error?.response?.status === 401) {
          console.warn(
            "Backend returned 401 Unauthorized for push-token. Check that Vercel Deployment Protection is disabled and user is logged in.",
            error?.response?.data || error?.message
          );
        } else {
          console.error("Failed to register push token with backend:", error);
        }
      }
    };

    registerToken();

    return () => {
      isCancelled = true;
    };
  }, [isLoaded, isSignedIn, api, getToken]);

  // 2. Configure Foreground Notification Handler
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const data = notification.request.content.data;
        console.log("Foreground notification handler received:", data);

        // Suppress message, voice message, and reaction notifications if the user is in that conversation
        if (
          (data?.type === "MESSAGE" || data?.type === "VOICE_MESSAGE" || data?.type === "REACTION") &&
          data?.conversationId &&
          data?.conversationId === activeChatTracker.currentConversationId
        ) {
          console.log("Suppressing active chat message/reaction notification.");
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: false,
          };
        }

        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      },
    });
  }, []);

  // 3. Listen to Notifications and Notification responses (taps)
  useEffect(() => {
    // Listener for notifications received when app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received in foreground:", notification);
    });

    // Listener for notification taps/clicks
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log("User tapped on notification:", data);
      if (data) {
        if (isRouterReady && isSignedIn) {
          handleRouting(data);
        } else {
          pendingNotificationRef.current = data;
        }
      }
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, [isRouterReady, isSignedIn]);

  // 4. Handle cold starts (app launched from notification tap)
  useEffect(() => {
    const checkColdStart = async () => {
      try {
        const response = await Notifications.getLastNotificationResponseAsync();
        if (response) {
          const data = response.notification.request.content.data;
          console.log("Cold start notification data found:", data);
          if (data) {
            if (isRouterReady && isSignedIn) {
              handleRouting(data);
            } else {
              pendingNotificationRef.current = data;
            }
          }
        }
      } catch (error) {
        console.error("Error checking cold start notification:", error);
      }
    };

    checkColdStart();
  }, [isRouterReady, isSignedIn]);

  // 5. Navigate when navigation & auth are ready
  useEffect(() => {
    if (isRouterReady && isSignedIn && pendingNotificationRef.current) {
      const data = pendingNotificationRef.current;
      pendingNotificationRef.current = null;
      console.log("Executing pending navigation from notification tap:", data);
      handleRouting(data);
    }
  }, [isRouterReady, isSignedIn]);

  const handleRouting = (data: any) => {
    const { type, targetType, targetId, postId, senderClerkId } = data;
    console.log(`Routing for type: ${type}, targetType: ${targetType}, targetId: ${targetId}`);

    try {
      switch (type) {
        case "LIKE":
          router.push({
            pathname: "/",
            params: { openPostCommentsId: targetId },
          });
          break;

        case "COMMENT":
          router.push({
            pathname: "/",
            params: {
              openPostCommentsId: postId,
              highlightCommentId: targetId,
            },
          });
          break;

        case "FOLLOW":
          router.push({
            pathname: "/[username]",
            params: { username: targetId },
          });
          break;

        case "MESSAGE":
        case "VOICE_MESSAGE":
        case "REACTION":
          if (senderClerkId) {
            router.push({
              pathname: "/messages",
              params: {
                senderClerkId,
                conversationId: data.conversationId,
                messageId: data.messageId,
              },
            });
          } else {
            console.warn("Missing senderClerkId for chat routing.");
          }
          break;

        default:
          console.warn("Unknown notification type for routing:", type);
          break;
      }
    } catch (error) {
      console.error("Navigation error during notification routing:", error);
    }
  };

  return null;
}
