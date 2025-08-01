"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function AuthRedirectPage() {
  const { user, isLoading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (error) {
      router.replace("/login");
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    // Check if user is soft deleted
    if (user.deletedAt) {
      router.replace("/recover-account");
      return;
    }

    if (!user.hasOnboarded) {
      router.replace("/onboarding");
    } else {
      router.replace("/dashboard");
    }
  }, [user, isLoading, error, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="large" />
        <p className="mt-4 text-muted-foreground">Setting up your account...</p>
      </div>
    </div>
  );
}
