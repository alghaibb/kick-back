"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export interface EventCommentData {
  id: string;
  content: string;
  eventId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    nickname: string | null;
    image: string | null;
  };
}

async function fetchEventComments(
  eventId: string
): Promise<EventCommentData[]> {
  const response = await fetch(`/api/events/${eventId}/comments`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }

  return response.json();
}

export function useEventComments(eventId: string) {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Calculate polling interval based on recent activity
  const getPollingInterval = () => {
    const timeSinceActivity = Date.now() - lastActivity;

    // If activity within last 2 minutes: poll every 10 seconds (very aggressive)
    if (timeSinceActivity < 2 * 60 * 1000) return 10 * 1000;

    // If activity within last 10 minutes: poll every 30 seconds  
    if (timeSinceActivity < 10 * 60 * 1000) return 30 * 1000;

    // Otherwise: poll every 3 minutes (efficient when idle)
    return 3 * 60 * 1000;
  };

  const query = useQuery({
    queryKey: ["event-comments", eventId],
    queryFn: () => fetchEventComments(eventId),
    enabled: !!eventId,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: getPollingInterval(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Update activity timestamp when new comments arrive
  useEffect(() => {
    if (query.data && query.data.length > 0) {
      const latestComment = query.data[query.data.length - 1];
      const commentTime = new Date(latestComment.createdAt).getTime();

      // If comment is recent (within 5 minutes), mark as activity
      if (Date.now() - commentTime < 5 * 60 * 1000) {
        setLastActivity(Date.now());
      }
    }
  }, [query.data]);

  return query;
}
