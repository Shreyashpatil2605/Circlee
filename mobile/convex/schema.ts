import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(),
    profilePicture: v.string(),
    isOnline: v.optional(v.boolean()),
  }).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    participants: v.array(v.string()),
    lastMessage: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    lastMessageFrom: v.optional(v.string()),
    unreadBy: v.optional(v.array(v.string())),
    typingBy: v.optional(v.string()),
  }),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
    createdAt: v.number(),
    readBy: v.optional(v.array(v.string())),
    type: v.optional(v.string()), // "text" | "voice"
    audioUrl: v.optional(v.string()),
    attachments: v.optional(
      v.array(
        v.object({
          type: v.string(), // "voice" | "image" | "video" | etc.
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
  })
    .index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"]),

  notification_events: defineTable({
    toUserId: v.string(),
    createdAt: v.number(),
  }).index("by_receiver", ["toUserId"]),
});

