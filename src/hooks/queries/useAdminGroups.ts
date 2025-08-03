"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

interface Group {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    image?: string | null;
  };
  members: {
    id: string;
    role: string;
    joinedAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string | null;
      email: string;
      image?: string | null;
    };
  }[];
  _count: {
    members: number;
    events: number;
  };
}

interface GroupsResponse {
  groups: Group[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface GroupsParams {
  page?: number;
  limit?: number;
}

async function fetchAdminGroups(params: GroupsParams = {}): Promise<GroupsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());

  const response = await fetch(`/api/admin/groups?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch groups");
  }

  return response.json();
}

export function useAdminGroups() {
  return useInfiniteQuery({
    queryKey: ["admin-groups"],
    queryFn: ({ pageParam = 1 }) => fetchAdminGroups({ page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNext) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
} 