import { useQuery } from "@tanstack/react-query";
import { useSmartPolling } from "@/hooks/useSmartPolling";

export interface SettingsUser {
  id: string;
  email: string;
  timezone: string | null;
  reminderTime: string;
  reminderType: "email" | "sms" | "both";
  phoneNumber: string | null;
  notificationOptIn: boolean;
  inAppNotifications: boolean;
}

export interface SettingsData {
  user: SettingsUser;
  hasPassword: boolean;
}

async function fetchSettings(): Promise<SettingsData> {
  const response = await fetch("/api/settings");
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error("Failed to fetch settings");
  }
  return response.json();
}

export function useSettings() {
  const { pollingInterval } = useSmartPolling({ strategy: "relaxed" });

  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes - settings don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error?.message === "UNAUTHORIZED") {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: pollingInterval, // Smart polling for real-time updates
  });
}
