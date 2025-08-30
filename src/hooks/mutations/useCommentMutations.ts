"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { suppressEventCommentsRefetch } from "@/hooks/queries/_commentRefetchControl";
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
      createCommentAction(values).catch((error) => {
        console.error("Comment error (background):", error);
      });
      return { success: true };
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

      // Update each paginated comments (infinite) query optimistically
      const infiniteQueries = queryCache.findAll({
        queryKey: ["infinite-event-comments", values.eventId],
      });

      infiniteQueries.forEach((query) => {
        const oldData = query.state.data as
          | {
              pages: Array<{ comments: EventCommentData[] }>;
              pageParams: unknown[];
            }
          | undefined;
        if (!oldData?.pages?.length) return;
        const sortBy = (query.queryKey[2] as string) || "newest";
        const firstPage = oldData.pages[0];
        const newFirstComments = values.parentId
          ? firstPage.comments.map((c) =>
              c.id === values.parentId
                ? {
                    ...c,
                    replies: [tempComment, ...c.replies],
                    _count: { ...c._count, replies: c._count.replies + 1 },
                  }
                : c
            )
          : sortBy === "oldest"
            ? [...firstPage.comments, tempComment]
            : [tempComment, ...firstPage.comments];

        rollbackFunctions.push(() => {
          queryClient.setQueryData(query.queryKey, oldData);
        });

        queryClient.setQueryData(query.queryKey, {
          ...oldData,
          pages: [
            { ...firstPage, comments: newFirstComments },
            ...oldData.pages.slice(1),
          ],
        });
      });

      // Update each non-infinite comments query optimistically
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

      // Show immediate success feedback (no network wait)
      toast.success(values.parentId ? "Reply posted!" : "Comment posted!");

      // Suppress background refetch briefly to avoid bounce overwriting optimistic item
      suppressEventCommentsRefetch(values.eventId, 2000);
      return { rollbackFunctions, eventId: values.eventId };
    },
    onSuccess: (_data, variables) => {
      // Delay background sync slightly so DB is up-to-date to avoid bounce
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["event-comments", variables.eventId],
          refetchType: "inactive",
        });
        queryClient.invalidateQueries({
          queryKey: ["infinite-event-comments", variables.eventId],
          refetchType: "inactive",
        });
      }, 600);
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
    onMutate: async (values) => {
      if (!user?.id) return;

      await queryClient.cancelQueries({
        queryKey: ["event-comments", values.eventId],
      });
      await queryClient.cancelQueries({
        queryKey: ["infinite-event-comments", values.eventId],
      });
      await queryClient.cancelQueries({
        queryKey: ["infinite-replies", values.eventId, values.parentId],
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

      // Optimistically bump parent's reply count in infinite comments pages
      const infCommentQueries = queryClient
        .getQueryCache()
        .findAll({ queryKey: ["infinite-event-comments", values.eventId] });
      infCommentQueries.forEach((q) => {
        const key = q.queryKey;
        const prev = queryClient.getQueryData<{
          pages: Array<{ comments: EventCommentData[] }>;
          pageParams: unknown[];
        }>(key);
        if (!prev?.pages) return;
        const pages = prev.pages.map((page) => ({
          ...page,
          comments: page.comments.map((c) =>
            c.id === values.parentId
              ? {
                  ...c,
                  _count: { ...c._count, replies: (c._count.replies || 0) + 1 },
                }
              : c
          ),
        }));
        queryClient.setQueryData(key, { ...prev, pages });
      });

      // Optimistically prepend reply to infinite replies first page
      const infRepliesKey = [
        "infinite-replies",
        values.eventId,
        values.parentId,
      ];
      const prevReplies = queryClient.getQueryData<{
        pages: Array<{ replies: EventCommentData[] }>;
        pageParams: unknown[];
      }>(infRepliesKey);
      if (prevReplies?.pages?.length) {
        const first = prevReplies.pages[0];
        const pages = [
          { ...first, replies: [tempReply, ...(first.replies || [])] },
          ...prevReplies.pages.slice(1),
        ];
        queryClient.setQueryData(infRepliesKey, { ...prevReplies, pages });
      }

      // Suppress polling briefly to avoid bounce
      suppressEventCommentsRefetch(values.eventId, 2000);

      toast.success("Reply added!");
      return { previousComments, eventId: values.eventId };
    },
    onSuccess: (_data, variables) => {
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["event-comments", variables.eventId],
          refetchType: "inactive",
        });
        queryClient.invalidateQueries({
          queryKey: ["infinite-event-comments", variables.eventId],
          refetchType: "inactive",
        });
        queryClient.invalidateQueries({
          queryKey: ["infinite-replies", variables.eventId, variables.parentId],
          refetchType: "inactive",
        });
      }, 600);
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
    mutationFn: async (
      values: CommentReactionValues & { eventId?: string }
    ) => {
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
    onMutate: async ({ commentId, emoji, eventId }) => {
      if (!user?.id) return;

      // Cancel outgoing refetches for all comment-related queries
      await queryClient.cancelQueries({ queryKey: ["event-comments"] });
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

      // Update infinite replies queries (only for same event if provided)
      const infiniteRepliesQueries = queryCache.findAll({
        queryKey: ["infinite-replies"],
      });

      infiniteRepliesQueries.forEach((query) => {
        if (eventId && query.queryKey[1] !== eventId) return;
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
      // Let optimistic updates stay - no immediate invalidation to prevent bounce
      // Background polling will eventually sync fresh data
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

// Global map to track pending deletions
const pendingDeletions = new Map<
  string,
  { timeoutId: NodeJS.Timeout; commentData: EventCommentData }
>();

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      commentId: string;
      eventId: string;
      undoAction?: boolean;
    }) => {
      if (data.undoAction) {
        // This is an undo - cancel the pending deletion
        const pending = pendingDeletions.get(data.commentId);
        if (pending) {
          clearTimeout(pending.timeoutId);
          pendingDeletions.delete(data.commentId);
          return { success: true, undone: true };
        }
        throw new Error("No pending deletion to undo");
      }

      // Regular deletion - delay server call
      return new Promise((resolve) => {
        const timeoutId = setTimeout(async () => {
          try {
            const result = await deleteCommentAction(data.commentId);
            pendingDeletions.delete(data.commentId);
            if (result.error) {
              throw new Error(result.error);
            }
            resolve(result);
          } catch (error) {
            pendingDeletions.delete(data.commentId);
            throw error;
          }
        }, 5000); // 5 second delay

        // Store the timeout so it can be cancelled
        pendingDeletions.set(data.commentId, {
          timeoutId,
          commentData: {} as EventCommentData, // Will be filled in onMutate
        });

        // Return immediately for optimistic UI
        resolve({ success: true, delayed: true });
      });
    },
    onMutate: async ({ commentId, eventId, undoAction }) => {
      if (undoAction) {
        // This is an undo - restore the comment
        const pending = pendingDeletions.get(commentId);
        if (pending?.commentData) {
          // Restore comment to all caches
          return { isUndo: true, commentData: pending.commentData };
        }
        return { isUndo: true };
      }

      // Cancel outgoing refetches that could overwrite optimistic removal
      await queryClient.cancelQueries({
        queryKey: ["event-comments", eventId],
      });
      await queryClient.cancelQueries({
        queryKey: ["infinite-event-comments", eventId],
      });
      await queryClient.cancelQueries({ queryKey: ["infinite-replies"] });

      const rollbacks: Array<() => void> = [];
      let deletedComment: EventCommentData | null = null;

      // Helper to remove a comment (or reply) recursively and capture it
      const removeRecursive = (
        list: EventCommentData[]
      ): {
        list: EventCommentData[];
        removed: boolean;
        deletedComment?: EventCommentData;
      } => {
        let removed = false;
        let deletedComment: EventCommentData | undefined;
        const next = list
          .map((c) => {
            if (c.id === commentId) {
              removed = true;
              deletedComment = c; // Capture the deleted comment
              return null;
            }
            const child = removeRecursive(c.replies || []);
            if (child.removed) {
              removed = true;
              if (child.deletedComment) deletedComment = child.deletedComment;
            }
            return { ...c, replies: child.list } as EventCommentData;
          })
          .filter(Boolean) as EventCommentData[];
        return { list: next, removed, deletedComment };
      };

      // Non-infinite comments
      const nonInfiniteKey = ["event-comments", eventId];
      const prevNonInfinite =
        queryClient.getQueryData<CommentsResponse>(nonInfiniteKey);
      if (prevNonInfinite) {
        rollbacks.push(() =>
          queryClient.setQueryData(nonInfiniteKey, prevNonInfinite)
        );
        const res = removeRecursive(prevNonInfinite.comments);
        if (res.removed) {
          if (res.deletedComment && !deletedComment) {
            deletedComment = res.deletedComment;
          }
          queryClient.setQueryData<CommentsResponse>(nonInfiniteKey, {
            comments: res.list,
            totalCount: Math.max(0, (prevNonInfinite.totalCount || 0) - 1),
          });
        }
      }

      // Infinite comments (pages)
      const infQueries = queryClient
        .getQueryCache()
        .findAll({ queryKey: ["infinite-event-comments", eventId] });
      infQueries.forEach((q) => {
        const key = q.queryKey;
        const prev = queryClient.getQueryData<{
          pages: Array<{ comments: EventCommentData[] }>;
          pageParams: unknown[];
        }>(key);
        if (!prev?.pages) return;
        rollbacks.push(() => queryClient.setQueryData(key, prev));
        let removed = false;
        const pages = prev.pages.map((p) => {
          const r = removeRecursive(p.comments);
          if (r.removed) removed = true;
          return { ...p, comments: r.list };
        });
        if (removed) {
          queryClient.setQueryData(key, { ...prev, pages });
        }
      });

      // Infinite replies (unknown parent) -> remove from any page where present
      const infRepliesQueries = queryClient
        .getQueryCache()
        .findAll({ queryKey: ["infinite-replies"] });
      infRepliesQueries.forEach((q) => {
        const key = q.queryKey;
        const prev = queryClient.getQueryData<{
          pages: Array<{ replies: EventCommentData[] }>;
          pageParams: unknown[];
        }>(key);
        if (!prev?.pages) return;
        rollbacks.push(() => queryClient.setQueryData(key, prev));
        const pages = prev.pages.map((p) => ({
          ...p,
          replies: p.replies.filter((r) => r.id !== commentId),
        }));
        queryClient.setQueryData(key, { ...prev, pages });
      });

      // Store the deleted comment for potential undo
      if (deletedComment) {
        const pending = pendingDeletions.get(commentId);
        if (pending) {
          pending.commentData = deletedComment;
        }
      }

      suppressEventCommentsRefetch(eventId, 2000);
      return { rollbacks, eventId, deletedComment };
    },
    onSuccess: (_, variables) => {
      // Soft sync in background after a brief delay
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["event-comments", variables.eventId],
          refetchType: "inactive",
        });
        queryClient.invalidateQueries({
          queryKey: ["infinite-event-comments", variables.eventId],
          refetchType: "inactive",
        });
        queryClient.invalidateQueries({
          queryKey: ["infinite-replies"],
          refetchType: "inactive",
        });
      }, 600);
      toast.success("Comment deleted");
    },
    onError: (_err, _vars, context) => {
      context?.rollbacks?.forEach((rb) => rb());
      toast.error("Failed to delete comment");
    },
  });
}

