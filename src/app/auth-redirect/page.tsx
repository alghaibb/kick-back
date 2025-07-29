"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function AuthRedirectPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  console.log("AuthRedirectPage:", {
    user,
    isLoading,
    hasOnboarded: user?.hasOnboarded,
  });

  useEffect(() => {
    console.log("AuthRedirectPage useEffect:", { user, isLoading });

    if (!isLoading && user) {
      console.log("User found, hasOnboarded:", user.hasOnboarded);
      if (!user.hasOnboarded) {
        console.log("Redirecting to onboarding");
        router.replace("/onboarding");
      } else {
        console.log("Redirecting to dashboard");
        router.replace("/dashboard");
      }
    } else if (!isLoading && !user) {
      console.log("No user found, redirecting to login");
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Show loading while determining where to redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="large" />
        <p className="mt-4 text-muted-foreground">Setting up your account...</p>
      </div>
    </div>
  );
}
