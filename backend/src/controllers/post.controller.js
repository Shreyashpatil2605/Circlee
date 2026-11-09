import asyncHandler from "express-async-handler";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getAuth } from "@clerk/express";
import cloudinary from "../config/cloudinary.js";

import Comment from "../models/comment.model.js";
import { createNotificationHelper } from "./notification.controller.js";
import { NotificationType } from "../models/notification.model.js";

export const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    })
    .populate("reshares", "username firstName lastName profilePicture");

  res.status(200).json({ posts });
});

export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId)
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    })
    .populate("reshares", "username firstName lastName profilePicture");

  if (!post) return res.status(404).json({ error: "Post not found" });

  res.status(200).json({ post });
});

export const getUsersPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  const posts = await Post.find({
    $or: [{ user: user._id }, { reshares: user._id }],
  })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    })
    .populate("reshares", "username firstName lastName profilePicture");

  res.status(200).json({ posts });
});

export const getSavedPosts = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const posts = await Post.find({
    _id: { $in: user.savedPosts || [] },
  })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    })
    .populate("reshares", "username firstName lastName profilePicture");

  res.status(200).json({ posts });
});

export const createPost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { content } = req.body;
  const imageFile = req.file;

  if (!content && !imageFile) {
    return res
      .status(400)
      .json({ error: "Post must contain either text or image" });
  }

  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  let imageUrl = "";

  // upload image to Cloudinary if provided
  if (imageFile) {
    try {
      const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString(
        "base64"
      )}`;

      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "social_media_posts",
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
          { format: "auto" },
        ],
      });
      imageUrl = uploadResponse.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError);
      return res.status(400).json({
        error: "Failed to upload image",
        details: uploadError?.message || "Cloudinary upload failed",
      });
    }
  }

  const post = await Post.create({
    user: user._id,
    content: content || "",
    image: imageUrl,
  });

  res.status(201).json({ post });
});

export const likePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  if (!user || !post)
    return res.status(404).json({ error: "User or post not found" });

  const isLiked = post.likes.some(
    (id) => id.toString() === user._id.toString()
  );

  if (isLiked) {
    // unlike
    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: user._id },
    });
  } else {
    // like
    await Post.findByIdAndUpdate(postId, {
      $push: { likes: user._id },
    });

    // create notification if not liking own post
    if (post.user.toString() !== user._id.toString()) {
      await createNotificationHelper({
        fromUserId: user._id,
        toUserId: post.user,
        type: NotificationType.LIKE,
        targetType: "Post",
        targetId: postId,
        post: postId,
      });
    }
  }

  res.status(200).json({
    message: isLiked ? "Post unliked successfully" : "Post liked successfully",
  });
});

export const resharePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  if (!user || !post) {
    return res.status(404).json({ error: "User or post not found" });
  }

  const isReshared = (post.reshares || []).some(
    (id) => id.toString() === user._id.toString()
  );

  if (isReshared) {
    // undo reshare
    await Post.findByIdAndUpdate(postId, {
      $pull: { reshares: user._id },
    });
  } else {
    // add reshare ($addToSet prevents duplicates)
    await Post.findByIdAndUpdate(postId, {
      $addToSet: { reshares: user._id },
    });

    // create notification if not resharing own post
    if (post.user.toString() !== user._id.toString()) {
      await createNotificationHelper({
        fromUserId: user._id,
        toUserId: post.user,
        type: NotificationType.RESHARE,
        targetType: "Post",
        targetId: postId,
        post: postId,
      });
    }
  }

  res.status(200).json({
    message: isReshared
      ? "Post unreshared successfully"
      : "Post reshared successfully",
    isReshared: !isReshared,
  });
});

export const savePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  if (!user || !post) {
    return res.status(404).json({ error: "User or post not found" });
  }

  const isSaved = (user.savedPosts || []).some(
    (id) => id.toString() === post._id.toString()
  );

  if (isSaved) {
    // remove from saved posts
    await User.findByIdAndUpdate(user._id, {
      $pull: { savedPosts: post._id },
    });
  } else {
    // add to saved posts ($addToSet prevents duplicates)
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { savedPosts: post._id },
    });
  }

  res.status(200).json({
    message: isSaved
      ? "Post removed from saved posts"
      : "Post saved successfully",
    isSaved: !isSaved,
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  if (!user || !post)
    return res.status(404).json({ error: "User or post not found" });

  if (post.user.toString() !== user._id.toString()) {
    return res
      .status(403)
      .json({ error: "You can only delete your own posts" });
  }

  // delete all comments on this post
  await Comment.deleteMany({ post: postId });

  // clean up saved post references across all users
  await User.updateMany(
    { savedPosts: postId },
    { $pull: { savedPosts: postId } }
  );

  // delete the post
  await Post.findByIdAndDelete(postId);

  res.status(200).json({ message: "Post deleted successfully" });
});
