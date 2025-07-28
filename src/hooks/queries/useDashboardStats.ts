"use client";

import { useQuery } from "@tanstack/react-query";

export interface DashboardStats {
  todaysEventsCount: number;
  nextTodayEvent: { name: string; date: Date } | null;
  upcomingEvents: number;
  groups: number;
  eventsCreated: number;
  activeGroups: number;
  nextEventDate: Date | null;
  upcomingCreatedEvents: number;
  nextEventDateFormatted: string;
  upcomingCreatedEventsText: string;
  nextTodayEventText: string;
  todaysEventsLabel: string;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/dashboard/stats", {
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error("Failed to fetch dashboard stats");
  }

  return response.json();
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.message === "UNAUTHORIZED") {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: 15 * 60 * 1000,
  });
} 