import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./auth";

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(),
    profilePicture: v.string(),
  },

  async handler(ctx, args) {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) =>
        q.eq("clerkId", args.clerkId)
      )
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      username: args.username,
      profilePicture: args.profilePicture,
      isOnline: true,
      lastSeen: Date.now(),
    });
  },
});

export const updatePresence = mutation({
  args: {
    isOnline: v.boolean(),
    clerkId: v.optional(v.string()),
  },
  async handler(ctx, args) {
    let userId: string | null = null;
    try {
      userId = await getAuthUserId(ctx);
    } catch {
      userId = args.clerkId ?? null;
    }
    if (!userId) {
      userId = args.clerkId ?? null;
    }
    if (!userId) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId!))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        isOnline: args.isOnline,
        lastSeen: Date.now(),
      });
    }
  },
});

export const getUserPresence = query({
  args: {
    clerkId: v.string(),
  },
  async handler(ctx, args) {
    if (!args.clerkId) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    return {
      isOnline: user.isOnline ?? false,
      lastSeen: user.lastSeen ?? null,
    };
  },
});
