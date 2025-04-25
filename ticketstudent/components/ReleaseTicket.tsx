"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { XCircle } from "lucide-react";

function ReleaseTicket({eventId, waitingListId,}: {eventId: Id<"events">; waitingListId: Id<"waitingList">;}){

  const [isReleasing, setIsReleasing] = useState(false);
  const releaseTicket = useMutation(api.waitingList.releaseTicket);
  
  const handleRelease = async () => {
    if (!confirm("Êtes-vous sûr de vouloir libérer votre billet ?")) return;

    try {
      setIsReleasing(true);
      await releaseTicket({
        eventId,
        waitingListId,
      });
    } catch (error) {
      console.error("Erreur lors de la libération du billet", error);
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <button
      onClick={handleRelease}
      disabled={isReleasing}
      className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <XCircle className="w-4 h-4" />
      {isReleasing ? "Libération du billet..." : "Libérer le billet"}
    </button>
  );
}

export default ReleaseTicket