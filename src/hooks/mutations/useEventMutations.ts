"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createEventAction,
  editEventAction,
  deleteEventAction
} from "@/app/(main)/events/actions";
import { useDashboardInvalidation } from "@/hooks/queries/useDashboardInvalidation";
import { CreateEventValues } from "@/validations/events/createEventSchema";

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
    mutationFn: async ({ eventId, values }: { eventId: string; values: CreateEventValues }) => {
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