"use client";

import Spinner from "@/components/Spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import JoinQueue from "@/components/JoinQueue";

function EventPage() {
  const { user } = useUser();
  const params = useParams();

  const event = useQuery(api.events.getById, {
    eventId: params.id as Id<"events">,
  });

  const availability = useQuery(api.events.checkAvailability, {
    eventId: params.id as Id<"events">,
  });

  const imageUrl = useStorageUrl(event?.imageStorageId);

  if (!event || !availability) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const locationToDisplay = event.address || event.location;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {imageUrl && (
            <div className="relative w-full aspect-[21/9] sm:aspect-[35/9]">
              <Image
                src={imageUrl}
                alt={event.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Right Column - Ticket Card */}
              <div>
                <div className="sticky top-8 space-y-4">
                  <EventCard eventId={params.id as Id<"events">} />

                  {user ? (
                    <JoinQueue
                      eventId={params.id as Id<"events">}
                      userId={user.id as Id<"users">}
                    />
                  ) : (
                    <SignInButton>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                        Connectez-vous pour acheter des billets
                      </Button>
                    </SignInButton>
                  )}
                </div>
              </div>

              {/* Left Column - Event Details */}
              <div className="space-y-8">
                {/* Event Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <InfoCard
                    icon={<CalendarDays className="w-5 h-5 mr-2 text-blue-600" />}
                    title="Date"
                    content={new Date(event.eventDate).toLocaleDateString()}
                  />
                  <InfoCard
                    icon={<MapPin className="w-5 h-5 mr-2 text-blue-600" />}
                    title="Endroit"
                    content={locationToDisplay}
                  />
                  <InfoCard
                    icon={<Ticket className="w-5 h-5 mr-2 text-blue-600" />}
                    title="Prix"
                    content={`$${event.price.toFixed(2)}`}
                  />
                  <InfoCard
                    icon={<Users className="w-5 h-5 mr-2 text-blue-600" />}
                    title="Disponibilité"
                    content={`${availability.totalTickets - availability.purchasedCount} / ${availability.totalTickets} restant`}
                  />
                </div>

                {/* Map Section */}

                {/* Additional Info */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Informations sur l'événement
                  </h3>
                  <ul className="space-y-2 text-blue-700">
                    <li>• Veuillez arriver 30 minutes avant le début de l'événement</li>
                    <li>• Restriction d'âge : 18+</li>
                  </ul>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
      <div className="flex items-center text-gray-600 mb-1">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-gray-900">{content}</p>
    </div>
  );
}

export default EventPage;
