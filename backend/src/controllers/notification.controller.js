import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";
import Notifiacation from "../models/notification.model.js";
import asyncHandler from "express-async-handler";

export const getNotification = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User Not found" });

  const notifications = await Notifiacation.findOne({ to: user._id })
    .sort({ createdAt: -1 })
    .populate("from", "username firstName lastName profilePicture")
    .populate("post", "content image")
    .populate("comment", "content");
  res.status(200).json({ notifications });
});

export const deleteNotification = asyncHandler(async (res, req) => {
  const { userId } = getAuth(req);
  const { notificationId } = req.params;
  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not Found" });
  const notification = await Notifiacation.findOneAndDelete({
    _id: notificationId,
    to: user._id,
  });

  if(!notification) return res.status(404).json({error : "Notification not found "})
    res.status(200).json({message:"Notification deleted Successfully"})
});
