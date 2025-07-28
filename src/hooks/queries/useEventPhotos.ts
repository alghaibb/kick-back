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

  // Calculate polling interval based on recent activity
  const getPollingInterval = () => {
    const timeSinceActivity = Date.now() - lastActivity;

    // If activity within last 3 minutes: poll every 15 seconds (very aggressive)
    if (timeSinceActivity < 3 * 60 * 1000) return 15 * 1000;

    // If activity within last 15 minutes: poll every 1 minute  
    if (timeSinceActivity < 15 * 60 * 1000) return 60 * 1000;

    // Otherwise: poll every 5 minutes (efficient when idle)
    return 5 * 60 * 1000;
  };

  const query = useQuery({
    queryKey: ["event-photos", eventId],
    queryFn: () => fetchEventPhotos(eventId),
    enabled: !!eventId,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: getPollingInterval(),
    refetchOnWindowFocus: false,
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
