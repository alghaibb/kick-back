"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

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
  const response = await fetch(`/api/events/${eventId}/comments?sortBy=${sortBy}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }

  return response.json();
}

export function useEventComments(eventId: string, sortBy: "newest" | "oldest" = "newest") {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  const query = useQuery({
    queryKey: ["event-comments", eventId, sortBy],
    queryFn: () => fetchEventComments(eventId, sortBy),
    enabled: !!eventId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000,
    refetchInterval: false, // Disable polling temporarily to test scroll issue
    refetchOnWindowFocus: false, // Disable to prevent scroll jumps
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
    refetchIntervalInBackground: false, // Disable background refetching
  });

  // Update activity timestamp when new comments arrive
  useEffect(() => {
    if (query.data?.comments && query.data.comments.length > 0) {
      const latestComment = query.data.comments[0]; // Assuming sorted by newest first
      const commentTime = new Date(latestComment.createdAt).getTime();

      // If comment is recent (within 5 minutes), mark as activity
      if (Date.now() - commentTime < 5 * 60 * 1000) {
        setLastActivity(Date.now());
      }
    }
  }, [query.data]);

  return query;
}
