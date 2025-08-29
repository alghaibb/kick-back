"use client";

import { useQuery } from "@tanstack/react-query";
import { getPhotoLikeSuppressRemaining } from "@/hooks/queries/_likesRefetchControl";
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

async function fetchEventPhotos(
  eventId: string
): Promise<{ photos: EventPhotoData[] }> {
  const response = await fetch(`/api/events/${eventId}/photos`, {
    credentials: "include",
    cache: "no-store",
    headers: { "cache-control": "no-store" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch photos");
  }

  return response.json();
}

export function useEventPhotos(eventId: string) {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Lightning-fast polling for instant photo likes like Instagram
  const getPollingInterval = () => {
    const timeSinceActivity = Date.now() - lastActivity;

    // If activity within last 30 seconds: poll every 1 second (Instagram speed)
    if (timeSinceActivity < 30 * 1000) return 1000;

    // If activity within last 2 minutes: poll every 2 seconds (ultra-fast)
    if (timeSinceActivity < 2 * 60 * 1000) return 2000;

    // If activity within last 5 minutes: poll every 5 seconds (still very fast)
    if (timeSinceActivity < 5 * 60 * 1000) return 5000;

    // If activity within last 15 minutes: poll every 15 seconds
    if (timeSinceActivity < 15 * 60 * 1000) return 15000;

    // Otherwise: poll every 30 seconds (still quite fast)
    return 30000;
  };

  const query = useQuery({
    queryKey: ["event-photos", eventId],
    queryFn: () => fetchEventPhotos(eventId),
    enabled: !!eventId,
    staleTime: 0, // keep fresh to align with optimistic likes
    gcTime: 10 * 60 * 1000,
    refetchInterval: (q) => {
      // Delay polling if a like was just optimistically toggled
      const data = q.state.data as { photos: EventPhotoData[] } | undefined;
      const suppress = (data?.photos || []).reduce((max, p) => {
        const remain = getPhotoLikeSuppressRemaining(p.id);
        return Math.max(max, remain);
      }, 0);
      if (suppress > 0) return suppress;
      return getPollingInterval();
    },
    refetchOnWindowFocus: true, // Re-enable for instant updates
    refetchOnReconnect: true,
    // Optimize network requests
    retry: 1,
    retryDelay: 1000,
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
        (photo) => photo._count.likes > 0
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
