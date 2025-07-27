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

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["events"] });
      await queryClient.cancelQueries({ queryKey: ["calendar"] });
      await queryClient.cancelQueries({ queryKey: ["rsvp", eventId] });

      // Snapshot previous values
      const previousEvents = queryClient.getQueryData(["events"]);
      const previousCalendar = queryClient.getQueryData(["calendar"]);
      const previousRSVP = queryClient.getQueryData(["rsvp", eventId]);

      // Optimistically update events data
      queryClient.setQueryData(["events"], (old: EventData | undefined) => {
        if (!old?.events) return old;

        return {
          events: old.events.map((event) => {
            if (event.id === eventId) {
              // Remove user from old status arrays
              const filteredAttendees = (event.attendees || []).filter(
                (attendee) => attendee.userId !== user.id
              );

              // Add user to new status
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

      // Optimistically update RSVP status
      queryClient.setQueryData(["rsvp", eventId], { status });

      return { previousEvents, previousCalendar, previousRSVP, eventId };
    },
    onSuccess: (_, variables) => {
      // Show success message based on status
      const statusMessages = {
        yes: "You're attending this event! 🎉",
        no: "You've declined this event",
        maybe: "You've marked yourself as maybe attending 🤔",
        pending: "RSVP updated",
      };

      toast.success(
        statusMessages[variables.status as keyof typeof statusMessages]
      );

      // Refresh data to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
    onError: (error: Error, variables, context) => {
      // Rollback optimistic updates
      if (context) {
        if (context.previousEvents) {
          queryClient.setQueryData(["events"], context.previousEvents);
        }
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
      toast.error(error.message || "Failed to update RSVP");
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
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}
