"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

function EventList() {
  const events = useQuery(api.events.get);

  if (events === undefined) {
    return <div>Loading events...</div>;
  }

  if (events.length === 0) {
    return <div>No events found.</div>;
  }

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