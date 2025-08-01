import { useQuery } from "@tanstack/react-query";

interface AdminStats {
  totalUsers: number;
  activeEvents: number;
  contactMessages: number;
  totalGroups: number;
}

async function fetchAdminStats(): Promise<AdminStats> {
  const response = await fetch("/api/admin/stats");

  if (!response.ok) {
    throw new Error("Failed to fetch admin stats");
  }

  return response.json();
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: fetchAdminStats,
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent updates for admin
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error?.message?.includes("Forbidden")) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always fetch fresh data when mounting
  });
}
