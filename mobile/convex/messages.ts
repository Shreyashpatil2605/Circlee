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
    if (!userId) {
      throw new Error("Not authenticated");
    }

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
      deletedFor: [], // restore visibility for both users on a new message
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
        const secret = process.env.INTERNAL_SECRET || "circlee_super_secret_token_123";
        const response = await fetch(`${args.apiUrl}/api/notifications/internal-create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": secret,
          },
          body: JSON.stringify({
            fromClerkId: result.senderId,
            toClerkId: result.receiverId,
            type: args.type === "voice" ? "VOICE_MESSAGE" : "MESSAGE",
            targetType: "Conversation",
            targetId: args.conversationId,
            content: args.content,
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

    // Get current user's deletion timestamp
    const userDeletion = (conversation.deletedAt ?? []).find(
      (d: any) => d.userId === userId
    );
    const deletionTime = userDeletion ? userDeletion.timestamp : 0;

    // If conversation is deleted for me, return []
    if ((conversation.deletedFor ?? []).includes(userId)) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("asc")
      .collect();

    // Hide messages where deletedFor contains the current user's clerk ID/userId
    // AND hide messages sent before the user's latest deletion timestamp
    const visibleMessages = messages.filter(
      (msg) =>
        msg.createdAt > deletionTime &&
        !(msg.deletedFor ?? []).includes(userId)
    );

    console.log("MESSAGES:", JSON.stringify(visibleMessages, null, 2));

    const enrichedMessages = await Promise.all(
      visibleMessages.map(async (msg) => {
        const sender = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", msg.senderId))
          .first();

        const senderData = sender
          ? {
              id: sender._id,
              clerkId: sender.clerkId,
              firstName: sender.firstName,
              lastName: sender.lastName,
              username: sender.username,
              profilePicture: sender.profilePicture,
            }
          : null;

        if (msg.deletedForEveryone) {
          return {
            ...msg,
            content: "This message was deleted",
            type: "text",
            audioUrl: undefined,
            attachments: undefined,
            reactions: [],
            sender: senderData,
          };
        }

        return {
          ...msg,
          reactions: msg.reactions ?? [],
          sender: senderData,
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
    if (!userId) {
      return [];
    }
    console.log("===== GET CONVERSATIONS =====");
    console.log("CLERK USER:", userId);
    const conversations = await ctx.db.query("conversations").collect();
    
    // Hide conversations where deletedFor contains the current user's clerk ID/userId
    const userConversations = conversations.filter((conv) =>
      conv.participants.includes(userId) &&
      !(conv.deletedFor ?? []).includes(userId),
    );

    const enrichedConversations = await Promise.all(
      userConversations.map(async (conv) => {
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .collect();

        // Get this user's deletion time
        const userDeletion = (conv.deletedAt ?? []).find(
          (d: any) => d.userId === userId
        );
        const deletionTime = userDeletion ? userDeletion.timestamp : 0;

        // Hide messages where deletedFor contains the current user's clerk ID/userId
        // and also messages sent before the user's deletion timestamp
        const visibleMessages = messages.filter(
          (msg) =>
            msg.createdAt > deletionTime &&
            !(msg.deletedFor ?? []).includes(userId),
        );

        const unreadCount = visibleMessages.filter(
          (msg) =>
            msg.senderId !== userId && !(msg.readBy ?? []).includes(userId),
        ).length;

        const otherParticipantId = conv.participants.find((p) => p !== userId);

        // Dynamically compute preview for the remaining visible messages
        const lastVisibleMsg = visibleMessages[visibleMessages.length - 1];
        let lastMessageText = conv.lastMessage;
        let lastMessageTime = conv.lastMessageAt;
        let lastMessageFrom = conv.lastMessageFrom;

        if (lastVisibleMsg) {
          if (lastVisibleMsg.deletedForEveryone) {
            lastMessageText = "This message was deleted";
          } else {
            const isVoice = lastVisibleMsg.type === "voice" || 
              (lastVisibleMsg.attachments && lastVisibleMsg.attachments.some((a: any) => a.type === "voice"));
            lastMessageText = isVoice ? "🎙️ Voice message" : lastVisibleMsg.content;
          }
          lastMessageTime = lastVisibleMsg.createdAt;
          lastMessageFrom = lastVisibleMsg.senderId;
        } else {
          lastMessageText = "";
          lastMessageTime = 0;
          lastMessageFrom = undefined;
        }

        const otherUser = otherParticipantId
          ? await ctx.db
              .query("users")
              .withIndex("by_clerkId", (q) => q.eq("clerkId", otherParticipantId))
              .first()
          : null;

        const isPinned = conv.pinnedFor?.includes(userId) ?? false;

        return {
          ...conv,
          isPinned,
          unreadCount,
          lastMessage: lastMessageText,
          lastMessageAt: lastMessageTime,
          lastMessageFrom,
          otherUser: otherUser
            ? {
                id: otherUser._id,
                clerkId: otherUser.clerkId,
                firstName: otherUser.firstName,
                lastName: otherUser.lastName,
                username: otherUser.username,
                profilePicture: otherUser.profilePicture,
                isOnline: otherUser.isOnline,
                lastSeen: otherUser.lastSeen,
              }
            : null,
        };
      }),
    );

    // Sort conversations:
    // 1. Pinned conversations first.
    // 2. Within pinned conversations, newest first.
    // 3. Within unpinned conversations, newest first.
    return enrichedConversations.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.lastMessageAt || 0) - (a.lastMessageAt || 0);
    });
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

    // Return null if conversation is deleted/hidden for me
    if ((conversation.deletedFor ?? []).includes(userId)) {
      return null;
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

// Delete Message mutation
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    type: v.union(v.literal("me"), v.literal("everyone")),
  },

  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    const conversation = await ctx.db.get(message.conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    if (args.type === "everyone") {
      // For "everyone", user MUST be the original sender
      if (message.senderId !== userId) {
        throw new Error("Only the sender can delete a message for everyone");
      }

      // Mark the message as deleted for everyone and clear sensitive content
      await ctx.db.patch(args.messageId, {
        deletedForEveryone: true,
        content: "This message was deleted",
        audioUrl: undefined,
        attachments: undefined,
      });

      // Update the conversation's preview if this was the latest message
      if (conversation.lastMessageAt === message.createdAt) {
        await ctx.db.patch(message.conversationId, {
          lastMessage: "This message was deleted",
        });
      }

      // If this was the pinned message, clear it
      if (conversation.pinnedMessage?.messageId === args.messageId) {
        await ctx.db.patch(message.conversationId, {
          pinnedMessage: undefined,
        });
      }
    } else if (args.type === "me") {
      // Add current user's clerk ID to deletedFor
      const deletedFor = message.deletedFor ?? [];
      if (!deletedFor.includes(userId)) {
        deletedFor.push(userId);
        await ctx.db.patch(args.messageId, {
          deletedFor,
        });
      }
    }

    return {
      success: true,
      type: args.type,
    };
  },
});

// Delete Conversation mutation
export const deleteConversation = mutation({
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

    // Add current user to deletedFor
    const deletedFor = conversation.deletedFor ?? [];
    if (!deletedFor.includes(userId)) {
      deletedFor.push(userId);
    }

    // Add/update current user's deletion timestamp in deletedAt
    const deletedAt = conversation.deletedAt ?? [];
    const existingIndex = deletedAt.findIndex((d) => d.userId === userId);
    const now = Date.now();
    if (existingIndex > -1) {
      deletedAt[existingIndex].timestamp = now;
    } else {
      deletedAt.push({ userId, timestamp: now });
    }

    await ctx.db.patch(args.conversationId, {
      deletedFor,
      deletedAt,
    });

    return {
      success: true,
    };
  },
});

// Toggle Pin Conversation mutation
export const togglePinConversation = mutation({
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

    const pinnedFor = conversation.pinnedFor ?? [];
    const isPinned = pinnedFor.includes(userId);
    let newPinnedFor: string[];

    if (isPinned) {
      newPinnedFor = pinnedFor.filter((id) => id !== userId);
    } else {
      newPinnedFor = [...pinnedFor, userId];
    }

    await ctx.db.patch(args.conversationId, {
      pinnedFor: newPinnedFor,
    });

    return {
      success: true,
      pinned: !isPinned,
      isPinned: !isPinned,
    };
  },
});
// Clear Chat mutation (clears message history for the requesting user only)
export const clearChat = mutation({
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

    // Set deletion timestamp for requesting user to hide all messages prior to now
    const deletedAt = conversation.deletedAt ?? [];
    const existingIndex = deletedAt.findIndex((d) => d.userId === userId);
    const now = Date.now();
    if (existingIndex > -1) {
      deletedAt[existingIndex].timestamp = now;
    } else {
      deletedAt.push({ userId, timestamp: now });
    }

    // Ensure conversation remains in user's chat list (not in deletedFor)
    const deletedFor = (conversation.deletedFor ?? []).filter((id) => id !== userId);

    // Clear unread flag for this user
    const unreadBy = (conversation.unreadBy ?? []).filter((id) => id !== userId);

    await ctx.db.patch(args.conversationId, {
      deletedAt,
      deletedFor,
      unreadBy,
    });

    return {
      success: true,
      clearedAt: now,
    };
  },
});

// Pin Message in Conversation
export const pinMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    messageId: v.id("messages"),
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

    const message = await ctx.db.get(args.messageId);
    if (!message || message.conversationId !== args.conversationId) {
      throw new Error("Message not found in this conversation");
    }

    if (message.deletedForEveryone) {
      throw new Error("Cannot pin a deleted message");
    }

    const sender = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", message.senderId))
      .first();

    const senderName = sender
      ? `${sender.firstName || ""} ${sender.lastName || ""}`.trim() || sender.username
      : "User";

    const isVoice = message.type === "voice" || 
      (message.attachments && (message.attachments as any[]).some((a) => a.type === "voice"));

    const displayContent = isVoice ? "🎙️ Voice message" : (message.content || "Attachment");

    const pinnedData = {
      messageId: args.messageId,
      content: displayContent,
      senderName,
      pinnedBy: userId,
      pinnedAt: Date.now(),
    };

    await ctx.db.patch(args.conversationId, {
      pinnedMessage: pinnedData,
    });

    return {
      success: true,
      pinnedMessage: pinnedData,
    };
  },
});

// Unpin Message in Conversation
export const unpinMessage = mutation({
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

    await ctx.db.patch(args.conversationId, {
      pinnedMessage: undefined,
    });

    return {
      success: true,
    };
  },
});

// Toggle Pin Message in Conversation
export const togglePinMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    messageId: v.id("messages"),
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

    if (conversation.pinnedMessage?.messageId === args.messageId) {
      // Unpin if currently pinned
      await ctx.db.patch(args.conversationId, {
        pinnedMessage: undefined,
      });
      return {
        success: true,
        isPinned: false,
      };
    } else {
      // Pin new message
      const message = await ctx.db.get(args.messageId);
      if (!message || message.conversationId !== args.conversationId) {
        throw new Error("Message not found in this conversation");
      }

      if (message.deletedForEveryone) {
        throw new Error("Cannot pin a deleted message");
      }

      const sender = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", message.senderId))
        .first();

      const senderName = sender
        ? `${sender.firstName || ""} ${sender.lastName || ""}`.trim() || sender.username
        : "User";

      const isVoice = message.type === "voice" || 
        (message.attachments && (message.attachments as any[]).some((a) => a.type === "voice"));

      const displayContent = isVoice ? "🎙️ Voice message" : (message.content || "Attachment");

      const pinnedData = {
        messageId: args.messageId,
        content: displayContent,
        senderName,
        pinnedBy: userId,
        pinnedAt: Date.now(),
      };

      await ctx.db.patch(args.conversationId, {
        pinnedMessage: pinnedData,
      });

      return {
        success: true,
        isPinned: true,
        pinnedMessage: pinnedData,
      };
    }
  },
});


const ALLOWED_REACTIONS = ["❤️", "🔥", "😂", "👍", "👏", "🎉"];

// Toggle Reaction on a message
export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },

  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (!ALLOWED_REACTIONS.includes(args.emoji)) {
      throw new Error("Invalid reaction emoji");
    }

    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.deletedForEveryone) {
      throw new Error("Cannot react to a deleted message");
    }

    const conversation = await ctx.db.get(message.conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(userId)) {
      throw new Error("Not authorized to react to messages in this conversation");
    }

    const currentReactions = message.reactions ?? [];
    const existingIndex = currentReactions.findIndex((r) => r.userId === userId);

    let updatedReactions: { emoji: string; userId: string }[];
    let actionType: "added" | "changed" | "removed";

    if (existingIndex >= 0) {
      const existing = currentReactions[existingIndex];
      if (existing.emoji === args.emoji) {
        // Same emoji selected again: remove reaction
        updatedReactions = currentReactions.filter((r) => r.userId !== userId);
        actionType = "removed";
      } else {
        // Different emoji selected: replace previous reaction with new emoji
        updatedReactions = currentReactions.map((r) =>
          r.userId === userId ? { emoji: args.emoji, userId } : r
        );
        actionType = "changed";
      }
    } else {
      // First reaction by this user: append to list
      updatedReactions = [...currentReactions, { emoji: args.emoji, userId }];
      actionType = "added";
    }

    await ctx.db.patch(args.messageId, {
      reactions: updatedReactions,
    });

    const isSelfReaction = message.senderId === userId;
    const shouldNotify = !isSelfReaction && (actionType === "added" || actionType === "changed");

    return {
      success: true,
      reactions: updatedReactions,
      actionType,
      shouldNotify,
      messageId: args.messageId,
      conversationId: message.conversationId,
      messageSenderId: message.senderId,
      reactorId: userId,
      emoji: args.emoji,
      messageContent: message.content || (message.type === "voice" ? "Voice message" : ""),
    };
  },
});

// Toggle Reaction Action: persists reaction and triggers notification if applicable
export const toggleReactionAction = action({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
    apiUrl: v.string(),
  },

  async handler(ctx, args) {
    const result: any = await ctx.runMutation(api.messages.toggleReaction, {
      messageId: args.messageId,
      emoji: args.emoji,
    });

    if (result && result.shouldNotify) {
      try {
        const secret = process.env.INTERNAL_SECRET || "circlee_super_secret_token_123";
        const response = await fetch(`${args.apiUrl}/api/notifications/internal-create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": secret,
          },
          body: JSON.stringify({
            fromClerkId: result.reactorId,
            toClerkId: result.messageSenderId,
            type: "REACTION",
            targetType: "Conversation",
            targetId: result.conversationId,
            messageId: result.messageId,
            messagePreview: result.messageContent,
            content: result.emoji,
          }),
        });
        console.log("Internal reaction notification create HTTP status:", response.status);
      } catch (err) {
        console.error("Failed to trigger reaction notification creation:", err);
      }
    }

    return result;
  },
});
