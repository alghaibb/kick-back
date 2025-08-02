"use client";

import { useQuery } from "@tanstack/react-query";
import { useSmartPolling } from "@/hooks/useSmartPolling";

export interface CommentReaction {
  id: string;
  emoji: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    nickname: string | null;
  };
}

export interface EventCommentData {
  id: string;
  content: string;
  imageUrl: string | null;
  eventId: string;
  userId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    nickname: string | null;
    image: string | null;
  };
  replies: EventCommentData[];
  reactions: CommentReaction[];
  _count: {
    replies: number;
    reactions: number;
  };
}

export interface CommentsResponse {
  comments: EventCommentData[];
  totalCount: number;
}

async function fetchEventComments(
  eventId: string,
  sortBy: "newest" | "oldest" = "newest"
): Promise<CommentsResponse> {
  const response = await fetch(
    `/api/events/${eventId}/comments?sortBy=${sortBy}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }

  return response.json();
}

export function useEventComments(
  eventId: string,
  sortBy: "newest" | "oldest" = "newest"
) {
  const { pollingInterval } = useSmartPolling({ strategy: "ultra-fast" });

  const query = useQuery({
    queryKey: ["event-comments", eventId, sortBy],
    queryFn: () => fetchEventComments(eventId, sortBy),
    enabled: !!eventId,
    staleTime: 5 * 1000, // 5 seconds - balance between freshness and performance
    gcTime: 10 * 60 * 1000,
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: false, // Keep disabled to prevent scroll jumps
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
    refetchIntervalInBackground: false, // Keep disabled to prevent background scroll issues
    // Optimize network requests
    retry: 1,
    retryDelay: 1000,
  });

  return query;
}
