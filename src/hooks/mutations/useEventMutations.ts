"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createEventAction,
  editEventAction,
  deleteEventAction,
  leaveEventAction,
  inviteToEventBatchAction,
  moveEventToDateAction,
} from "@/app/(main)/events/actions";
import { adminEditEventAction } from "@/app/(main)/admin/actions";
import { useDashboardInvalidation } from "@/hooks/queries/useDashboardInvalidation";
import { CreateEventValues } from "@/validations/events/createEventSchema";
import type { CalendarResponse } from "@/hooks/queries/useCalendar";

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { invalidateDashboard } = useDashboardInvalidation();

  return useMutation({
    mutationFn: async (values: CreateEventValues) => {
      const result = await createEventAction(values);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Event created successfully!");
      // Invalidate events data to show new event
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Invalidate calendar data to show new event
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      // Invalidate dashboard stats to update event counts
      invalidateDashboard();
    },
    onError: (error: Error) => {
      console.error("Create event error:", error);
      toast.error(error.message || "Failed to create event");
    },
  });
}

export function useEditEvent() {
  const queryClient = useQueryClient();
  const { invalidateDashboard } = useDashboardInvalidation();

  return useMutation({
    mutationFn: async ({
      eventId,
      values,
    }: {
      eventId: string;
      values: CreateEventValues;
    }) => {
      const result = await editEventAction(eventId, values);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Event updated successfully!");
      // Invalidate events data to show updated event
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Invalidate calendar data to show updated event
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      // Invalidate dashboard stats in case event dates changed
      invalidateDashboard();
    },
    onError: (error: Error) => {
      console.error("Edit event error:", error);
      toast.error(error.message || "Failed to update event");
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { invalidateDashboard } = useDashboardInvalidation();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const result = await deleteEventAction(eventId);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Event deleted");
      // Invalidate events data to remove deleted event
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Invalidate calendar data to remove deleted event
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      // Invalidate dashboard stats to update event counts
      invalidateDashboard();
    },
    onError: (error: Error) => {
      console.error("Delete event error:", error);
      toast.error(error.message || "Failed to delete event");
    },
  });
}

export function useAdminEditEvent() {
  const queryClient = useQueryClient();
  const { invalidateDashboard } = useDashboardInvalidation();

  return useMutation({
    mutationFn: async ({
      eventId,
      values,
    }: {
      eventId: string;
      values: CreateEventValues;
    }) => {
      const result = await adminEditEventAction(eventId, {
        ...values,
        groupId: values.groupId || undefined,
      });
      return result;
    },
    onMutate: async ({ eventId, values }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["admin-events"] });

      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData(["admin-events"]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["admin-events"],
        (old: { pages: Array<{ events: Array<{ id: string }> }> }) => {
          if (!old?.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page: { events: Array<{ id: string }> }) => ({
              ...page,
              events: page.events.map((event: { id: string }) =>
                event.id === eventId
                  ? {
                      ...event,
                      name: values.name,
                      description: values.description || null,
                      date: new Date(
                        `${values.date}T${values.time}`
                      ).toISOString(),
                      location: values.location || null,
                      groupId: values.groupId || null,
                    }
                  : event
              ),
            })),
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousEvents };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousEvents) {
        queryClient.setQueryData(["admin-events"], context.previousEvents);
      }
      console.error("Admin edit event error:", err);
      toast.error(err.message || "Failed to update event");
    },
    onSuccess: () => {
      toast.success("Event updated successfully!");
      // Invalidate events data to show updated event
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      // Invalidate calendar data to show updated event
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      // Invalidate dashboard stats in case event dates changed
      invalidateDashboard();
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });
}

export function useLeaveEvent() {
  const queryClient = useQueryClient();
  const { invalidateDashboard } = useDashboardInvalidation();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const result = await leaveEventAction(eventId);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || "You have left the event");
      // Invalidate events data to remove user from event
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Invalidate calendar data to remove user from event
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      // Invalidate dashboard stats to update event counts
      invalidateDashboard();
    },
    onError: (error: Error) => {
      console.error("Leave event error:", error);
      toast.error(error.message || "Failed to leave event");
    },
  });
}

export function useInviteToEventBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { eventId: string; emails: string[] }) => {
      const result = await inviteToEventBatchAction(data.eventId, data.emails);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result as {
        success?: boolean;
        succeeded?: string[];
        failed?: Array<{ email: string; error: string }> | string[];
      };
    },
    onSuccess: (data) => {
      const ok = (data?.succeeded?.length ?? 0) as number;
      const failed = (data?.failed ?? []) as Array<{
        email: string;
        error: string;
      }>;
      if (ok) toast.success(`Invited ${ok} ${ok === 1 ? "person" : "people"}`);
      if (failed.length) {
        const details = failed
          .slice(0, 3)
          .map((f) => `${f.email}: ${f.error}`)
          .join("\n");
        toast.error(`Failed to invite ${failed.length}\n${details}`);
      }
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => {
      console.error("Batch invite to event error:", error);
      toast.error(error.message || "Failed to send invitations");
    },
  });
}

export function useMoveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      newDateStr,
    }: {
      eventId: string;
      newDateStr: string; // yyyy-MM-dd (date only to avoid TZ drift)
    }) => {
      // Preserve original time server-side; pass date-only to avoid timezone shifts
      const result = await moveEventToDateAction(
        eventId,
        new Date(`${newDateStr}T00:00:00.000Z`).toISOString()
      );
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onMutate: async ({ eventId, newDateStr }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["calendar"] });

      // Snapshot the previous value
      const previous = queryClient.getQueryData<CalendarResponse>(["calendar"]);
      const prevDateISO = previous?.events.find(
        (ev) => ev.id === eventId
      )?.date;

      // Optimistically update to the new value
      queryClient.setQueryData<CalendarResponse>(["calendar"], (old) => {
        if (!old) return old as unknown as CalendarResponse;

        return {
          ...old,
          events: old.events.map((ev) =>
            ev.id === eventId
              ? {
                  ...ev,
                  // Keep existing time component, change the date only at client-side for display
                  date: `${newDateStr}T${new Date(ev.date)
                    .toISOString()
                    .split("T")[1]}`,
                }
              : ev
          ),
        };
      });

      // Offer Undo via toast: revert cache and server if clicked
      const id = Math.random().toString(36).slice(2);
      toast.success("Event moved", {
        action: {
          label: "Undo",
          onClick: () => {
            if (previous) {
              queryClient.setQueryData(["calendar"], previous);
            }
            if (prevDateISO) {
              // revert on server as well to avoid bounce on refetch
              moveEventToDateAction(eventId, prevDateISO).catch(() => {
                // ignore server revert error; UI already reverted
              });
            }
          },
        },
        id,
      });

      return { previous };
    },
    onError: (err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previous) {
        queryClient.setQueryData(["calendar"], context.previous);
      }
      console.error("Move event error:", err);
      toast.error(err.message || "Failed to move event");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["calendar"],
        refetchType: "active",
      });
      await queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "active",
      });
    },
  });
}
