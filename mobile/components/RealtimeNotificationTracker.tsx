import React, { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-expo";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useQueryClient } from "@tanstack/react-query";

export default function RealtimeNotificationTracker() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const events = useConvexQuery(
    api.notificationEvents.watchNotificationEvents,
    userId ? { toUserId: userId } : "skip"
  );

  const prevEventsLengthRef = useRef<number | null>(null);
  const prevLatestTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    if (!events || events.length === 0) {
      prevEventsLengthRef.current = 0;
      prevLatestTimestampRef.current = null;
      return;
    }

    const currentLength = events.length;
    const currentLatestTimestamp = events[0].createdAt;

    if (
      prevEventsLengthRef.current !== null &&
      (currentLength > prevEventsLengthRef.current ||
        (prevLatestTimestampRef.current !== null && currentLatestTimestamp > prevLatestTimestampRef.current))
    ) {
      console.log("New realtime notification event received! Invalidating notifications query...");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }

    prevEventsLengthRef.current = currentLength;
    prevLatestTimestampRef.current = currentLatestTimestamp;
  }, [events, queryClient]);

  return null;
}
