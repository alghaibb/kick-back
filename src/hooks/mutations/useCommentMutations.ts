"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  createCommentAction,
  deleteCommentAction,
} from "@/app/(main)/events/comments/actions";
import { CreateCommentValues } from "@/validations/events/createCommentSchema";
import { EventCommentData } from "@/hooks/queries/useEventComments";

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (values: CreateCommentValues) => {
      const result = await createCommentAction(values);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async (values) => {
      if (!user?.id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["event-comments", values.eventId],
      });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData([
        "event-comments",
        values.eventId,
      ]);

      // Optimistically add the new comment
      const tempComment: EventCommentData = {
        id: `temp-${Date.now()}`,
        content: values.content,
        eventId: values.eventId,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: user.id,
          firstName: user.firstName || "You",
          lastName: user.lastName || null,
          nickname: user.nickname || null,
          image: user.image || null,
        },
      };

      queryClient.setQueryData(
        ["event-comments", values.eventId],
        (old: EventCommentData[] | undefined) => [tempComment, ...(old || [])]
      );

      // Show immediate success feedback
      toast.success("Comment added!");

      return { previousComments, eventId: values.eventId };
    },
    onSuccess: (data, variables) => {
      // Replace optimistic comment with real one
      queryClient.setQueryData(
        ["event-comments", variables.eventId],
        (old: EventCommentData[] | undefined) => {
          if (!old) return [];

          // Remove temp comment and add real one
          const withoutTemp = old.filter(comment => !comment.id.startsWith('temp-'));
          return [data.comment, ...withoutTemp];
        }
      );

      // Trigger immediate refetch to get latest comments from all users
      queryClient.invalidateQueries({
        queryKey: ["event-comments", variables.eventId]
      });
    },
    onError: (error, variables, context) => {
      // Revert to previous state on error
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["event-comments", variables.eventId],
          context.previousComments
        );
      }
      toast.error("Failed to add comment. Please try again.");
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
    }: {
      commentId: string;
      eventId: string;
    }) => {
      const result = await deleteCommentAction(commentId);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async ({ commentId, eventId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["event-comments", eventId],
      });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData([
        "event-comments",
        eventId,
      ]);

      // Optimistically remove the comment
      queryClient.setQueryData(
        ["event-comments", eventId],
        (old: EventCommentData[] | undefined) => {
          if (!old) return [];

          return old.filter((comment) => comment.id !== commentId);
        }
      );

      // Show immediate feedback
      toast.success("Comment deleted!");

      return { previousComments, eventId };
    },
    onSuccess: () => {
      // Invalidate related data
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });

      // Invalidate notifications so attendees get comment notifications immediately
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousComments && context?.eventId) {
        queryClient.setQueryData(
          ["event-comments", context.eventId],
          context.previousComments
        );
      }

      console.error("Delete comment error:", error);
      toast.error(error.message || "Failed to delete comment");
    },
  });
}
