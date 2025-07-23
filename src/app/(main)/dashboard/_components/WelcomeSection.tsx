"use client";

import { useAuth } from "@/hooks/use-auth";

interface WelcomeSectionProps {
  subtitle?: string;
}

export function WelcomeSection({
  subtitle = "Ready to plan your next amazing event?",
}: WelcomeSectionProps) {
  const { user } = useAuth();
  const name = user?.nickname || user?.firstName || "back";
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">
        {`Welcome back, ${name}!`}
      </h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}
