"use client";

import { useQuery } from "@tanstack/react-query";

export interface CalendarEvent {
  id: string;
  name: string;
  description?: string;
  location?: string;
  date: string;
  group?: { name: string };
  attendees: { user: { id: string; nickname?: string; firstName?: string }; rsvpStatus: string }[];
}

export interface CalendarResponse {
  events: CalendarEvent[];
}

async function fetchCalendarEvents(): Promise<CalendarResponse> {
  const response = await fetch("/api/calendar", {
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error("Failed to fetch calendar events");
  }

  return response.json();
}

export function useCalendar() {
  return useQuery({
    queryKey: ["calendar"],
    queryFn: fetchCalendarEvents,
    staleTime: 2 * 60 * 1000, // 2 minutes - events don't change super frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized)
      if (error?.message === "UNAUTHORIZED") {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Refetch every 5 minutes in the background to keep calendar fresh
    refetchInterval: 5 * 60 * 1000,
  });
} 