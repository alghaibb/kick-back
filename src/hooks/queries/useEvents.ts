"use client";

import { useQuery } from "@tanstack/react-query";

export interface EventData {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  date: string;
  groupId: string | null;
  createdBy: string;
}

export interface GroupData {
  id: string;
  name: string;
}

export interface EventsResponse {
  events: EventData[];
  groups: GroupData[];
  userTimezone?: string;
}

async function fetchEvents(): Promise<EventsResponse> {
  const response = await fetch("/api/events", {
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error("Failed to fetch events");
  }

  return response.json();
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
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
    // Refetch every 5 minutes in the background to keep events fresh
    refetchInterval: 5 * 60 * 1000,
  });
} 