"use client";

import { useQuery } from "@tanstack/react-query";
import { useSmartPolling } from "@/hooks/useSmartPolling";

export interface EventData {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  date: string;
  groupId: string | null;
  createdBy: string;
  isFavorited?: boolean;
  favoriteCount?: number;
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
  const { pollingInterval } = useSmartPolling({ strategy: "relaxed" });

  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.message === "UNAUTHORIZED") {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: pollingInterval,
  });
}
