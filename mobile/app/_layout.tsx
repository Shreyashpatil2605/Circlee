import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import { View, AppState } from "react-native";
import "../global.css";
import ConvexUserSync from "@/components/ConvexUserSync";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useEffect, useRef } from "react";
import { usePresence } from "@/hooks/usePresence";
import RealtimeNotificationTracker from "@/components/RealtimeNotificationTracker";
import PushNotificationManager from "@/components/PushNotificationManager";
import { ModalProvider } from "@/context/ModalContext";

const queryclient = new QueryClient();

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

function DebugAuth() {
  const { userId, isSignedIn } = useAuth();

  console.log("========== CLERK DEBUG ==========");
  console.log("SIGNED IN:", isSignedIn);
  console.log("USER ID:", userId);
  console.log("=================================");

  return null;
}

//PresenceTracker

function PresenceTracker() {
  const { updatePresence } = usePresence();
  const { isSignedIn } = useAuth();
  const updatePresenceRef = useRef(updatePresence);
  updatePresenceRef.current = updatePresence;

  useEffect(() => {
    if (!isSignedIn) return;

    updatePresenceRef.current(true);

    // Heartbeat every 30 seconds
    const interval = setInterval(() => {
      updatePresenceRef.current(true);
    }, 30000);

    const subscription = AppState.addEventListener("change", (nextState) => {
      console.log("APP STATE:", nextState);

      if (nextState === "active") {
        console.log("SETTING ONLINE");
        updatePresenceRef.current(true);
      }

      if (nextState === "background" || nextState === "inactive") {
        console.log("SETTING OFFLINE");
        updatePresenceRef.current(false);
      }
    });

    return () => {
      updatePresenceRef.current(false);
      clearInterval(interval);
      subscription.remove();
    };
  }, [isSignedIn]);

  return null;
}

export default function RootLayout() {
  console.log("CONVEX URL:", process.env.EXPO_PUBLIC_CONVEX_URL);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ClerkProvider
          tokenCache={tokenCache}
          publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <QueryClientProvider client={queryclient}>
              <ModalProvider>
                {/* DEBUG AUTH */}
                <DebugAuth />
                <PresenceTracker />
                <ConvexUserSync />
                <RealtimeNotificationTracker />
                <PushNotificationManager />

                <View className="flex-1 bg-white">
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: "#FFFFFF" },
                    }}
                  >
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen
                      name="saved-posts"
                      options={{
                        headerShown: false,
                        contentStyle: { backgroundColor: "#0B0B10" },
                      }}
                    />
                  </Stack>

                  <StatusBar style="dark" />
                </View>
              </ModalProvider>
            </QueryClientProvider>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
