"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Spinner from "@/components/Spinner";

function EventList() {
  const events = useQuery(api.events.get);

  // loading
  if (events === undefined) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner/>
      </div>
    );
  }

  // no events
  if (events.length === 0) {
    return <div>No events found.</div>;
  }

  // events found
  const validEvents = events
    .filter(event =>
      typeof event.eventDate === 'number' &&
      !isNaN(event.eventDate)
      // && event.is_cancelled !== true
    )
  // TODO People must be able to buy tickets after the show has started (change events def)
  const pastEvents = validEvents
    .filter(event =>
      event.eventDate < Date.now()
    )
    .sort((a,b) => b.eventDate - a.eventDate);

  const upcomingEvents = validEvents
    .filter( event =>
      event.eventDate > Date.now()
    )
    .sort((a,b) => a.eventDate - b.eventDate);

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event._id} className="border p-4 rounded shadow">
          <h2 className="text-xl font-bold">{event.name}</h2>
          <p>{event.description}</p>
          <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleString()}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Price:</strong> ${event.price.toFixed(2)}</p>
          <p><strong>Tickets:</strong> {event.totalTickets}</p>
          {event.is_cancelled && <p className="text-red-600 font-semibold">Cancelled</p>}
        </div>
      ))}
    </div>
  );
}

export default EventList;