import { Expo } from "expo-server-sdk";
import User from "../models/user.model.js";

const expo = new Expo();

/**
 * Removes an invalid/inactive push token from the user in MongoDB.
 */
export const removeInvalidToken = async (userId, token) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { pushTokens: { token: token } },
    });
    console.log(`[PUSH SERVICE] Removed invalid/inactive token: ${token} from user: ${userId}`);
  } catch (error) {
    console.error(`[PUSH SERVICE] Error removing invalid token ${token}:`, error);
  }
};

/**
 * Sends a push notification to all registered tokens of a receiver.
 * Running inside try/catch to never crash the main application thread.
 */
export const sendPushNotification = async (receiver, sender, notification, contentText = "") => {
  try {
    if (!receiver.pushTokens || receiver.pushTokens.length === 0) {
      console.log(`[PUSH SERVICE] No registered push tokens for user: ${receiver.username}. Skipping push.`);
      return;
    }

    // Determine title and body based on notification type
    let title = "Circleee";
    let body = "";

    switch (notification.type) {
      case "LIKE":
        body = `${sender.firstName} ${sender.lastName} liked your post`;
        break;
      case "COMMENT":
        body = `${sender.firstName} ${sender.lastName} commented on your post`;
        break;
      case "FOLLOW":
        body = `${sender.firstName} ${sender.lastName} started following you`;
        break;
      case "MESSAGE":
        title = "New Message";
        body = `${sender.firstName}: ${contentText || "sent you a message"}`;
        break;
      case "VOICE_MESSAGE":
        title = "New Voice Message";
        body = `${sender.firstName} sent you a voice message`;
        break;
      default:
        body = `New activity from ${sender.firstName}`;
    }

    // Build the payload required for routing
    const dataPayload = {
      type: notification.type,
      targetType: notification.targetType,
      targetId: notification.targetId,
      notificationId: notification._id.toString(),
    };

    if (notification.type === "LIKE" || notification.type === "COMMENT") {
      dataPayload.postId = notification.post ? notification.post.toString() : notification.targetId;
      if (notification.type === "COMMENT") {
        dataPayload.commentId = notification.comment ? notification.comment.toString() : notification.targetId;
      }
    } else if (notification.type === "MESSAGE" || notification.type === "VOICE_MESSAGE") {
      dataPayload.conversationId = notification.targetId;
      dataPayload.senderClerkId = sender.clerkId;
    } else if (notification.type === "FOLLOW") {
      dataPayload.username = sender.username;
    }

    const messages = [];
    const tokenToUserIdMap = {};

    for (const pushToken of receiver.pushTokens) {
      if (!Expo.isExpoPushToken(pushToken.token)) {
        console.warn(`[PUSH SERVICE] Invalid Expo push token ignored: ${pushToken.token}`);
        // Clean up invalid tokens immediately
        removeInvalidToken(receiver._id, pushToken.token);
        continue;
      }

      messages.push({
        to: pushToken.token,
        sound: "default",
        title,
        body,
        data: dataPayload,
        channelId: "circleee-default",
      });

      tokenToUserIdMap[pushToken.token] = receiver._id;
    }

    if (messages.length === 0) return;

    // Chunk and send
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("[PUSH SERVICE] Error sending chunk of push notifications:", error);
      }
    }

    // Inspect tickets and handle DeviceNotRegistered / other token errors
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const messageToken = messages[i].to;
      const targetUserId = tokenToUserIdMap[messageToken];

      if (ticket.status === "error") {
        console.error(`[PUSH SERVICE] Error for ticket: ${JSON.stringify(ticket)}`);
        
        // Check if the device is not registered (e.g. uninstalled or token expired)
        if (ticket.details && ticket.details.error === "DeviceNotRegistered") {
          if (targetUserId) {
            await removeInvalidToken(targetUserId, messageToken);
          }
        }
      }
    }
  } catch (error) {
    console.error("[PUSH SERVICE] Failed to execute push notification workflow:", error);
  }
};
