import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendNotificationEvent = mutation({
  args: {
    toUserId: v.string(),
  },
  async handler(ctx, args) {
    // Clean up old events for this user to keep storage light (keep only latest 5)
    const existingEvents = await ctx.db
      .query("notification_events")
      .withIndex("by_receiver", (q) => q.eq("toUserId", args.toUserId))
      .order("desc")
      .collect();

    if (existingEvents.length >= 5) {
      // Delete older events
      const toDelete = existingEvents.slice(4);
      for (const event of toDelete) {
        await ctx.db.delete(event._id);
      }
    }

    return await ctx.db.insert("notification_events", {
      toUserId: args.toUserId,
      createdAt: Date.now(),
    });
  },
});

export const watchNotificationEvents = query({
  args: {
    toUserId: v.string(),
  },
  async handler(ctx, args) {
    if (!args.toUserId) return [];
    return await ctx.db
      .query("notification_events")
      .withIndex("by_receiver", (q) => q.eq("toUserId", args.toUserId))
      .order("desc")
      .collect();
  },
});
