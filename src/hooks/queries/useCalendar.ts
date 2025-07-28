"use client";

import { useQuery } from "@tanstack/react-query";

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
  return useQuery({
    queryKey: ["calendar"],
    queryFn: async (): Promise<CalendarResponse> => {
      const response = await fetch("/api/calendar");
      if (!response.ok) {
        throw new Error("Failed to fetch calendar events");
      }
      const data = await response.json();
      return data;
    },
    staleTime: 0,
    refetchInterval: 15000, 
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
} 