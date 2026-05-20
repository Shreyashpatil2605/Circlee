import asyncHandler from "express-async-handler";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";

// Get or create conversation (only if users mutually follow each other)
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { participantId } = req.body;

  const currentUser = await User.findOne({ clerkId: userId });
  if (!currentUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const otherUser = await User.findById(participantId);
  if (!otherUser) {
    return res.status(404).json({ error: "Other user not found" });
  }

  // Check if users mutually follow each other
  const currentUserFollowsOther = currentUser.following.includes(participantId);
  const otherUserFollowsCurrent = otherUser.following.includes(currentUser._id);

  if (!currentUserFollowsOther || !otherUserFollowsCurrent) {
    return res.status(403).json({
      error:
        "You can only message users who follow you and who you follow back",
      mutualFollow: false,
    });
  }

  // Find existing conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [currentUser._id, participantId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [currentUser._id, participantId],
    });
  }

  res.status(200).json({ conversation, mutualFollow: true });
});

// Get all conversations for current user (only show conversations with mutually following users)
export const getConversations = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);

  const currentUser = await User.findOne({ clerkId: userId });
  if (!currentUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const conversations = await Conversation.find({
    participants: currentUser._id,
  })
    .populate(
      "participants",
      "username firstName lastName profilePicture following",
    )
    .sort({ updatedAt: -1 })
    .lean();

  // Filter conversations to only include those with mutually following users
  const enrichedConversations = conversations
    .map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== currentUser._id.toString(),
      );

      // Check mutual follow (convert to strings for proper comparison with lean())
      const currentUserFollowsOther = currentUser.following
        .map((id) => id.toString())
        .includes(otherParticipant._id.toString());
      const otherUserFollowsCurrent =
        otherParticipant.following &&
        otherParticipant.following
          .map((id) => id.toString())
          .includes(currentUser._id.toString());

      // Only include if mutually following
      if (currentUserFollowsOther && otherUserFollowsCurrent) {
        return {
          _id: conv._id,
          otherUser: otherParticipant,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.updatedAt,
        };
      }
      return null;
    })
    .filter((conv) => conv !== null);

  res.status(200).json({ conversations: enrichedConversations });
});

// Send message (only if users mutually follow)
export const sendMessage = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { conversationId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Message content is required" });
  }

  const currentUser = await User.findOne({ clerkId: userId });
  if (!currentUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  // Verify user is part of conversation
  if (!conversation.participants.includes(currentUser._id)) {
    return res.status(403).json({ error: "Not authorized" });
  }

  // Find the other participant
  const otherParticipantId = conversation.participants.find(
    (p) => p.toString() !== currentUser._id.toString(),
  );
  const otherUser = await User.findById(otherParticipantId);

  // Verify mutual follow
  const currentUserFollowsOther =
    currentUser.following.includes(otherParticipantId);
  const otherUserFollowsCurrent = otherUser.following.includes(currentUser._id);

  if (!currentUserFollowsOther || !otherUserFollowsCurrent) {
    return res.status(403).json({
      error:
        "You can only message users who follow you and who you follow back",
    });
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: currentUser._id,
    content: content.trim(),
  });

  // Update conversation
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: content,
    updatedAt: new Date(),
  });

  // Populate sender details
  const populatedMessage = await message.populate(
    "sender",
    "username firstName lastName profilePicture",
  );

  res.status(201).json({ message: populatedMessage });
});

// Get messages for a conversation
export const getMessages = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { conversationId } = req.params;

  const currentUser = await User.findOne({ clerkId: userId });
  if (!currentUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  // Verify user is part of conversation
  if (!conversation.participants.includes(currentUser._id)) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "username firstName lastName profilePicture")
    .sort({ createdAt: 1 });

  res.status(200).json({ messages });
});
