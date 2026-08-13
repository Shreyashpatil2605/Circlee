import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";
import Notification, { NotificationType } from "../models/notification.model.js";
import asyncHandler from "express-async-handler";
import { ConvexHttpClient } from "convex/browser";

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
  if (secret !== "circlee_super_secret_token_123") {
    return res.status(401).json({ error: "Unauthorized server-to-server action" });
  }

  const { fromClerkId, toClerkId, type, targetType, targetId } = req.body;

  const sender = await User.findOne({ clerkId: fromClerkId });
  const receiver = await User.findOne({ clerkId: toClerkId });

  if (!sender || !receiver) {
    return res.status(404).json({ error: "Sender or receiver not found" });
  }

  // Prevent self-notifications
  if (sender._id.toString() === receiver._id.toString()) {
    return res.status(200).json({ message: "Self-notification ignored" });
  }

  // Check receiver preference
  let prefKey = "";
  if (type === NotificationType.LIKE) prefKey = "likes";
  else if (type === NotificationType.COMMENT) prefKey = "comments";
  else if (type === NotificationType.FOLLOW) prefKey = "follows";
  else if (type === NotificationType.MESSAGE) prefKey = "messages";
  else if (type === NotificationType.VOICE_MESSAGE) prefKey = "voice";

  if (prefKey && receiver.notificationPreferences && receiver.notificationPreferences[prefKey] === false) {
    return res.status(200).json({ message: "Notification disabled by user preference" });
  }

  // Deduplication check: check if an unread notification with same details exists
  let notification = await Notification.findOne({
    from: sender._id,
    to: receiver._id,
    type,
    targetId,
    read: false,
  });

  if (notification) {
    // Deduplicate: update timestamp
    notification.createdAt = new Date();
    await notification.save();
    res.status(200).json({ message: "Notification updated (deduplicated)", notification });
  } else {
    notification = await Notification.create({
      from: sender._id,
      to: receiver._id,
      type,
      targetType,
      targetId,
    });
    res.status(201).json({ message: "Notification created", notification });
  }

  // Trigger Convex realtime signaling
  await triggerRealtimeNotification(toClerkId);
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
