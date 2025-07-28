"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { RSVPStatus } from "@/types/rsvp";

interface RSVPMutationData {
  eventId: string;
  status: RSVPStatus;
}

interface EventData {
  events: Array<{
    id: string;
    attendees: Array<{
      id: string;
      userId: string;
      eventId: string;
      rsvpStatus: RSVPStatus;
      user: {
        id: string;
        firstName: string;
        nickname: string | null;
        image: string | null;
      };
    }>;
    [key: string]: unknown;
  }>;
}

// Hook to update RSVP status
export function useRSVPMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
    onMutate: async ({ eventId, status }) => {
      if (!user?.id) return;

      // Cancel any outgoing refetches (don't cancel events - it doesn't have attendee data)
      await queryClient.cancelQueries({ queryKey: ["calendar"] });
      await queryClient.cancelQueries({ queryKey: ["rsvp", eventId] });

      // Snapshot previous values (don't snapshot events - we're not updating it)
      const previousCalendar = queryClient.getQueryData(["calendar"]);
      const previousRSVP = queryClient.getQueryData(["rsvp", eventId]);

      // Optimistically update calendar data
      queryClient.setQueryData(["calendar"], (old: EventData | undefined) => {
        if (!old?.events) return old;

        return {
          events: old.events.map((event) => {
            if (event.id === eventId) {
              const filteredAttendees = (event.attendees || []).filter(
                (attendee) => attendee.userId !== user.id
              );

              const newAttendee = {
                id: `temp-${user.id}-${eventId}`,
                userId: user.id,
                eventId,
                rsvpStatus: status,
                user: {
                  id: user.id,
                  firstName: user.firstName,
                  nickname: user.nickname,
                  image: user.image,
                },
              };

              return {
                ...event,
                attendees: [...filteredAttendees, newAttendee],
              };
            }
            return event;
          }),
        };
      });


      // Optimistically update RSVP status query (this is what the buttons use!)
      queryClient.setQueryData(["rsvp", eventId], { rsvpStatus: status });

      return { previousCalendar, previousRSVP, eventId };
    },
    onSuccess: (_, variables) => {
      // Show success message based on status
      const statusMessages = {
        yes: "You're attending! 🎉",
        no: "You've declined",
        maybe: "Maybe attending 🤔",
        pending: "RSVP updated",
      };

      toast.success(
        statusMessages[variables.status as keyof typeof statusMessages]
      );

      // Background sync - invalidate queries for fresh data
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["rsvp", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error, variables, context) => {
      // Rollback optimistic updates
      if (context) {
        if (context.previousCalendar) {
          queryClient.setQueryData(["calendar"], context.previousCalendar);
        }
        if (context.previousRSVP) {
          queryClient.setQueryData(
            ["rsvp", context.eventId],
            context.previousRSVP
          );
        }
      }

      console.error("RSVP error:", error);
      toast.error(error.message || "Failed to update RSVP. Please try again.");
    },
  });
}

// Hook to fetch current user's RSVP status for an event
export function useRSVPStatus(eventId: string) {
  return useQuery({
    queryKey: ["rsvp", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/rsvp`);
      if (!response.ok) {
        throw new Error("Failed to fetch RSVP status");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Increase from 30s to 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnReconnect: true, // Only refetch when reconnecting
  });
}
