"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RSVPStatus } from "@/types/rsvp";

interface RSVPMutationData {
  eventId: string;
  status: RSVPStatus;
}

// Hook to update RSVP status
export function useRSVPMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, status }: RSVPMutationData) => {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update RSVP");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["rsvp", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });

      // Show success message based on status
      const statusMessages = {
        yes: "You're attending this event! 🎉",
        no: "You've declined this event",
        maybe: "You've marked yourself as maybe attending",
        pending: "RSVP updated"
      };

      toast.success(statusMessages[variables.status as keyof typeof statusMessages]);
    },
    onError: (error: Error) => {
      console.error("RSVP error:", error);
      toast.error(error.message || "Failed to update RSVP");
    },
  });
}

// Hook to get user's RSVP status for an event
export function useRSVPStatus(eventId: string) {
  return useQuery({
    queryKey: ["rsvp", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/rsvp`);

      if (!response.ok) {
        if (response.status === 403) {
          // User not invited to event
          return null;
        }
        throw new Error("Failed to fetch RSVP status");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 