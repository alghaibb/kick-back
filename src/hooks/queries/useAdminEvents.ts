import { useInfiniteQuery } from "@tanstack/react-query";

interface Event {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  groupId: string | null;
  createdBy: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    image?: string | null;
  };
  group?: {
    id: string;
    name: string;
  } | null;
  _count: {
    eventAttendees: number;
  };
}

interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface EventsParams {
  page?: number;
  limit?: number;
}

async function fetchAdminEvents(
  params: EventsParams = {}
): Promise<EventsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  const response = await fetch(
    `/api/admin/events?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  return response.json();
}

export function useAdminEvents(params: Omit<EventsParams, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: ["admin", "events", params],
    queryFn: ({ pageParam = 1 }) =>
      fetchAdminEvents({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNext
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error?.message?.includes("Forbidden")) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });
} 