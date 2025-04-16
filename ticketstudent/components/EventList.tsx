"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

function EventList() {
  const events = useQuery(api.events.get);
  return (
    <div>EventList</div>
  )
}

export default EventList