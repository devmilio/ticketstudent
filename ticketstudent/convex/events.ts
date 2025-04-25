import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { DURATIONS, TICKET_STATUS, WAITING_LIST_STATUS } from "@/convex/constants";
import { internalCheckAvailability } from "@/lib/utils";
import { internal } from "./_generated/api";

  export const get = query({
    args: {},
    handler: async (ctx) => {
      return await ctx.db
        .query("events")
        // check for events where "is_cancelled" is undefined : ongoing events
        .filter((q) => q.eq(q.field("is_cancelled"), undefined))
        .collect();
    },
  });

  export const getById = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, { eventId }) => {
      return await ctx.db.get(eventId);
    },
  });

  export const checkAvailability = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, { eventId }) => {
      return await internalCheckAvailability(ctx, eventId);
    },
  });


  export const joinWaitingList = mutation({

    args: { eventId: v.id("events"), userId: v.string() },
    handler: async (ctx, { eventId, userId }) => {

    // TODO: Ratelimiter

    // First check if user already has an active entry in waiting list for this event
    const existingEntry = await ctx.db
    .query("waitingList")
    .withIndex("by_user_event", (q) =>
      q.eq("userId", userId).eq("eventId", eventId)
    )
    // Active means any status except EXPIRED
    .filter((q) => q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
    .first();

    // Don't allow duplicate entries
    if (existingEntry) {
      throw new Error("Already in waiting list for this event");
    }

    // Verify the event exists
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Check if there are any available tickets right now
    const { available } = await internalCheckAvailability(ctx, eventId );

    const now = Date.now();

    if (available) {
      // If tickets are available, create an offer entry
      const waitingListId = await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.OFFERED, // Mark as offered
        offerExpiresAt: now + DURATIONS.TICKET_OFFER, // Set expiration time
      });

      // Schedule a job to expire this offer after the offer duration
      await ctx.scheduler.runAfter(
        DURATIONS.TICKET_OFFER,
        internal.waitingList.expireOffer,
        {
          waitingListId,
          eventId,
        }
      );
    } else {
      // If no tickets available, add to waiting list
      await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.WAITING, // Mark as waiting
      });
    }

    // Return appropriate status message
    return {
      success: true,
      status: available
        ? WAITING_LIST_STATUS.OFFERED // If available, status is offered
        : WAITING_LIST_STATUS.WAITING, // If not available, status is waiting
      message: available
        ? "Ticket offered - you have 30 minutes to purchase"
        : "Added to waiting list - you'll be notified when a ticket becomes available",
    };
    
    }
  });