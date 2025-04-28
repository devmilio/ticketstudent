"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function ReleaseTicket({
  eventId,
  waitingListId,
}: {
  eventId: Id<"events">;
  waitingListId: Id<"waitingList">;
}) {
  const [isReleasing, setIsReleasing] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false); // State to control the AlertDialog visibility
  const releaseTicket = useMutation(api.waitingList.releaseTicket);

  const handleRelease = async () => {
    try {
      setIsReleasing(true);
      await releaseTicket({
        eventId,
        waitingListId,
      });
      setDialogOpen(false); // Close dialog after success
    } catch (error) {
      console.error("Erreur lors de la libération du billet", error);
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <>
      <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <button
            onClick={() => setDialogOpen(true)}
            disabled={isReleasing}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            {isReleasing ? "Libération du billet..." : "Libérer le billet"}
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la libération du billet</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir libérer ce billet pour l'événement ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex justify-end space-x-2">
            <AlertDialogCancel
              onClick={() => setDialogOpen(false)}
              className="py-2 px-4 text-gray-700 hover:bg-gray-200 rounded-md"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRelease}
              className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Libérer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ReleaseTicket;
