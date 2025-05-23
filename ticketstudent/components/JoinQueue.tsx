"use client";

import { Id } from "@/convex/_generated/dataModel";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WAITING_LIST_STATUS } from "@/convex/constants";
import { Clock, OctagonXIcon } from "lucide-react";
import { ConvexError } from "convex/values";
import Spinner from "./Spinner";

export default function JoinQueue({
    eventId,
    userId,
  }: {
    eventId: Id<"events">;
    userId: Id<"users">;
  }) {

    const joinWaitingList = useMutation(api.events.joinWaitingList);
    const queuePosition = useQuery(api.waitingList.getQueuePosition, {
      eventId,
      userId,
    });
    const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
      eventId,
      userId,
    });
    const availability = useQuery(api.events.checkAvailability, { eventId });
    const event = useQuery(api.events.getById, { eventId });
  
    const isEventOwner = userId === event?.userId;

    const handleJoinQueue = async () => {
        try {
          const result = await joinWaitingList({ eventId, userId });
          if (result.success) {
            console.log("Successfully joined waiting list");
          }
        } catch (error) {
          if (
            error instanceof ConvexError &&
            error.message.includes("joined the waiting list too many times")
          ) {
            /* toast({
              variant: "destructive",
              title: "Slow down there!",
              description: error.data,
              duration: 5000,
            }) */;
          } else {
            console.error("Error joining waiting list:", error);
            /* toast({
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description: "Failed to join queue. Please try again later.",
            }) */;
          }
        }
      };
    
      if (queuePosition === undefined || availability === undefined || !event) {
        return <Spinner />;
      }
    
      if (userTicket) {
        return null;
      }
    
      const isPastEvent = event.eventDate < Date.now();
    
      return (
        <div>
          {(!queuePosition ||
            queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
            (queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
              queuePosition.offerExpiresAt &&
              queuePosition.offerExpiresAt <= Date.now())) && (
            <>
              {isEventOwner ? (
                <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg">
                  <OctagonXIcon className="w-5 h-5" />
                  <span>Vous ne pouvez pas acheter de billet pour votre propre événement</span>
                </div>
              ) : isPastEvent ? (
                <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                  <Clock className="w-5 h-5" />
                  <span>L'événement est terminé</span>
                </div>
              ) : availability.purchasedCount >= availability?.totalTickets ? (
                <div className="text-center p-4">
                  <p className="text-lg font-semibold text-red-600">
                  Désolé, cet événement est complet
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleJoinQueue}
                  disabled={isPastEvent || isEventOwner}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md
                  flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Acheter un billet
                </button>
              )}
            </>
          )}
        </div>
      );
    }