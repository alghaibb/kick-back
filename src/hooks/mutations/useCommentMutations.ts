"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  CreateCommentValues,
  ReplyCommentValues,
  EditCommentValues,
  CommentReactionValues,
} from "@/validations/events/createCommentSchema";
import {
  EventCommentData,
  CommentsResponse,
} from "@/hooks/queries/useEventComments";
import {
  createCommentAction,
  createReplyAction,
  editCommentAction,
  deleteCommentAction,
  toggleReactionAction,
} from "@/app/(main)/events/comments/actions";

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (values: CreateCommentValues) => {
      // Fire and forget - don't wait for server response for instant feel
      createCommentAction(values).catch((error) => {
        console.error("Comment error (background):", error);
      });
      return { success: true }; // Always return success for optimistic UI
    },
    onMutate: async (values) => {
      if (!user?.id) return;

      // Cancel any outgoing refetches for all sorting variations
      await queryClient.cancelQueries({
        queryKey: ["event-comments", values.eventId],
      });

      // Get all comment queries for this event to update them all
      const queryCache = queryClient.getQueryCache();
      const eventCommentQueries = queryCache.findAll({
        queryKey: ["event-comments", values.eventId],
      });

      const rollbackFunctions: Array<() => void> = [];

      // Optimistically add the new comment
      const tempComment: EventCommentData = {
        id: `temp-${Date.now()}`,
        content: values.content,
        imageUrl: values.imageUrl || null,
        eventId: values.eventId,
        userId: user.id,
        parentId: values.parentId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        editedAt: null,
        user: {
          id: user.id,
          firstName: user.firstName || "You",
          lastName: user.lastName || null,
          nickname: user.nickname || null,
          image: user.image || null,
        },
        replies: [],
        reactions: [],
        _count: {
          replies: 0,
          reactions: 0,
        },
      };

      // Update each comment query optimistically
      eventCommentQueries.forEach((query) => {
        const oldData = query.state.data as CommentsResponse | undefined;
        if (!oldData) return;

        // Store rollback function
        rollbackFunctions.push(() => {
          queryClient.setQueryData(query.queryKey, oldData);
        });

        // Update based on whether it's a reply or main comment
        if (values.parentId) {
          // It's a reply - add to parent's replies
          const newData = {
            ...oldData,
            comments: oldData.comments.map((comment) =>
              comment.id === values.parentId
                ? {
                  ...comment,
                  replies: [tempComment, ...comment.replies],
                  _count: {
                    ...comment._count,
                    replies: comment._count.replies + 1,
                  },
                }
                : comment
            ),
          };
          queryClient.setQueryData(query.queryKey, newData);
        } else {
          // It's a main comment - add to top level (respect sort order)
          const sortBy = query.queryKey[2] as string;
          const newComments =
            sortBy === "oldest"
              ? [...oldData.comments, tempComment]
              : [tempComment, ...oldData.comments];

          const newData = {
            ...oldData,
            comments: newComments,
            totalCount: oldData.totalCount + 1,
          };
          queryClient.setQueryData(query.queryKey, newData);
        }
      });

      // Show immediate success feedback
      toast.success(values.parentId ? "Reply posted!" : "Comment posted!");

      return { rollbackFunctions, eventId: values.eventId };
    },
    onSuccess: (data, variables) => {
      // Invalidate all comment queries for this event (background sync)
      queryClient.invalidateQueries({
        queryKey: ["event-comments", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["infinite-event-comments", variables.eventId],
      });
    },
    onError: (error, variables, context) => {
      // Only revert on actual errors and show user-friendly message
      console.error("Comment error:", error);
      context?.rollbackFunctions?.forEach((rollback) => rollback());
      toast.error("Comment failed to post. Please try again.");
    },
  });
}

