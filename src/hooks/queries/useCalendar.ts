"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export interface CalendarEvent {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  group: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  attendees: {
    user: {
      id: string;
      firstName: string;
      lastName: string | null;
      image: string | null;
    };
    rsvpStatus: string;
  }[];
}

export interface CalendarResponse {
  events: CalendarEvent[];
}

export function useCalendar() {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Lightning-fast polling for instant RSVP updates like Facebook events
  const getPollingInterval = () => {
    const timeSinceActivity = Date.now() - lastActivity;

    // If activity within last 30 seconds: poll every 1 second (Facebook event speed)
    if (timeSinceActivity < 30 * 1000) return 1000;

    // If activity within last 2 minutes: poll every 2 seconds (ultra-fast)
    if (timeSinceActivity < 2 * 60 * 1000) return 2000;

    // If activity within last 5 minutes: poll every 5 seconds (still very fast)
    if (timeSinceActivity < 5 * 60 * 1000) return 5000;

    // If activity within last 15 minutes: poll every 15 seconds
    if (timeSinceActivity < 15 * 60 * 1000) return 15000;

    // Otherwise: poll every 30 seconds (still quite fast)
    return 30000;
  };

  const query = useQuery({
    queryKey: ["calendar"],
    queryFn: async (): Promise<CalendarResponse> => {
      const response = await fetch("/api/calendar");
      if (!response.ok) {
        throw new Error("Failed to fetch calendar events");
      }
      const data = await response.json();
      return data;
    },
    staleTime: 1 * 1000, // 1 second - ultra-fresh data for instant RSVP updates
    gcTime: 15 * 60 * 1000,
    refetchInterval: getPollingInterval(),
    refetchOnWindowFocus: true, // Re-enable for instant updates when switching tabs
    refetchOnReconnect: true,
  });

  // Update activity timestamp when RSVP changes are detected
  useEffect(() => {
    if (query.data?.events && query.data.events.length > 0) {
      const now = Date.now();
      let hasRecentActivity = false;

      // Check for events with any RSVP activity (more than 1 attendee)
      const eventsWithRSVPs = query.data.events.filter(
        event => event.attendees && event.attendees.length > 1
      );

      // Also check for any "yes" RSVPs which indicate active events
      const eventsWithYesRSVPs = query.data.events.filter(
        event => event.attendees && event.attendees.some(a => a.rsvpStatus === "yes")
      );

      if (eventsWithRSVPs.length > 0 || eventsWithYesRSVPs.length > 0) {
        hasRecentActivity = true;
      }

      if (hasRecentActivity) {
        setLastActivity(now);
      }
    }
  }, [query.data]);

  return query;
} 