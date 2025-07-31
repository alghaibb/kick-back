"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface NotificationsResponse {
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    data: unknown;
  }>;
  unreadCount: number;
}

async function fetchNotifications(): Promise<NotificationsResponse> {
  const response = await fetch("/api/notifications");
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  return response.json();
}

export function useTitleBadge() {
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Check every 30 seconds
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });

  useEffect(() => {
    const baseTitle = "Kick Back";
    const unreadCount = data?.unreadCount || 0;

    // Update document title with badge
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = baseTitle;
    };
  }, [data?.unreadCount]);

  return {
    unreadCount: data?.unreadCount || 0,
  };
}
