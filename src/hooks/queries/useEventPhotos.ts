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
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
