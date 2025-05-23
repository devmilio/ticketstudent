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

  export const search = query({
    args: { searchTerm: v.string() },
    handler: async (ctx, { searchTerm }) => {
      const events = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("is_cancelled"), undefined))
        .collect();
  
      return events.filter((event) => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          event.name.toLowerCase().includes(searchTermLower) ||
          event.description.toLowerCase().includes(searchTermLower) ||
          event.location.toLowerCase().includes(searchTermLower)
        );
      });
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

  export const create = mutation({
    args: {
      name: v.string(),
      description: v.string(),
      location: v.string(),
      eventDate: v.number(), // Store as timestamp
      price: v.number(),
      totalTickets: v.number(),
      userId: v.string(),
    },
    handler: async (ctx, args) => {
      const eventId = await ctx.db.insert("events", {
        name: args.name,
        description: args.description,
        location: args.location,
        eventDate: args.eventDate,
        price: args.price,
        totalTickets: args.totalTickets,
        userId: args.userId,
      });
      return eventId;
    },
  });

  export const updateEvent = mutation({
    args: {
      eventId: v.id("events"),
      name: v.string(),
      description: v.string(),
      location: v.string(),
      eventDate: v.number(),
      price: v.number(),
      totalTickets: v.number(),
    },
    handler: async (ctx, args) => {
      const { eventId, ...updates } = args;
  
      // Get current event to check tickets sold
      const event = await ctx.db.get(eventId);
      if (!event) throw new Error("Event not found");
  
      const soldTickets = await ctx.db
        .query("tickets")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .filter((q) =>
          q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used"))
        )
        .collect();
  
      // Ensure new total tickets is not less than sold tickets
      if (updates.totalTickets < soldTickets.length) {
        throw new Error(
          `Cannot reduce total tickets below ${soldTickets.length} (number of tickets already sold)`
        );
      }
  
      await ctx.db.patch(eventId, updates);
      return eventId;
    },
  });

  // Purchase ticket
export const purchaseTicket = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    waitingListId: v.id("waitingList"),
    paymentInfo: v.object({
      paymentIntentId: v.string(),
      amount: v.number(),
    }),
  },
  handler: async (ctx, { eventId, userId, waitingListId, paymentInfo }) => {
    console.log("Starting purchaseTicket handler", {
      eventId,
      userId,
      waitingListId,
    });

    // Verify waiting list entry exists and is valid
    const waitingListEntry = await ctx.db.get(waitingListId);
    console.log("Waiting list entry:", waitingListEntry);

    if (!waitingListEntry) {
      console.error("Waiting list entry not found");
      throw new Error("Waiting list entry not found");
    }

    if (waitingListEntry.status !== WAITING_LIST_STATUS.OFFERED) {
      console.error("Invalid waiting list status", {
        status: waitingListEntry.status,
      });
      throw new Error(
        "Invalid waiting list status - ticket offer may have expired"
      );
    }

    if (waitingListEntry.userId !== userId) {
      console.error("User ID mismatch", {
        waitingListUserId: waitingListEntry.userId,
        requestUserId: userId,
      });
      throw new Error("Waiting list entry does not belong to this user");
    }

    // Verify event exists and is active
    const event = await ctx.db.get(eventId);
    console.log("Event details:", event);

    if (!event) {
      console.error("Event not found", { eventId });
      throw new Error("Event not found");
    }

    if (event.is_cancelled) {
      console.error("Attempted purchase of cancelled event", { eventId });
      throw new Error("Event is no longer active");
    }

    try {
      console.log("Creating ticket with payment info", paymentInfo);
      // Create ticket with payment info
      await ctx.db.insert("tickets", {
        eventId,
        userId,
        purchasedAt: Date.now(),
        status: TICKET_STATUS.VALID,
        paymentIntentId: paymentInfo.paymentIntentId,
        amount: paymentInfo.amount,
      });

      console.log("Updating waiting list status to purchased");
      await ctx.db.patch(waitingListId, {
        status: WAITING_LIST_STATUS.PURCHASED,
      });

      console.log("Processing queue for next person");
      // Process queue for next person
      //await processQueue(ctx, { eventId });
      await ctx.runMutation(internal.waitingList.processQueue, { eventId });

      console.log("Purchase ticket completed successfully");
    } catch (error) {
      console.error("Failed to complete ticket purchase:", error);
      throw new Error(`Failed to complete ticket purchase: ${error}`);
    }
  },
});

