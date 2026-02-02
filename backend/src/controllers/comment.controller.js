import asyncHandler from "express-async-handler";
import Comment from "../models/comment.model";
import { getAuth } from "@clerk/express";
import User from "../models/user.model";
import Post from "../models/post.model";

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
  const content = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json("Their must be some content nedded!");
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
  //create notification if not commenting onm own post
  if (post.user.toString() !== user._id.toString()) {
    await Notification.create({
      from: user.id,
      to: post.id,
      type: "comment",
      post: postId,
      comment: comment._id,
    });
  }

  res.status(201).json({ comment });
});

// Delete Comment
export const deleteComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { commentId } = req.params;

  const user = await User.findById({ clerkId: userId });
  const comment = await Comment.findById(commentId);

  if (!user || !comment) {
    res.status(404).status({ error: "User or Comment are not found" });
  }
  if (comment.user.toString() !== user._id.toString()) {
    res.status(403).status({ error: "You cannot delete your own Comments" });
  }

  //remove comment from the past

  await Post.findByIdAndUpdate(comment.post, {
    $pull: {
      comments: commentId,
    },
  });

  //delete the commet
  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({ message: "Comment Deleted Successfully" });
});
