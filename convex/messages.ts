import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./lib/auth";

// Get or create a conversation between two users
export const getOrCreateConversation = mutation({
  args: {
    participantId: v.string(), // The other user's ID
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const participants = [userId, args.participantId].sort();

    // Check if conversation exists
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_participants", (q) => q.eq("participants", participants))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      participants,
    });

    return conversationId;
  },
});

// Send a message
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (!args.content.trim()) throw new Error("Message content is required");

    // Verify user is part of conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    // Create message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      content: args.content,
      createdAt: Date.now(),
    });

    // Update conversation
    await ctx.db.patch(args.conversationId, {
      lastMessage: args.content,
      lastMessageAt: Date.now(),
      lastMessageFrom: userId,
    });

    return messageId;
  },
});

// Get all messages in a conversation
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user is part of conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    // Get all messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("asc")
      .collect();

    // Enrich with sender info
    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", msg.senderId))
          .first();

        return {
          ...msg,
          sender: sender
            ? {
                id: sender._id,
                firstName: sender.firstName,
                lastName: sender.lastName,
                username: sender.username,
                profilePicture: sender.profilePicture,
              }
            : null,
        };
      }),
    );

    return enrichedMessages;
  },
});

// Get all conversations for a user
export const getConversations = query({
  async handler(ctx) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conversations = await ctx.db.query("conversations").collect();

    const userConversations = conversations
      .filter((conv) => conv.participants.includes(userId))
      .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));

    // Enrich with participant info
    const enrichedConversations = await Promise.all(
      userConversations.map(async (conv) => {
        const otherParticipantId = conv.participants.find((p) => p !== userId);
        const otherUser = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", otherParticipantId!))
          .first();

        return {
          ...conv,
          otherUser: otherUser
            ? {
                id: otherUser._id,
                firstName: otherUser.firstName,
                lastName: otherUser.lastName,
                username: otherUser.username,
                profilePicture: otherUser.profilePicture,
              }
            : null,
        };
      }),
    );

    return enrichedConversations;
  },
});

// Watch a conversation for real-time updates
export const watchConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    return conversation;
  },
});
