import { useQuery } from "@tanstack/react-query";

interface EventPhoto {
  id: string;
  eventId: string;
  userId: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    nickname: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
  };
  isLikedByUser: boolean;
  isUploading?: boolean; // For optimistic UI
}

async function fetchEventPhotos(
  eventId: string
): Promise<{ photos: EventPhoto[] }> {
  const response = await fetch(`/api/events/${eventId}/photos`);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error("Failed to fetch photos");
  }

  return response.json();
}

export function useEventPhotos(eventId: string) {
  return useQuery({
    queryKey: ["event-photos", eventId],
    queryFn: () => fetchEventPhotos(eventId),
    enabled: !!eventId,
    // Real-time photos and likes with polling
    staleTime: 0,                 // Always consider data stale
    gcTime: 5 * 60 * 1000,        // 5 minutes
    refetchInterval: 15000,       // Refetch every 15 seconds
    refetchOnWindowFocus: true,   // Refetch when user comes back
    refetchOnReconnect: true,     // Refetch when connection restored
  });
}
