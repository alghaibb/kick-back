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

  // Calculate polling interval based on recent activity
  const getPollingInterval = () => {
    const timeSinceActivity = Date.now() - lastActivity;

    // If activity within last 2 minutes: poll every 15 seconds (very aggressive)
    if (timeSinceActivity < 2 * 60 * 1000) return 15 * 1000;

    // If activity within last 10 minutes: poll every 1 minute  
    if (timeSinceActivity < 10 * 60 * 1000) return 60 * 1000;

    // Otherwise: poll every 5 minutes (efficient when idle)
    return 5 * 60 * 1000;
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
    staleTime: 30 * 1000, // Reduce to 30 seconds for faster RSVP updates
    gcTime: 15 * 60 * 1000,
    refetchInterval: getPollingInterval(),
    refetchOnWindowFocus: false,
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