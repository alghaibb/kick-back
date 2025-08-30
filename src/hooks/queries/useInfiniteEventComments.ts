"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSmartPolling } from "@/hooks/useSmartPolling";
import type { EventCommentData } from "./useEventComments";

interface InfiniteCommentsResponse {
  comments: EventCommentData[];
  totalCount: number;
  hasMore: boolean;
  nextCursor: string | null;
}

interface InfiniteRepliesResponse {
  replies: EventCommentData[];
  totalCount: number;
  hasMore: boolean;
  nextCursor: string | null;
}

async function fetchEventCommentsPage(
  eventId: string,
  sortBy: "newest" | "oldest" = "newest",
  cursor?: string,
  limit: number = 10
): Promise<InfiniteCommentsResponse> {
  const params = new URLSearchParams({
    sortBy,
    limit: limit.toString(),
  });

  if (cursor) {
    params.append("cursor", cursor);
  }

  const response = await fetch(
    `/api/events/${eventId}/comments?${params.toString()}`,
    {
      credentials: "include",
      cache: "no-store",
      headers: { "cache-control": "no-store" },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }

  return response.json();
}

async function fetchRepliesPage(
  eventId: string,
  commentId: string,
  cursor?: string,
  limit: number = 10
): Promise<InfiniteRepliesResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });

  if (cursor) {
    params.append("cursor", cursor);
  }

  const response = await fetch(
    `/api/events/${eventId}/comments/${commentId}/replies?${params.toString()}`,
    {
      credentials: "include",
      cache: "no-store",
      headers: { "cache-control": "no-store" },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch replies");
  }

  return response.json();
}

export function useInfiniteEventComments(
  eventId: string,
  sortBy: "newest" | "oldest" = "newest",
  limit: number = 10
) {
  const { pollingInterval } = useSmartPolling({ strategy: "ultra-fast" });

  return useInfiniteQuery({
    queryKey: ["infinite-event-comments", eventId, sortBy, limit],
    queryFn: ({ pageParam }) =>
      fetchEventCommentsPage(eventId, sortBy, pageParam, limit),
    enabled: !!eventId,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    staleTime: 5000, // 5 seconds - good balance between freshness and performance
    gcTime: 10 * 60 * 1000,
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchIntervalInBackground: false,
  });
}

export function useInfiniteReplies(
  eventId: string,
  commentId: string,
  enabled: boolean = true,
  limit: number = 10
) {
  const { pollingInterval } = useSmartPolling({ strategy: "ultra-fast" });

  return useInfiniteQuery({
    queryKey: ["infinite-replies", eventId, commentId, limit],
    queryFn: ({ pageParam }) =>
      fetchRepliesPage(eventId, commentId, pageParam, limit),
    enabled: enabled && !!eventId && !!commentId,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    staleTime: 5000, // 5 seconds - good balance between freshness and performance
    gcTime: 10 * 60 * 1000,
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchIntervalInBackground: false,
  });
}
