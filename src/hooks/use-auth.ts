"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  originalFirstName: string | null;
  originalLastName: string | null;
  email: string;
  nickname: string | null;
  image: string | null;
  timezone: string | null;
  hasOnboarded: boolean;
  notificationOptIn: boolean;
  inAppNotifications: boolean;
  pushNotifications: boolean;
  dashboardBackground: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  permanentlyDeletedAt: string | null;
}

async function fetchUser(): Promise<User> {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error("Failed to fetch user");
  }

  const user = await response.json();
  return user;
}

async function logoutUser(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to logout");
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1 * 60 * 1000, // Back to 1 minute for fresh data
    gcTime: 5 * 60 * 1000, // Back to 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized)
      if (error?.message === "UNAUTHORIZED") {
        return false;
      }
      return failureCount < 1;
    },
    refetchOnWindowFocus: true, // Re-enabled for fresh data on navigation
    refetchOnReconnect: true,
    refetchInterval: 5 * 60 * 1000, // Back to 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      toast.success("Logged out successfully");

      // Use replace instead of push and add small delay for mobile
      setTimeout(() => {
        router.replace("/login");
      }, 100);
    },
    onError: (error) => {
      console.error("Logout error:", error);
      // Even if logout fails, clear cache and redirect
      queryClient.clear();
      setTimeout(() => {
        router.replace("/login");
      }, 100);
    },
  });

  const refreshUser = () => {
    return refetch();
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  // Determine status based on query state
  const status = isLoading
    ? "loading"
    : user
      ? "authenticated"
      : "unauthenticated";

  return {
    user: user || null,
    status,
    isLoading,
    isAuthenticated: !!user && !isLoading,
    isUnauthenticated: !user && !isLoading,
    error,
    refreshUser,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}
