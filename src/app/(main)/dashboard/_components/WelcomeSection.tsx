"use client";

import { useAuth } from "@/hooks/use-auth";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ActionLoader } from "@/components/ui/loading-animations";

interface WelcomeSectionProps {
  subtitle?: string;
}

export function WelcomeSection({
  subtitle = "Ready to plan your next amazing event?",
}: WelcomeSectionProps) {
  const { user, isLoading, error, isUnauthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isUnauthenticated || error?.message === "UNAUTHORIZED") {
      // User not authenticated, redirecting to login
      router.replace("/login");
    }
  }, [isUnauthenticated, error, router]);

  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 mx-auto sm:mx-0">
            {isLoading ? (
              <ActionLoader action="sync" size="sm" className="text-primary" />
            ) : (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            )}
          </div>
          <div className="text-center sm:text-left">
            <div className="h-8 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no user (should redirect above)
  if (!user) {
    return null;
  }

  const name = user.nickname || user.firstName || "back";

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 mx-auto sm:mx-0">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Welcome back, {name}!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mt-1 sm:mt-2 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
