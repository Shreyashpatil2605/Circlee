import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";
import Notification, { NotificationType } from "../models/notification.model.js";
import asyncHandler from "express-async-handler";
import { ConvexHttpClient } from "convex/browser";
import { sendPushNotification } from "../services/pushNotification.service.js";

// Helper to trigger Convex realtime signals
export const triggerRealtimeNotification = async (clerkId) => {
  try {
    const convexUrl = process.env.CONVEX_URL || "https://dependable-chinchilla-546.eu-west-1.convex.cloud";
    const convex = new ConvexHttpClient(convexUrl);
    await convex.mutation("notificationEvents:sendNotificationEvent", { toUserId: clerkId });
    console.log("Realtime notification event triggered on Convex for user:", clerkId);
  } catch (error) {
    console.error("Error triggering realtime notification on Convex:", error);
  }
};

/**
 * Unified notification helper that handles MongoDB record creation,
 * Convex real-time signaling, and Expo push delivery.
 */
export const createNotificationHelper = async ({
  fromUserId,
  toUserId,
  type,
  targetType,
  targetId,
  messageId = null,
  messagePreview = null,
  post = null,
  comment = null,
  content = null,
}) => {
  try {
    // 1. Prevent self-notifications
    if (fromUserId.toString() === toUserId.toString()) {
      return null;
    }

    // 2. Validate receiver
    const receiver = await User.findById(toUserId);
    if (!receiver) {
      console.error(`[NOTIFICATION HELPER] Receiver user not found: ${toUserId}`);
      return null;
    }

    const sender = await User.findById(fromUserId);
    if (!sender) {
      console.error(`[NOTIFICATION HELPER] Sender user not found: ${fromUserId}`);
      return null;
    }

    // 3. Check notification preferences
    let prefKey = "";
    if (type === "LIKE") prefKey = "likes";
    else if (type === "COMMENT") prefKey = "comments";
    else if (type === "FOLLOW") prefKey = "follows";
    else if (type === "MESSAGE") prefKey = "messages";
    else if (type === "VOICE_MESSAGE") prefKey = "voice";
    else if (type === "REACTION") prefKey = "messages";

    if (prefKey && receiver.notificationPreferences && receiver.notificationPreferences[prefKey] === false) {
      console.log(`[NOTIFICATION HELPER] Notification type ${type} disabled by preference for user: ${receiver.username}`);
      return null;
    }

    // 4. Deduplication logic: update timestamp if duplicate notification exists
    let dedupeQuery = {
      from: fromUserId,
      to: toUserId,
      type,
      targetId,
    };

    if (type === "REACTION" && messageId) {
      dedupeQuery.messageId = messageId;
    } else {
      dedupeQuery.read = false;
    }

    let notification = await Notification.findOne(dedupeQuery);

    if (notification) {
      notification.content = content !== null ? content : notification.content;
      notification.messagePreview = messagePreview !== null ? messagePreview : notification.messagePreview;
      notification.read = false;
      notification.createdAt = new Date();
      await notification.save();
      console.log(`[NOTIFICATION HELPER] Deduplicated/updated notification type ${type} for user: ${receiver.username}`);
    } else {
      notification = await Notification.create({
        from: fromUserId,
        to: toUserId,
        type,
        targetType,
        targetId,
        messageId,
        messagePreview,
        content,
        post,
        comment,
      });
      console.log(`[NOTIFICATION HELPER] Created new notification type ${type} for user: ${receiver.username}`);
    }

    // 5. Trigger Convex real-time signaling
    await triggerRealtimeNotification(receiver.clerkId);

    // 6. Deliver Expo push notification (Fire-and-forget)
    sendPushNotification(receiver, sender, notification, content).catch((pushErr) => {
      console.error("[NOTIFICATION HELPER] Error sending Expo push notification:", pushErr);
    });

    return notification;
  } catch (error) {
    console.error("[NOTIFICATION HELPER] Error in createNotificationHelper:", error);
    // Never block core business flows if notifications fail
    return null;
  }
};

