"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface FavoriteEventVariables {
  eventId: string;
  isFavorited: boolean;
}

interface EventWithFavorite {
  id: string;
  isFavorited?: boolean;
  _count?: {
    favorites?: number;
  };
}

interface EventsResponse {
  events: EventWithFavorite[];
}

interface CalendarResponse {
  events: EventWithFavorite[];
}

interface DashboardStatsResponse {
  savedEventsCount?: number;
}

interface MutationContext {
  previousEvents?: EventsResponse;
  previousCalendar?: CalendarResponse;
  previousFavorites?: EventsResponse;
  previousStats?: DashboardStatsResponse;
}

export function useToggleEventFavorite() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, FavoriteEventVariables, MutationContext>({
    mutationFn: async ({ eventId, isFavorited }) => {
      const response = await fetch(`/api/events/${eventId}/favorite`, {
        method: isFavorited ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update favorite");
      }
    },
    onMutate: async ({ eventId, isFavorited }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["events"] });
      await queryClient.cancelQueries({ queryKey: ["calendar"] });
      await queryClient.cancelQueries({ queryKey: ["favorite-events"] });
      await queryClient.cancelQueries({ queryKey: ["dashboard-stats"] });

      // Snapshot the previous values
      const previousEvents = queryClient.getQueryData<EventsResponse>([
        "events",
      ]);
      const previousCalendar = queryClient.getQueryData<CalendarResponse>([
        "calendar",
      ]);
      const previousFavorites = queryClient.getQueryData<EventsResponse>([
        "favorite-events",
      ]);
      const previousStats = queryClient.getQueryData<DashboardStatsResponse>([
        "dashboard-stats",
      ]);

      // Optimistically update events query
      queryClient.setQueryData<EventsResponse>(["events"], (old) => {
        if (!old) return old;
        return {
          ...old,
          events: old.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  isFavorited: !isFavorited,
                  _count: {
                    ...event._count,
                    favorites:
                      (event._count?.favorites || 0) + (isFavorited ? -1 : 1),
                  },
                }
              : event
          ),
        };
      });

      // Optimistically update calendar query
      queryClient.setQueryData<CalendarResponse>(["calendar"], (old) => {
        if (!old) return old;
        return {
          ...old,
          events: old.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  isFavorited: !isFavorited,
                  _count: {
                    ...event._count,
                    favorites:
                      (event._count?.favorites || 0) + (isFavorited ? -1 : 1),
                  },
                }
              : event
          ),
        };
      });

      // Optimistically update favorite events query
      if (isFavorited) {
        // Removing from favorites
        queryClient.setQueryData<EventsResponse>(["favorite-events"], (old) => {
          if (!old) return old;
          return {
            ...old,
            events: old.events.filter((event) => event.id !== eventId),
          };
        });
      } else {
        // Adding to favorites - add the event optimistically if we have it
        const eventFromEvents = previousEvents?.events.find(
          (e) => e.id === eventId
        );
        const eventFromCalendar = previousCalendar?.events.find(
          (e) => e.id === eventId
        );
        const eventData = eventFromEvents || eventFromCalendar;

        if (eventData) {
          queryClient.setQueryData<EventsResponse>(
            ["favorite-events"],
            (old) => {
              if (!old)
                return { events: [{ ...eventData, isFavorited: true }] };
              return {
                ...old,
                events: [...old.events, { ...eventData, isFavorited: true }],
              };
            }
          );
        } else {
          // If we don't have the event data, invalidate to fetch it
          queryClient.invalidateQueries({
            queryKey: ["favorite-events"],
            refetchType: "inactive",
          });
        }
      }

      // Optimistically update dashboard stats
      queryClient.setQueryData<DashboardStatsResponse>(
        ["dashboard-stats"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            savedEventsCount:
              (old.savedEventsCount || 0) + (isFavorited ? -1 : 1),
          };
        }
      );

      return {
        previousEvents,
        previousCalendar,
        previousFavorites,
        previousStats,
      };
    },
    onError: (_err, { isFavorited }, context) => {
      // Rollback on error
      if (context?.previousEvents) {
        queryClient.setQueryData(["events"], context.previousEvents);
      }
      if (context?.previousCalendar) {
        queryClient.setQueryData(["calendar"], context.previousCalendar);
      }
      if (context?.previousFavorites) {
        queryClient.setQueryData(
          ["favorite-events"],
          context.previousFavorites
        );
      }
      if (context?.previousStats) {
        queryClient.setQueryData(["dashboard-stats"], context.previousStats);
      }

      toast.error(
        isFavorited ? "Failed to remove from saved" : "Failed to save event"
      );
    },
    onSuccess: (_data, { isFavorited }) => {
      toast.success(isFavorited ? "Removed from saved events" : "Event saved");
    },
    onSettled: () => {
      // Refetch in the background after 500ms to sync with server
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["events"],
          refetchType: "inactive",
        });
        queryClient.invalidateQueries({
          queryKey: ["calendar"],
          refetchType: "inactive",
        });
        queryClient.invalidateQueries({
          queryKey: ["favorite-events"],
          refetchType: "inactive",
        });
        queryClient.invalidateQueries({
          queryKey: ["dashboard-stats"],
          refetchType: "inactive",
        });
      }, 500);
    },
  });
}
