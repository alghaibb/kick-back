"use client";

import { useSettings } from "@/hooks/queries/useSettings";
import { SettingsForm } from "../SettingsForm";
import { UnifiedSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SettingsContent() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const { data: settingsData, isLoading, error } = useSettings();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    }
  }, [authUser, router]);

  if (!authUser) {
    return <UnifiedSkeleton variant="form" count={6} />;
  }

  if (isLoading) {
    return <UnifiedSkeleton variant="form" count={6} />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Failed to load settings data</p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-500 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!settingsData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Settings not found</p>
      </div>
    );
  }

  return (
    <SettingsForm
      user={settingsData.user}
      hasPassword={settingsData.hasPassword}
    />
  );
}
