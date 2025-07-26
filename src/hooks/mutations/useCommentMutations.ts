"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCommentAction,
  deleteCommentAction,
} from "@/app/(main)/events/comments/actions";
import { CreateCommentValues } from "@/validations/events/createCommentSchema";

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateCommentValues) => {
      const result = await createCommentAction(values);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data, variables) => {
      toast.success("Comment added successfully!");
      // Invalidate event comments to show new comment
      queryClient.invalidateQueries({
        queryKey: ["event-comments", variables.eventId],
      });
      // Invalidate events data to update comment count
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Invalidate calendar data to update event info
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const result = await deleteCommentAction(commentId);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Comment deleted successfully!");
      // Invalidate all comment queries to update lists
      queryClient.invalidateQueries({ queryKey: ["event-comments"] });
      // Invalidate events data to update comment count
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Invalidate calendar data to update event info
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
