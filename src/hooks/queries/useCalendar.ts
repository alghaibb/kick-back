"use client";

import { useQuery } from "@tanstack/react-query";
import { useSmartPolling } from "@/hooks/useSmartPolling";

export interface CalendarEvent {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  color?: string;
  groupId: string | null;
  createdBy: string;
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
      lastName?: string | null;
      image?: string | null;
    };
    rsvpStatus: string;
  }[];
  isRecurring?: boolean;
  recurrenceId?: string | null;
  recurrenceRule?: string | null;
}

export interface CalendarResponse {
  events: CalendarEvent[];
}

export function useCalendar() {
  const { pollingInterval } = useSmartPolling({ strategy: "ultra-fast" });

  const query = useQuery({
    queryKey: ["calendar"],
    queryFn: async (): Promise<CalendarResponse> => {
      const response = await fetch("/api/calendar", {
        cache: "no-store",
        headers: { "cache-control": "no-store" },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch calendar events");
      }
      const data = await response.json();
      return data;
    },
    staleTime: 0, // force fresh to avoid bouncing after optimistic update
    gcTime: 15 * 60 * 1000,
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  return query;
}
