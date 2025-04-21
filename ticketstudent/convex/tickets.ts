import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getUserTicketForEvent = query({
    args: {
      eventId: v.id("events"),
      userId: v.string(),
    },
    handler: async (ctx, { eventId, userId }) => {
      const ticket = await ctx.db
        .query("tickets")
        .withIndex("by_user_event", (q) =>
          q.eq("userId", userId).eq("eventId", eventId)
        )
        // returns (1) ticket that can have a quantity > 1
        // TODO: deal when a user buy tickets on 2 separate occasions (for the same event)
        .first();
  
      return ticket;
    },
  });