// Hook for undoing comment deletion
export function useUndoCommentDeletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { commentId: string; eventId: string }) => {
      const pending = pendingDeletions.get(data.commentId);
      if (!pending) {
        throw new Error("No pending deletion to undo");
      }

      // Cancel the pending deletion
      clearTimeout(pending.timeoutId);
      pendingDeletions.delete(data.commentId);

      return { success: true, commentData: pending.commentData };
    },
    onMutate: async ({ commentId, eventId }) => {
      const pending = pendingDeletions.get(commentId);
      if (!pending?.commentData) return;

      const commentData = pending.commentData;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["event-comments", eventId],
      });
      await queryClient.cancelQueries({
        queryKey: ["infinite-event-comments", eventId],
      });
      await queryClient.cancelQueries({ queryKey: ["infinite-replies"] });

      // Helper to restore comment recursively
      const restoreRecursive = (
        list: EventCommentData[],
        parentId?: string
      ): EventCommentData[] => {
        if (commentData.parentId === parentId) {
          // This is where the comment should be restored
          const existingIndex = list.findIndex((c) => c.id === commentId);
          if (existingIndex === -1) {
            // Ensure user data is properly structured before restoration
            const restoredComment: EventCommentData = {
              ...commentData,
              user: {
                id: commentData.user?.id || "",
                firstName: commentData.user?.firstName || "Unknown",
                lastName: commentData.user?.lastName || null,
                nickname: commentData.user?.nickname || null,
                image: commentData.user?.image || null,
              },
              replies: commentData.replies || [],
              reactions: commentData.reactions || [],
              _count: {
                replies: commentData._count?.replies || 0,
                reactions: commentData._count?.reactions || 0,
              },
            };

            // Add back the comment (maintain sort order by createdAt)
            const newList = [...list, restoredComment];
            return newList.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
          }
        }

        // Check replies recursively
        return list.map((comment) => ({
          ...comment,
          replies: restoreRecursive(comment.replies || [], comment.id),
        }));
      };

      // Restore to non-infinite comments
      const nonInfiniteKey = ["event-comments", eventId];
      const prevNonInfinite =
        queryClient.getQueryData<CommentsResponse>(nonInfiniteKey);
      if (prevNonInfinite) {
        const restoredComments = restoreRecursive(prevNonInfinite.comments);
        queryClient.setQueryData<CommentsResponse>(nonInfiniteKey, {
          comments: restoredComments,
          totalCount: prevNonInfinite.totalCount + 1,
        });
      }

      // Restore to infinite comments
      const infQueries = queryClient
        .getQueryCache()
        .findAll({ queryKey: ["infinite-event-comments", eventId] });
      infQueries.forEach((q) => {
        const key = q.queryKey;
        const prev = queryClient.getQueryData<{
          pages: Array<{ comments: EventCommentData[] }>;
          pageParams: unknown[];
        }>(key);
        if (!prev?.pages) return;

        const pages = prev.pages.map((page) => ({
          ...page,
          comments: restoreRecursive(page.comments),
        }));
        queryClient.setQueryData(key, { ...prev, pages });
      });

      // Restore to infinite replies if it's a reply
      if (commentData.parentId) {
        const infRepliesQueries = queryClient.getQueryCache().findAll({
          queryKey: ["infinite-replies", eventId, commentData.parentId],
        });
        infRepliesQueries.forEach((q) => {
          const key = q.queryKey;
          const prev = queryClient.getQueryData<{
            pages: Array<{ replies: EventCommentData[] }>;
            pageParams: unknown[];
          }>(key);
          if (!prev?.pages) return;

          // Add back to first page
          const firstPage = prev.pages[0];
          if (firstPage) {
            const existingIndex = firstPage.replies.findIndex(
              (r) => r.id === commentId
            );
            if (existingIndex === -1) {
              // Use the same properly structured comment data
              const restoredComment: EventCommentData = {
                ...commentData,
                user: {
                  id: commentData.user?.id || "",
                  firstName: commentData.user?.firstName || "Unknown",
                  lastName: commentData.user?.lastName || null,
                  nickname: commentData.user?.nickname || null,
                  image: commentData.user?.image || null,
                },
                replies: commentData.replies || [],
                reactions: commentData.reactions || [],
                _count: {
                  replies: commentData._count?.replies || 0,
                  reactions: commentData._count?.reactions || 0,
                },
              };

              const newReplies = [restoredComment, ...firstPage.replies];
              const pages = [
                { ...firstPage, replies: newReplies },
                ...prev.pages.slice(1),
              ];
              queryClient.setQueryData(key, { ...prev, pages });
            }
          }
        });
      }

      suppressEventCommentsRefetch(eventId, 1000);
      return { commentData };
    },
    onSuccess: () => {
      toast.success("Comment restored");
    },
    onError: () => {
      toast.error("Failed to undo deletion");
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
        queryKey: ["event-comments"],
      });
      toast.success("Comment updated successfully");
    },
    onError: (error) => {
      console.error("Edit comment error:", error);
      toast.error("Failed to update comment");
    },
  });
}
