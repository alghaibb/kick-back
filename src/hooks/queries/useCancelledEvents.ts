"use client";

import { useQuery } from "@tanstack/react-query";

export interface CancelledEventData {
  id: string;
  name: string;
  description?: string;
  location?: string;
  date: string;
  groupId?: string;
  createdBy: string;
  isRecurring: boolean;
  recurrenceId?: string | null;
  recurrenceRule?: string | null;
  cancelledDate?: string;
}

interface CancelledEventsResponse {
  events: CancelledEventData[];
  groups: { id: string; name: string }[];
  userTimezone: string;
}

export function useCancelledEvents() {
  return useQuery({
    queryKey: ["cancelled-events"],
    queryFn: async (): Promise<CancelledEventsResponse> => {
      const response = await fetch("/api/events/cancelled");

      if (!response.ok) {
        throw new Error("Failed to fetch cancelled events");
      }

      return response.json();
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