// getNotification
export const getNotification = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User Not found" });

  const notifications = await Notification.find({ to: user._id })
    .sort({ createdAt: -1 })
    .populate("from", "clerkId username firstName lastName profilePicture")
    .populate("post", "content image")
    .populate("comment", "content");

  // Map lowercase legacy DB entries to uppercase to comply with NotificationType enum
  const mappedNotifications = notifications.map((n) => {
    const obj = n.toObject();
    obj.type = (obj.type || "").toUpperCase();
    return obj;
  });

  res.status(200).json({ notifications: mappedNotifications });
});

// deleteNotification
export const deleteNotification = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { notificationId } = req.params;
  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not Found" });
  
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    to: user._id,
  });

  if (!notification)
    return res.status(404).json({ error: "Notification not found " });
  
  res.status(200).json({ message: "Notification deleted Successfully" });
});

// markNotificationRead
export const markNotificationRead = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { notificationId } = req.params;
  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, to: user._id },
    { read: true },
    { new: true }
  )
    .populate("from", "clerkId username firstName lastName profilePicture")
    .populate("post", "content image")
    .populate("comment", "content");

  if (!notification) return res.status(404).json({ error: "Notification not found" });

  const mapped = notification.toObject();
  mapped.type = (mapped.type || "").toUpperCase();

  res.status(200).json({ notification: mapped });
});

// markAllNotificationsRead
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  await Notification.updateMany({ to: user._id, read: false }, { read: true });
  res.status(200).json({ success: true, message: "All notifications marked as read" });
});

// createInternalNotification (Server-to-Server)
export const createInternalNotification = asyncHandler(async (req, res) => {
  const secret = req.headers["x-internal-secret"];
  const expectedSecret = process.env.INTERNAL_SECRET || "circlee_super_secret_token_123";
  
  if (secret !== expectedSecret) {
    return res.status(401).json({ error: "Unauthorized server-to-server action" });
  }

  const { fromClerkId, toClerkId, type, targetType, targetId, messageId, messagePreview, content } = req.body;

  const sender = await User.findOne({ clerkId: fromClerkId });
  const receiver = await User.findOne({ clerkId: toClerkId });

  if (!sender || !receiver) {
    return res.status(404).json({ error: "Sender or receiver not found" });
  }

  const notification = await createNotificationHelper({
    fromUserId: sender._id,
    toUserId: receiver._id,
    type,
    targetType,
    targetId,
    messageId,
    messagePreview,
    content,
  });

  if (!notification) {
    return res.status(200).json({ message: "Notification ignored or self-notification detected" });
  }

  res.status(201).json({ message: "Notification created", notification });
});

// createReactionNotification (Called by authenticated mobile client)
export const createReactionNotification = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { toClerkId, conversationId, messageId, messagePreview, emoji } = req.body;

  if (!toClerkId || !conversationId) {
    return res.status(400).json({ error: "toClerkId and conversationId are required" });
  }

  // 1. Prevent self-notifications
  if (userId === toClerkId) {
    return res.status(200).json({ message: "Self-reaction ignored" });
  }

  const sender = await User.findOne({ clerkId: userId });
  const receiver = await User.findOne({ clerkId: toClerkId });

  if (!sender || !receiver) {
    return res.status(404).json({ error: "Sender or receiver not found" });
  }

  const notification = await createNotificationHelper({
    fromUserId: sender._id,
    toUserId: receiver._id,
    type: "REACTION",
    targetType: "Conversation",
    targetId: conversationId,
    messageId,
    messagePreview,
    content: emoji,
  });

  if (!notification) {
    return res.status(200).json({ message: "Notification ignored or self-notification detected" });
  }

  res.status(201).json({ message: "Reaction notification created", notification });
});

