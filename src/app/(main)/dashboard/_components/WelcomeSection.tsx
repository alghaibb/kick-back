"use client";

import { useAuth } from "@/hooks/use-auth";
import { Sparkles } from "lucide-react";

interface WelcomeSectionProps {
  subtitle?: string;
}

export function WelcomeSection({
  subtitle = "Ready to plan your next amazing event?",
}: WelcomeSectionProps) {
  const { user } = useAuth();
  const name = user?.nickname || user?.firstName || "back";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Welcome back, {name}!
          </h1>
          <p className="text-muted-foreground text-lg mt-2 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
