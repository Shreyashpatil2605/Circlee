import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./auth";
import { api } from "./_generated/api";

// Get or create conversation
export const getOrCreateConversation = mutation({
  args: {
    participantId: v.string(),
  },

  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);

    console.log("===== CREATE CONVERSATION =====");
    console.log("Current User:", userId);
    console.log("Participant:", args.participantId);

    const participants = [userId, args.participantId].sort();

    const existingConversations = await ctx.db.query("conversations").collect();

    console.log("Existing Conversations:", existingConversations.length);

    const existing = existingConversations.find((conv) => {
      const sorted = [...conv.participants].sort();

      return (
        sorted.length === participants.length &&
        sorted.every((p, i) => p === participants[i])
      );
    });

    if (existing) {
      console.log("Conversation already exists");
      return existing._id;
    }

    const conversationId = await ctx.db.insert("conversations", {
      participants,
    });

    console.log("Conversation Created:", conversationId);

    return conversationId;
  },
});

// Send Message
export const sendMessage = mutation({
  
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    type: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    attachments: v.optional(
      v.array(
        v.object({
          type: v.string(),
          url: v.string(),
          metadata: v.optional(
            v.object({
              duration: v.optional(v.number()),
              waveform: v.optional(v.array(v.number())),
              transcription: v.optional(
                v.object({
                  text: v.string(),
                  language: v.optional(v.string()),
                  confidence: v.optional(v.number()),
                })
              ),
              fileSize: v.optional(v.number()),
              mimeType: v.optional(v.string()),
            })
          ),
        })
      )
    ),
  },

  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (!args.content.trim() && !args.attachments) {
      throw new Error("Message content is required");
    }

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    const isVoice = args.type === "voice" || 
      (args.attachments && args.attachments.some(a => a.type === "voice"));

    const lastMsgContent = isVoice ? "🎙️ Voice message" : args.content;

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      content: args.content,
      createdAt: Date.now(),
      readBy: [userId],
      type: args.type,
      audioUrl: args.audioUrl,
      attachments: args.attachments,
    });

    const receiverId = conversation.participants.find((p) => p !== userId)!;
    const wasAlreadyUnread = conversation.unreadBy?.includes(receiverId) ?? false;
    const isFirstUnread = !wasAlreadyUnread;

    await ctx.db.patch(args.conversationId, {
      lastMessage: lastMsgContent,
      lastMessageAt: Date.now(),
      lastMessageFrom: userId,

      unreadBy: conversation.participants.filter(
        (participant) => participant !== userId,
      ),
    });

    return {
      messageId,
      isFirstUnread,
      senderId: userId,
      receiverId,
    };
  },
});

export const sendMessageAction = action({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    type: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    attachments: v.optional(v.any()),
    apiUrl: v.string(),
  },
  async handler(ctx, args): Promise<string> {
    const result: any = await ctx.runMutation(api.messages.sendMessage, {
      conversationId: args.conversationId,
      content: args.content,
      type: args.type,
      audioUrl: args.audioUrl,
      attachments: args.attachments,
    });

    if (result.isFirstUnread) {
      try {
        const response = await fetch(`${args.apiUrl}/api/notifications/internal-create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": "circlee_super_secret_token_123",
          },
          body: JSON.stringify({
            fromClerkId: result.senderId,
            toClerkId: result.receiverId,
            type: args.type === "voice" ? "VOICE_MESSAGE" : "MESSAGE",
            targetType: "Conversation",
            targetId: args.conversationId,
          }),
        });
        console.log("Internal message notification create HTTP status:", response.status);
      } catch (err) {
        console.error("Failed to trigger message notification creation:", err);
      }
    }

    return result.messageId;
  },
});
export const markConversationRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },

  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Clear conversation unread flag
    await ctx.db.patch(args.conversationId, {
      unreadBy: conversation.unreadBy?.filter((id) => id !== userId) || [],
    });

    // Mark all messages as read
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    for (const message of messages) {
      if (!(message.readBy ?? []).includes(userId)) {
        await ctx.db.patch(message._id, {
          readBy: [...(message.readBy ?? []), userId],
        });
      }
    }

    return true;
  },
});
// Get Messages
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },

  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("asc")
      .collect();
    console.log("MESSAGES:", JSON.stringify(messages, null, 2));

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
                clerkId: sender.clerkId,
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

// Get Conversations
export const getConversations = query({
  async handler(ctx) {
    const userId = await getAuthUserId(ctx);
    console.log("===== GET CONVERSATIONS =====");
    console.log("CLERK USER:", userId);
    const conversations = await ctx.db.query("conversations").collect();
    const userConversations = conversations
      .filter((conv) => conv.participants.includes(userId))
      .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
    const enrichedConversations = await Promise.all(
      userConversations.map(async (conv) => {
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .collect();
        const unreadCount = messages.filter(
          (msg) =>
            msg.senderId !== userId && !(msg.readBy ?? []).includes(userId),
        ).length;
        const otherParticipantId = conv.participants.find((p) => p !== userId);

        if (!otherParticipantId) {
          return {
            ...conv,
            unreadCount,
            otherUser: null,
          };
        }

        const otherUser = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", otherParticipantId))
          .first();

        return {
          ...conv,
          unreadCount,
          otherUser: otherUser
            ? {
                id: otherUser._id,
                clerkId: otherUser.clerkId,
                firstName: otherUser.firstName,
                lastName: otherUser.lastName,
                username: otherUser.username,
                profilePicture: otherUser.profilePicture,
                isOnline: otherUser.isOnline,
              }
            : null,
        };
      }),
    );

    console.log(
      "UNREAD:",
      enrichedConversations.map((c) => ({
        user: c.otherUser?.username,
        unreadCount: c.unreadCount,
      })),
    );

    return enrichedConversations;
  },
});

// Watch Conversation
export const watchConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },

  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    return conversation;
  },
});
// updateTyping mutation
export const updateTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },

  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.conversationId, {
      typingBy: args.isTyping ? userId : undefined,
    });

    return true;
  },
});