export function useCreateReply() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (values: ReplyCommentValues) => {
      const result = await createReplyAction(values);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    // Similar optimistic logic as useCreateComment but specifically for replies
    onMutate: async (values) => {
      if (!user?.id) return;

      await queryClient.cancelQueries({
        queryKey: ["event-comments", values.eventId],
      });

      const previousComments = queryClient.getQueryData([
        "event-comments",
        values.eventId,
      ]);

      const tempReply: EventCommentData = {
        id: `temp-reply-${Date.now()}`,
        content: values.content,
        imageUrl: values.imageUrl || null,
        eventId: values.eventId,
        userId: user.id,
        parentId: values.parentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        editedAt: null,
        user: {
          id: user.id,
          firstName: user.firstName || "You",
          lastName: user.lastName || null,
          nickname: user.nickname || null,
          image: user.image || null,
        },
        replies: [],
        reactions: [],
        _count: {
          replies: 0,
          reactions: 0,
        },
      };

      queryClient.setQueryData(
        ["event-comments", values.eventId],
        (old: CommentsResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            comments: old.comments.map((comment) =>
              comment.id === values.parentId
                ? {
                  ...comment,
                  replies: [tempReply, ...comment.replies],
                  _count: {
                    ...comment._count,
                    replies: comment._count.replies + 1,
                  },
                }
                : comment
            ),
          };
        }
      );

      toast.success("Reply added!");
      return { previousComments, eventId: values.eventId };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["event-comments", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["infinite-event-comments", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["infinite-replies", variables.eventId, variables.parentId],
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["event-comments", variables.eventId],
          context.previousComments
        );
      }
      toast.error("Failed to add reply. Please try again.");
    },
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (values: CommentReactionValues) => {
      try {
        // Fire and forget - don't wait for server response for instant feel
        const result = await toggleReactionAction(values);

        // If there's an error from the server, log it but don't throw
        if (result?.error) {
          console.error("Reaction server error:", result.error);
          // Don't throw - let the optimistic update stay
        }

        return { success: true };
      } catch (error) {
        console.error("Reaction mutation error:", error);
        // Don't throw - let the optimistic update stay
        return { success: true };
      }
    },
    onMutate: async ({ commentId, emoji }) => {
      if (!user?.id) return;

      // Cancel outgoing refetches for all comment-related queries
      await queryClient.cancelQueries({
        queryKey: ["event-comments"],
      });
      await queryClient.cancelQueries({
        queryKey: ["infinite-event-comments"],
      });
      await queryClient.cancelQueries({
        queryKey: ["infinite-replies"],
      });

      const rollbackFunctions: Array<() => void> = [];
      const queryCache = queryClient.getQueryCache();

      // Update regular comment queries
      const commentQueries = queryCache.findAll({
        queryKey: ["event-comments"],
      });

      commentQueries.forEach((query) => {
        const oldData = query.state.data as CommentsResponse | undefined;
        if (!oldData) return;

        const newData = {
          ...oldData,
          comments: oldData.comments.map((comment) =>
            updateCommentWithReaction(comment, commentId, emoji, user)
          ),
        };

        queryClient.setQueryData(query.queryKey, newData);
        rollbackFunctions.push(() => {
          queryClient.setQueryData(query.queryKey, oldData);
        });
      });

      // Update infinite comment queries
      const infiniteCommentQueries = queryCache.findAll({
        queryKey: ["infinite-event-comments"],
      });

      infiniteCommentQueries.forEach((query) => {
        const oldData = query.state.data as {
          pages: Array<{ comments: EventCommentData[] }>;
          pageParams: unknown[];
        };
        if (!oldData?.pages) return;

        const newData = {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            comments: page.comments.map((comment: EventCommentData) =>
              updateCommentWithReaction(comment, commentId, emoji, user)
            ),
          })),
        };

        queryClient.setQueryData(query.queryKey, newData);
        rollbackFunctions.push(() => {
          queryClient.setQueryData(query.queryKey, oldData);
        });
      });

      // Update infinite replies queries
      const infiniteRepliesQueries = queryCache.findAll({
        queryKey: ["infinite-replies"],
      });

      infiniteRepliesQueries.forEach((query) => {
        const oldData = query.state.data as {
          pages: Array<{ replies: EventCommentData[] }>;
          pageParams: unknown[];
        };
        if (!oldData?.pages) return;

        const newData = {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            replies: page.replies.map((reply: EventCommentData) =>
              updateCommentWithReaction(reply, commentId, emoji, user)
            ),
          })),
        };

        queryClient.setQueryData(query.queryKey, newData);
        rollbackFunctions.push(() => {
          queryClient.setQueryData(query.queryKey, oldData);
        });
      });

      // Instant feedback - no toast needed, the UI change is the feedback
      return { rollbackFunctions };
    },
    onSuccess: () => {
      // Invalidate to get fresh data from server (background sync)
      queryClient.invalidateQueries({
        queryKey: ["event-comments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["infinite-event-comments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["infinite-replies"],
      });
    },
    onError: (error, _, context) => {
      // This should rarely be called now since we don't throw errors
      console.error("Reaction onError (should be rare):", error);
      context?.rollbackFunctions?.forEach((rollback) => rollback());
    },
  });
}

// Helper function to update a comment with a reaction optimistically
function updateCommentWithReaction(
  comment: EventCommentData,
  targetCommentId: string,
  emoji: string,
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    nickname?: string | null;
  }
): EventCommentData {
  // Check if this is the target comment
  if (comment.id === targetCommentId) {
    const existingReactionIndex = (comment.reactions || []).findIndex(
      (r) => r.userId === user.id && r.emoji === emoji
    );

    if (existingReactionIndex >= 0) {
      // Remove existing reaction
      return {
        ...comment,
        reactions: (comment.reactions || []).filter(
          (_, index) => index !== existingReactionIndex
        ),
        _count: {
          ...comment._count,
          reactions: (comment._count?.reactions || 0) - 1,
        },
      };
    } else {
      // Add new reaction
      return {
        ...comment,
        reactions: [
          ...(comment.reactions || []),
          {
            id: `temp-${Date.now()}`,
            emoji,
            userId: user.id,
            user: {
              id: user.id,
              firstName: user.firstName || "You",
              lastName: user.lastName || null,
              nickname: user.nickname || null,
            },
          },
        ],
        _count: {
          ...comment._count,
          reactions: (comment._count?.reactions || 0) + 1,
        },
      };
    }
  }

  // Also check replies recursively
  return {
    ...comment,
    replies: (comment.replies || []).map((reply) =>
      updateCommentWithReaction(reply, targetCommentId, emoji, user)
    ),
  };
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { commentId: string; eventId: string }) => {
      const result = await deleteCommentAction(data.commentId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["event-comments", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["infinite-event-comments", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["infinite-replies"],
      });
      toast.success("Comment deleted");
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });
}

export function useEditComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EditCommentValues) => {
      const result = await editCommentAction(data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate all comment queries for this event
      queryClient.invalidateQueries({
        queryKey: ["event-comments"]
      });
      toast.success("Comment updated successfully");
    },
    onError: (error) => {
      console.error("Edit comment error:", error);
      toast.error("Failed to update comment");
    },
  });
}
