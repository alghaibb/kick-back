"use client";

import { useQuery } from "@tanstack/react-query";
import { useSmartPolling } from "@/hooks/useSmartPolling";

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
      nickname: string | null;
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
  const { pollingInterval } = useSmartPolling({ strategy: "ultra-fast" });

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
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: true, // Re-enable for instant updates when switching tabs
    refetchOnReconnect: true,
  });

  return query;
}
