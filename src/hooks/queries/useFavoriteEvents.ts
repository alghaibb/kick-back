"use client";

import { useQuery } from "@tanstack/react-query";

interface EventWithFavorite {
  id: string;
  name: string;
  description?: string;
  date: string;
  location?: string;
  color?: string;
  createdBy: string;
  groupId?: string;
  isFavorited: boolean;
  group?: {
    id: string;
    name: string;
  };
  attendees?: Array<{
    id: string;
    userId: string;
    rsvpStatus: string;
  }>;
  _count?: {
    attendees: number;
    comments: number;
    photos: number;
    favorites: number;
  };
}

interface FavoriteEventsResponse {
  events: EventWithFavorite[];
}

export function useFavoriteEvents() {
  return useQuery<FavoriteEventsResponse>({
    queryKey: ["favorite-events"],
    queryFn: async () => {
      const response = await fetch("/api/events/favorites");

      if (!response.ok) {
        throw new Error("Failed to fetch favorite events");
      }

      const data = await response.json();
      return { events: data.favoriteEvents || [] };
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