// createMessageNotification (Called by authenticated mobile client)
export const createMessageNotification = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { toClerkId, conversationId, content, type } = req.body;
  if (!toClerkId || !conversationId) {
    return res.status(400).json({ error: "toClerkId and conversationId are required" });
  }

  if (userId === toClerkId) {
    return res.status(200).json({ message: "Self-message ignored" });
  }

  const sender = await User.findOne({ clerkId: userId });
  const receiver = await User.findOne({ clerkId: toClerkId });

  if (!sender || !receiver) {
    return res.status(404).json({ error: "Sender or receiver not found" });
  }

  const notification = await createNotificationHelper({
    fromUserId: sender._id,
    toUserId: receiver._id,
    type: type === "voice" ? "VOICE_MESSAGE" : "MESSAGE",
    targetType: "Conversation",
    targetId: conversationId,
    content: content || (type === "voice" ? "Voice message" : "Sent a message"),
  });

  if (!notification) {
    return res.status(200).json({ message: "Notification ignored or disabled by preferences" });
  }

  res.status(201).json({ message: "Message notification created", notification });
});

// markMessageNotificationsRead
export const markMessageNotificationsRead = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { conversationId } = req.body;
  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  await Notification.updateMany(
    {
      to: user._id,
      targetType: "Conversation",
      targetId: conversationId,
      read: false,
    },
    { read: true }
  );

  // Trigger Convex realtime signaling to update client badge
  await triggerRealtimeNotification(userId);

  res.status(200).json({ success: true, message: "Conversation message notifications marked as read" });
});

// registerPushToken
export const registerPushToken = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { token, platform, deviceId } = req.body;

  if (!token || !platform || !deviceId) {
    return res.status(400).json({ error: "Token, platform, and deviceId are required" });
  }

  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  // 1. Remove this token from any other user who might have previously registered it
  await User.updateMany(
    { "pushTokens.token": token },
    { $pull: { pushTokens: { token } } }
  );

  // 2. Add or update the token in the current user's array
  const existingTokenIndex = user.pushTokens.findIndex(
    (t) => t.token === token || t.deviceId === deviceId
  );

  if (existingTokenIndex > -1) {
    user.pushTokens[existingTokenIndex].token = token;
    user.pushTokens[existingTokenIndex].platform = platform;
    user.pushTokens[existingTokenIndex].deviceId = deviceId;
    user.pushTokens[existingTokenIndex].updatedAt = new Date();
  } else {
    user.pushTokens.push({
      token,
      platform,
      deviceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  user.markModified("pushTokens");
  await user.save();

  res.status(200).json({ success: true, message: "Push token registered successfully" });
});

// deregisterPushToken
export const deregisterPushToken = asyncHandler(async (req, res) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized - user ID not found in session" });
  }

  // Safely extract token and deviceId from req.body or req.query (fallback for HTTP DELETE)
  const body = req.body || {};
  const query = req.query || {};
  const token = typeof body.token === "string" ? body.token : (typeof query.token === "string" ? query.token : null);
  const deviceId = typeof body.deviceId === "string" ? body.deviceId : (typeof query.deviceId === "string" ? query.deviceId : null);

  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  // Ensure pushTokens is an initialized array
  if (!Array.isArray(user.pushTokens)) {
    user.pushTokens = [];
  }

  // If neither token nor deviceId was provided, return success idempotently
  if (!token && !deviceId) {
    return res.status(200).json({
      success: true,
      message: "No token or deviceId provided; nothing to deregister",
    });
  }

  const initialCount = user.pushTokens.length;

  // Filter matching push tokens safely
  user.pushTokens = user.pushTokens.filter((t) => {
    if (!t) return false;
    if (token && t.token === token) return false;
    if (deviceId && t.deviceId === deviceId) return false;
    return true;
  });

  if (user.pushTokens.length !== initialCount) {
    user.markModified("pushTokens");
    await user.save();
  }

  res.status(200).json({ success: true, message: "Push token deregistered successfully" });
});
