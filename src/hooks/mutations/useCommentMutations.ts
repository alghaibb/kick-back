"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { pausePolling } from "@/hooks/queries/usePausablePolling";
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
      const result = await createCommentAction(values);
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

      eventCommentQueries.forEach((query) => {
        const oldData = query.state.data as CommentsResponse | undefined;
        if (!oldData) return;

        rollbackFunctions.push(() => {
          queryClient.setQueryData(query.queryKey, oldData);
        });

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

      return {
        rollbackFunctions,
        eventId: values.eventId,
        tempId: tempComment.id,
      };
    },
    onSuccess: (data, variables, context) => {
      // Replace temporary ID with real ID from server
      if (data?.comment?.id && context?.tempId) {
        const tempId = context.tempId;
        const realId = data.comment.id;

        // Update event-comments query
        queryClient.setQueryData(
          ["event-comments", variables.eventId],
          (old: CommentsResponse | undefined) => {
            if (!old) return old;
            return {
              ...old,
              comments: old.comments.map((comment) =>
                comment.id === tempId ? { ...comment, id: realId } : comment
              ),
            };
          }
        );

        // Update infinite-event-comments queries
        const infiniteQueries = queryClient.getQueryCache().findAll({
          queryKey: ["infinite-event-comments", variables.eventId],
        });

        infiniteQueries.forEach((query) => {
          queryClient.setQueryData(
            query.queryKey,
            (
              old:
                | {
                    pages: Array<{ comments: EventCommentData[] }>;
                    pageParams: unknown[];
                  }
                | undefined
            ) => {
              if (!old?.pages) return old;
              return {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  comments: page.comments.map((c: EventCommentData) =>
                    c.id === tempId ? { ...c, id: realId } : c
                  ),
                })),
              };
            }
          );
        });
      }

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["event-comments", variables.eventId],
          refetchType: "inactive",
        });
        queryClient.invalidateQueries({
          queryKey: ["infinite-event-comments", variables.eventId],
          refetchType: "inactive",
        });
      }, 2500);
    },
    onError: (error, variables, context) => {
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
      // Check if parentId is a temporary ID
      if (values.parentId.startsWith("temp-")) {
        throw new Error(
          "Please wait for the comment to be posted before replying"
        );
      }

      const result = await createReplyAction(values);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async (values) => {
      if (!user?.id) return;

      // Check if parentId is a temporary ID and silently prevent the action
      if (values.parentId.startsWith("temp-")) {
        // Don't proceed with optimistic update
        toast.info("Please wait for the comment to be posted before replying");
        return { skipUpdate: true };
      }

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
        // Query exists - update it
        const first = prevReplies.pages[0];
        const pages = [
          { ...first, replies: [tempReply, ...(first.replies || [])] },
          ...prevReplies.pages.slice(1),
        ];
        queryClient.setQueryData(infRepliesKey, { ...prevReplies, pages });
      } else {
        // Query doesn't exist yet - create it with the new reply
        queryClient.setQueryData(infRepliesKey, {
          pages: [
            {
              replies: [tempReply],
              totalCount: 1,
              hasMore: false,
              nextCursor: null,
            },
          ],
          pageParams: [undefined],
        });
      }

      // Suppress polling briefly to avoid bounce

      toast.success("Reply added!");
      return { previousComments, eventId: values.eventId };
    },
    onSuccess: (_data, variables, context) => {
      // Skip if this was prevented due to temp parent ID
      if (context?.skipUpdate) return;

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
      }, 2500);
    },
    onError: (error, variables, context) => {
      // Skip if this was prevented due to temp parent ID
      if (context?.skipUpdate) return;

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
  if (comment.id === targetCommentId) {
    const existingReactionIndex = (comment.reactions || []).findIndex(
      (r) => r.userId === user.id && r.emoji === emoji
    );

    if (existingReactionIndex >= 0) {
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

  return {
    ...comment,
    replies: (comment.replies || []).map((reply) =>
      updateCommentWithReaction(reply, targetCommentId, emoji, user)
    ),
  };
}

// Global map to track pending deletions with localStorage persistence
const PENDING_DELETIONS_KEY = "pending-comment-deletions";

// In-memory map for active timeouts
const pendingDeletions = new Map<
  string,
  { timeoutId: NodeJS.Timeout; commentData: EventCommentData }
>();

// Persistent storage for comment data across navigation
function getPendingDeletionsData(): Record<
  string,
  { commentData: EventCommentData; until: number }
> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(PENDING_DELETIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setPendingDeletionsData(
  data: Record<string, { commentData: EventCommentData; until: number }>
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_DELETIONS_KEY, JSON.stringify(data));
  } catch {}
}

function cleanupExpiredDeletions() {
  if (typeof window === "undefined") return;
  const data = getPendingDeletionsData();
  const now = Date.now();
  let hasChanges = false;

  Object.keys(data).forEach((commentId) => {
    if (data[commentId].until < now) {
      delete data[commentId];
      hasChanges = true;
    }
  });

  if (hasChanges) {
    setPendingDeletionsData(data);
  }
}

if (typeof window !== "undefined") {
  cleanupExpiredDeletions();
}

// Type for delete comment result
interface DeleteCommentResult {
  success?: boolean;
  error?: string;
  delayed?: boolean;
  serverDeleted?: boolean;
  undone?: boolean;
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteCommentResult,
    Error,
    { commentId: string; eventId: string; undoAction?: boolean }
  >({
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

      // Pause polling for this event's comments during deletion
      pausePolling(`event-comments-${data.eventId}`, 6000);

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(async () => {
          try {
            const result = await deleteCommentAction(data.commentId);

            pendingDeletions.delete(data.commentId);
            const persistentData = getPendingDeletionsData();
            delete persistentData[data.commentId];
            setPendingDeletionsData(persistentData);

            if (result.error) {
              reject(new Error(result.error));
              return;
            }
            // This will trigger onSuccess with the actual server result
            resolve({ success: result.success || true, serverDeleted: true });
          } catch (error) {
            pendingDeletions.delete(data.commentId);
            const persistentData = getPendingDeletionsData();
            delete persistentData[data.commentId];
            setPendingDeletionsData(persistentData);
            reject(error);
          }
        }, 5000); // 5 second delay

        pendingDeletions.set(data.commentId, {
          timeoutId,
          commentData: {} as EventCommentData, // Will be filled in onMutate
        });

        const persistentData = getPendingDeletionsData();
        persistentData[data.commentId] = {
          commentData: {
            id: data.commentId,
            content: "",
            imageUrl: null,
            eventId: data.eventId,
            userId: "",
            parentId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            editedAt: null,
            user: {
              id: "",
              firstName: "Unknown",
              lastName: null,
              nickname: null,
              image: null,
            },
            replies: [],
            reactions: [],
            _count: {
              replies: 0,
              reactions: 0,
            },
          } as EventCommentData, // Will be properly filled in onMutate
          until: Date.now() + 5000,
        };
        setPendingDeletionsData(persistentData);

        // Don't resolve immediately - toast is already shown in onMutate
      });
    },
    onMutate: async ({ commentId, eventId, undoAction }) => {
      // Pause polling immediately when starting deletion (unless it's an undo)
      if (!undoAction) {
        pausePolling(`event-comments-${eventId}`, 7000);
      }

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
      // Cancel ALL infinite replies queries for this event to prevent bounce
      await queryClient.cancelQueries({
        queryKey: ["infinite-replies", eventId],
        exact: false, // Cancel all variations
      });

      const rollbacks: Array<() => void> = [];
      let deletedComment: EventCommentData | null = null;

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
              // Deep clone the deleted comment to preserve all data
              deletedComment = {
                ...c,
                user: {
                  id: c.user?.id || "",
                  firstName: c.user?.firstName || "Unknown",
                  lastName: c.user?.lastName || null,
                  nickname: c.user?.nickname || null,
                  image: c.user?.image || null,
                },
                replies: c.replies || [],
                reactions: c.reactions || [],
                _count: {
                  replies: c._count?.replies || 0,
                  reactions: c._count?.reactions || 0,
                },
              };
              return null;
            }
            const child = removeRecursive(c.replies || []);
            if (child.removed) {
              removed = true;
              if (child.deletedComment) deletedComment = child.deletedComment;
              return {
                ...c,
                replies: child.list,
                _count: {
                  ...c._count,
                  replies: Math.max(0, (c._count?.replies || 0) - 1),
                },
              } as EventCommentData;
            }
            return { ...c, replies: child.list } as EventCommentData;
          })
          .filter(Boolean) as EventCommentData[];
        return { list: next, removed, deletedComment };
      };

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

      if (deletedComment) {
        const pending = pendingDeletions.get(commentId);
        if (pending) {
          pending.commentData = deletedComment;
        }

        const persistentData = getPendingDeletionsData();
        if (persistentData[commentId]) {
          const completeDeletedComment = {
            ...deletedComment,
            user: {
              id: deletedComment.user?.id || "",
              firstName: deletedComment.user?.firstName || "Unknown",
              lastName: deletedComment.user?.lastName || null,
              nickname: deletedComment.user?.nickname || null,
              image: deletedComment.user?.image || null,
            },
            replies: deletedComment.replies || [],
            reactions: deletedComment.reactions || [],
            _count: {
              replies: deletedComment._count?.replies || 0,
              reactions: deletedComment._count?.reactions || 0,
            },
          };
          persistentData[commentId].commentData = completeDeletedComment;
          setPendingDeletionsData(persistentData);
        }
      }

      // Show the toast with undo immediately
      if (!undoAction) {
        const isReply = deletedComment?.parentId;
        toast.success(isReply ? "Reply deleted" : "Comment deleted", {
          action: {
            label: "Undo",
            onClick: async () => {
              // Cancel the pending deletion
              const pending = pendingDeletions.get(commentId);
              if (pending) {
                clearTimeout(pending.timeoutId);
                pendingDeletions.delete(commentId);

                const persistentData = getPendingDeletionsData();
                delete persistentData[commentId];
                setPendingDeletionsData(persistentData);

                // Restore using rollbacks
                if (rollbacks && rollbacks.length > 0) {
                  rollbacks.forEach((rollback) => rollback());
                }

                // Always invalidate to ensure fresh data with proper user info
                setTimeout(() => {
                  queryClient.invalidateQueries({
                    queryKey: ["event-comments", eventId],
                    refetchType: "all",
                  });
                }, 100);

                toast.success("Comment restored");
              } else {
                toast.error(
                  "Unable to undo - deletion may have already completed"
                );
              }
            },
          },
        });
      }

      return { rollbacks, eventId, deletedComment };
    },
    onSuccess: (result, variables) => {
      // Don't show any toast here - already shown in onMutate

      if (result?.serverDeleted) {
        queryClient.invalidateQueries({
          queryKey: ["event-comments", variables.eventId],
          refetchType: "inactive",
        });
      }
    },
    onError: (_err, _vars, context) => {
      const ctx = context as { rollbacks?: Array<() => void> } | undefined;
      ctx?.rollbacks?.forEach((rb) => rb());
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
      const persistentData = getPendingDeletionsData();
      const persistentPending = persistentData[data.commentId];

      if (!pending && !persistentPending) {
        throw new Error("No pending deletion to undo");
      }

      // Cancel the pending deletion if it exists in memory
      if (pending) {
        clearTimeout(pending.timeoutId);
        pendingDeletions.delete(data.commentId);
      }

      if (persistentPending) {
        delete persistentData[data.commentId];
        setPendingDeletionsData(persistentData);
      }

      const commentData =
        pending?.commentData || persistentPending?.commentData;
      return { success: true, commentData };
    },
    onMutate: async ({ commentId, eventId }) => {
      // Pause polling immediately when starting deletion
      pausePolling(`event-comments-${eventId}`, 7000);
      const pending = pendingDeletions.get(commentId);
      const persistentData = getPendingDeletionsData();
      const persistentPending = persistentData[commentId];

      const commentData =
        pending?.commentData || persistentPending?.commentData;
      if (!commentData) return;

      await queryClient.cancelQueries({
        queryKey: ["event-comments", eventId],
      });
      await queryClient.cancelQueries({
        queryKey: ["infinite-event-comments", eventId],
      });
      await queryClient.cancelQueries({ queryKey: ["infinite-replies"] });

      const restoreRecursive = (
        list: EventCommentData[],
        parentId?: string
      ): EventCommentData[] => {
        if (commentData.parentId === parentId) {
          // This is where the comment should be restored
          const existingIndex = list.findIndex((c) => c.id === commentId);
          if (existingIndex === -1) {
            const restoredComment: EventCommentData = {
              ...commentData,
              createdAt: commentData.createdAt || new Date().toISOString(),
              updatedAt: commentData.updatedAt || new Date().toISOString(),
              editedAt: commentData.editedAt || null,
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

            const newList = [...list, restoredComment];
            return newList.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
          }
        }

        // Check replies recursively and update counts
        return list.map((comment) => {
          const restoredReplies = restoreRecursive(
            comment.replies || [],
            comment.id
          );
          const hadReplyRestored =
            restoredReplies.length > (comment.replies || []).length;

          return {
            ...comment,
            replies: restoredReplies,
            // Increment reply count if a reply was restored to this comment
            _count: hadReplyRestored
              ? {
                  ...comment._count,
                  replies: (comment._count?.replies || 0) + 1,
                }
              : comment._count,
          };
        });
      };

      if (!commentData.parentId) {
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
      } else {
        // For replies, we need to update the parent comment's reply count in main queries
        // but NOT add the reply to the main comments list
        const updateParentReplyCount = (
          comments: EventCommentData[]
        ): EventCommentData[] => {
          return comments.map((comment) => {
            if (comment.id === commentData.parentId) {
              return {
                ...comment,
                _count: {
                  ...comment._count,
                  replies: (comment._count?.replies || 0) + 1,
                },
              };
            }
            return {
              ...comment,
              replies: updateParentReplyCount(comment.replies || []),
            };
          });
        };

        const nonInfiniteKey = ["event-comments", eventId];
        const prevNonInfinite =
          queryClient.getQueryData<CommentsResponse>(nonInfiniteKey);
        if (prevNonInfinite) {
          queryClient.setQueryData<CommentsResponse>(nonInfiniteKey, {
            ...prevNonInfinite,
            comments: updateParentReplyCount(prevNonInfinite.comments),
          });
        }

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
            comments: updateParentReplyCount(page.comments),
          }));
          queryClient.setQueryData(key, { ...prev, pages });
        });
      }

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

          const firstPage = prev.pages[0];
          if (firstPage) {
            const existingIndex = firstPage.replies.findIndex(
              (r) => r.id === commentId
            );
            if (existingIndex === -1) {
              // Use the same properly structured comment data
              const restoredComment: EventCommentData = {
                ...commentData,
                createdAt: commentData.createdAt || new Date().toISOString(),
                updatedAt: commentData.updatedAt || new Date().toISOString(),
                editedAt: commentData.editedAt || null,
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
