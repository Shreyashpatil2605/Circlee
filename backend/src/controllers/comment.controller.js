import asyncHandler from "express-async-handler";
import Comment from "../models/comment.model.js";
import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification, { NotificationType } from "../models/notification.model.js";
import { triggerRealtimeNotification } from "./notification.controller.js";

// getComments
export const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture");
  res.status(200).json({ comments });
});

// createComment
export const createComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Content is required!" });
  }

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  if (!user || !post)
    return res.status(404).json({ error: "User or Post is not found" });

  const comment = await Comment.create({
    user: user._id,
    post: postId,
    content,
  });

  await Post.findByIdAndUpdate(postId, {
    $push: {
      comments: comment._id,
    },
  });
  //create notification if not commenting on own post
  if (post.user.toString() !== user._id.toString()) {
    const targetUser = await User.findById(post.user);
    if (targetUser) {
      const wantsComments = targetUser.notificationPreferences?.comments !== false;
      if (wantsComments) {
        // Deduplicate check: if there is an unread comment notification from this user on this post
        let notification = await Notification.findOne({
          from: user._id,
          to: targetUser._id,
          type: NotificationType.COMMENT,
          post: postId,
          read: false,
        });

        if (notification) {
          notification.comment = comment._id;
          notification.targetId = comment._id;
          notification.createdAt = new Date();
          await notification.save();
        } else {
          await Notification.create({
            from: user._id,
            to: targetUser._id,
            type: NotificationType.COMMENT,
            targetType: "Comment",
            targetId: comment._id,
            post: postId,
            comment: comment._id,
          });
        }

        if (targetUser.clerkId) {
          await triggerRealtimeNotification(targetUser.clerkId);
        }
      }
    }
  }

  res.status(201).json({ comment });
});

// Delete Comment
export const deleteComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { commentId } = req.params;

  const user = await User.findOne({
    clerkId: userId,
  });
  const comment = await Comment.findById(commentId);

  if (!user || !comment) {
    return res.status(404).json({ error: "User or Comment are not found" });
  }
  if (comment.user.toString() !== user._id.toString()) {
    return res
      .status(403)
      .json({ error: "You cannot delete other users' comments" });
  }

  //remove comment from the past
  await Post.findByIdAndUpdate(comment.post, {
    $pull: {
      comments: commentId,
    },
  });

  //delete the comment
  await Comment.findByIdAndDelete(commentId);
  res.status(200).json({ message: "Comment Deleted Successfully" });
});
