"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createEventTemplateAction,
  editEventTemplateAction,
  deleteEventTemplateAction,
} from "@/app/(main)/events/templates/actions";
import type {
  CreateEventTemplateValues,
  EditEventTemplateValues,
} from "@/validations/events/eventTemplateSchema";

export function useCreateEventTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateEventTemplateValues) => {
      const result = await createEventTemplateAction(values);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Template created successfully!");
      queryClient.invalidateQueries({ queryKey: ["event-templates"] });
    },
    onError: (error: Error) => {
      console.error("Create template error:", error);
      toast.error(error.message || "Failed to create template");
    },
  });
}

export function useEditEventTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      values,
    }: {
      templateId: string;
      values: EditEventTemplateValues;
    }) => {
      const result = await editEventTemplateAction(templateId, values);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Template updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["event-templates"] });
    },
    onError: (error: Error) => {
      console.error("Edit template error:", error);
      toast.error(error.message || "Failed to update template");
    },
  });
}

export function useDeleteEventTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const result = await deleteEventTemplateAction(templateId);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Template deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["event-templates"] });
    },
    onError: (error: Error) => {
      console.error("Delete template error:", error);
      toast.error(error.message || "Failed to delete template");
    },
  });
}
