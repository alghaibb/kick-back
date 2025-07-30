"use client";

import { useQuery } from "@tanstack/react-query";
import { useSmartPolling } from "@/hooks/useSmartPolling";

export interface GroupMember {
  userId: string;
  role: string;
  user: {
    id: string;
    firstName?: string;
    nickname?: string | null;
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
  nickname?: string | null;
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
  const { pollingInterval } = useSmartPolling({ strategy: "relaxed" });

  return useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.message === "UNAUTHORIZED") {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: pollingInterval,
  });
}
