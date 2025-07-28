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

  // Lightning-fast polling like YouTube/Facebook
  const getPollingInterval = () => {
    const timeSinceActivity = Date.now() - lastActivity;

    // If activity within last 30 seconds: poll every 1 second (YouTube/Facebook speed)
    if (timeSinceActivity < 30 * 1000) return 1000;

    // If activity within last 2 minutes: poll every 2 seconds (ultra-fast)
    if (timeSinceActivity < 2 * 60 * 1000) return 2000;

    // If activity within last 5 minutes: poll every 5 seconds (still very fast)
    if (timeSinceActivity < 5 * 60 * 1000) return 5000;

    // If activity within last 10 minutes: poll every 10 seconds
    if (timeSinceActivity < 10 * 60 * 1000) return 10000;

    // Otherwise: poll every 30 seconds (still quite fast)
    return 30000;
  };

  const query = useQuery({
    queryKey: ["event-comments", eventId, sortBy],
    queryFn: () => fetchEventComments(eventId, sortBy),
    enabled: !!eventId,
    staleTime: 1 * 1000, // 1 second - ultra-fresh data for YouTube-like speed
    gcTime: 10 * 60 * 1000,
    refetchInterval: getPollingInterval(), // Re-enable smart polling
    refetchOnWindowFocus: false, // Keep disabled to prevent scroll jumps
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
    refetchIntervalInBackground: false, // Keep disabled to prevent background scroll issues
  });

  // Update activity timestamp when new comments arrive or reactions change
  useEffect(() => {
    if (query.data?.comments && query.data.comments.length > 0) {
      const now = Date.now();
      let hasRecentActivity = false;

      // Check for recent comments (within 2 minutes)
      const latestComment = query.data.comments[0];
      const commentTime = new Date(latestComment.createdAt).getTime();
      if (now - commentTime < 2 * 60 * 1000) {
        hasRecentActivity = true;
      }

      // Check for comments with reactions (indicates recent activity)
      const commentsWithReactions = query.data.comments.filter(
        comment => comment.reactions.length > 0 ||
          comment.replies.some(reply => reply.reactions.length > 0)
      );
      if (commentsWithReactions.length > 0) {
        hasRecentActivity = true;
      }

      // Check for recent replies
      const hasRecentReplies = query.data.comments.some(comment =>
        comment.replies.some(reply => {
          const replyTime = new Date(reply.createdAt).getTime();
          return now - replyTime < 2 * 60 * 1000;
        })
      );
      if (hasRecentReplies) {
        hasRecentActivity = true;
      }

      if (hasRecentActivity) {
        setLastActivity(now);
      }
    }
  }, [query.data]);

  return query;
}
