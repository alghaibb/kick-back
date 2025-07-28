"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export interface EventPhotoData {
  id: string;
  imageUrl: string;
  caption: string | null;
  eventId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isUploading?: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    nickname: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
  };
  isLikedByUser: boolean;
}

async function fetchEventPhotos(eventId: string): Promise<{ photos: EventPhotoData[] }> {
  const response = await fetch(`/api/events/${eventId}/photos`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch photos");
  }

  return response.json();
}

export function useEventPhotos(eventId: string) {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Ultra-fast polling for real-time photo likes like Instagram
  const getPollingInterval = () => {
    const timeSinceActivity = Date.now() - lastActivity;

    // If activity within last 30 seconds: poll every 3 seconds (Instagram-level real-time)
    if (timeSinceActivity < 30 * 1000) return 3000;

    // If activity within last 2 minutes: poll every 5 seconds (ultra-aggressive)
    if (timeSinceActivity < 2 * 60 * 1000) return 5000;

    // If activity within last 5 minutes: poll every 10 seconds
    if (timeSinceActivity < 5 * 60 * 1000) return 10000;

    // If activity within last 15 minutes: poll every 30 seconds
    if (timeSinceActivity < 15 * 60 * 1000) return 30000;

    // Otherwise: poll every 60 seconds (still quite fast)
    return 60000;
  };

  const query = useQuery({
    queryKey: ["event-photos", eventId],
    queryFn: () => fetchEventPhotos(eventId),
    enabled: !!eventId,
    staleTime: 3 * 1000, // 3 seconds - ultra-fresh data
    gcTime: 10 * 60 * 1000,
    refetchInterval: getPollingInterval(),
    refetchOnWindowFocus: true, // Re-enable for instant updates
    refetchOnReconnect: true,
  });

  // Update activity timestamp when new photos arrive or likes change
  useEffect(() => {
    if (query.data?.photos && query.data.photos.length > 0) {
      const now = Date.now();
      let hasRecentActivity = false;

      // Check for recent photo uploads (within 10 minutes)
      const latestPhoto = query.data.photos[0];
      const photoTime = new Date(latestPhoto.createdAt).getTime();
      if (now - photoTime < 10 * 60 * 1000) {
        hasRecentActivity = true;
      }

      // Check for photos with any likes (suggests recent activity)
      const photosWithLikes = query.data.photos.filter(
        photo => photo._count.likes > 0
      );
      if (photosWithLikes.length > 0) {
        hasRecentActivity = true;
      }

      if (hasRecentActivity) {
        setLastActivity(now);
      }
    }
  }, [query.data]);

  return query;
}
