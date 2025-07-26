"use client";

import { useQuery } from "@tanstack/react-query";

export interface CommentUser {
  id: string;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  image: string | null;
}

export interface EventCommentData {
  id: string;
  content: string;
  eventId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
}

async function fetchEventComments(
  eventId: string
): Promise<EventCommentData[]> {
  const response = await fetch(`/api/events/${eventId}/comments`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }

  return response.json();
}

export function useEventComments(eventId: string) {
  return useQuery({
    queryKey: ["event-comments", eventId],
    queryFn: () => fetchEventComments(eventId),
    enabled: !!eventId,
  });
}
