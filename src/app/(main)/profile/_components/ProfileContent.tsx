"use client";

import { useProfile } from "@/hooks/queries/useProfile";
import { ProfileForm } from "../ProfileForm";
import { UnifiedSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProfileContent() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const { data: user, isLoading, error } = useProfile();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authUser) {
      router.push("/login");
    }
  }, [authUser, router]);

  if (!authUser) {
    return <UnifiedSkeleton variant="profile" />;
  }

  if (isLoading) {
    return <UnifiedSkeleton variant="profile" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Failed to load profile data</p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-500 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return <ProfileForm user={user} />;
}
