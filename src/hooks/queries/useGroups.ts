"use client";

import { useQuery } from "@tanstack/react-query";

export interface GroupMember {
  userId: string;
  role: string;
  user: {
    id: string;
    firstName?: string;
    email?: string;
    image?: string | null;
  };
}

export interface GroupData {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  createdBy: string;
  members: GroupMember[];
}

export interface CurrentUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  image?: string | null;
}

export interface GroupsResponse {
  groupsOwned: GroupData[];
  groupsIn: GroupData[];
  currentUser: CurrentUser;
}

async function fetchGroups(): Promise<GroupsResponse> {
  const response = await fetch("/api/groups", {
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error("Failed to fetch groups");
  }

  return response.json();
}

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
    staleTime: 3 * 60 * 1000, // 3 minutes - groups don't change super frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized)
      if (error?.message === "UNAUTHORIZED") {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Refetch every 10 minutes in the background to keep groups fresh
    refetchInterval: 10 * 60 * 1000,
  });
} 