import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AdminStats {
  totalUsers: number;
  activeEvents: number;
  contactMessages: number;
  pendingContactMessages: number;
  totalGroups: number;
  recentActivity: number;
  growth: {
    usersThisWeek: number;
    usersLastWeek: number;
    userGrowthRate: number;
    eventsGrowthRate: number;
  };
  lastUpdated: string;
  cached?: boolean;
  cacheAge?: number;
  stale?: boolean;
}

async function fetchAdminStats(): Promise<AdminStats> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch("/api/admin/stats", {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch admin stats`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Failed to fetch admin stats:", error);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - stats are taking too long to load');
      }
      throw error;
    }

    throw new Error('Failed to fetch admin stats');
  }
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: fetchAdminStats,
    staleTime: 2 * 60 * 1000, // 2 minutes - frequent updates for admin
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors or rate limit errors
      if (error instanceof Error &&
        (error.message.includes('Forbidden') ||
          error.message.includes('Rate limit'))) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: true, // Refresh when admin comes back to tab
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    refetchIntervalInBackground: false,
  });
}

// Hook to manually refresh stats and clear cache
export function useRefreshAdminStats() {
  const queryClient = useQueryClient();

  return async () => {
    // Clear server-side cache first
    try {
      await fetch("/api/admin/stats", { method: "DELETE" });
    } catch (error) {
      console.error("Failed to clear server cache:", error);
    }

    // Invalidate and refetch client cache
    await queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    return queryClient.refetchQueries({ queryKey: ["admin", "stats"] });
  };
}

// Hook to prefetch stats for better UX
export function usePrefetchAdminStats() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: ["admin", "stats"],
      queryFn: fetchAdminStats,
      staleTime: 2 * 60 * 1000,
    });
  };
}