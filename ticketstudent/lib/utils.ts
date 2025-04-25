import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DatabaseReader, DatabaseWriter } from "@/convex/_generated/server";
import { TICKET_STATUS, WAITING_LIST_STATUS } from "@/convex/constants";
import { clsx, type ClassValue } from "clsx"
import { useQuery } from "convex/react";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useStorageUrl(storageId: Id<"_storage"> | undefined) {
  return useQuery(api.storage.getUrl, storageId ? { storageId } : "skip");
}

export async function internalCheckAvailability(
  ctx: { db: DatabaseReader | DatabaseWriter },
  eventId: Id<"events">
) {
  const event = await ctx.db.get(eventId);
  if (!event) throw new Error("Event not found");

  const purchasedCount = await ctx.db
    .query("tickets")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .collect()
    .then(
      (tickets) =>
        tickets.filter(
          (t) =>
            t.status === TICKET_STATUS.VALID ||
            t.status === TICKET_STATUS.USED
        ).length
    );

  const now = Date.now();
  const activeOffers = await ctx.db
    .query("waitingList")
    .withIndex("by_event_status", (q) =>
      q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
    )
    .collect()
    .then(
      (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
    );

  const totalReserved = purchasedCount + activeOffers;

  return {
    available: totalReserved < event.totalTickets,
    availableSpots: Math.max(0, event.totalTickets - totalReserved),
    isSoldOut: totalReserved >= event.totalTickets,
    totalTickets: event.totalTickets,
    purchasedCount,
    activeOffers,
  };
}
