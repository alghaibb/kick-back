"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function AuthRedirectPage() {
  const { user, isLoading, error } = useAuth();
  const router = useRouter();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    // Prevent infinite redirect loops
    if (redirectAttempts >= 3) {
      console.error("Too many redirect attempts, redirecting to login");
      router.replace("/login");
      return;
    }

    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
      console.error("Auth redirect timeout, redirecting to login");
      router.replace("/login");
    }, 10000); // 10 second timeout

    if (!isLoading) {
      clearTimeout(timeout);

      if (user) {
        setRedirectAttempts((prev) => prev + 1);
        if (!user.hasOnboarded) {
          router.replace("/onboarding");
        } else {
          router.replace("/dashboard");
        }
      } else if (error || !user) {
        setRedirectAttempts((prev) => prev + 1);
        router.replace("/login");
      }
    }

    return () => clearTimeout(timeout);
  }, [user, isLoading, error, router, redirectAttempts]);

  if (timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="large" />
        <p className="mt-4 text-muted-foreground">Setting up your account...</p>
      </div>
    </div>
  );
}
