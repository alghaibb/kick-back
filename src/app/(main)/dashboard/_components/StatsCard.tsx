"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, TrendingUp, Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: ReactNode;
  icon: string;
}

const iconMap = {
  Calendar,
  Users,
  TrendingUp,
  Sparkles,
} as const;

export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap];

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group h-full min-w-[240px]">
      {/* Gradient Background using theme colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

      {/* Subtle Border using theme colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-border/20 via-transparent to-border/20 rounded-lg" />

      <div className="relative bg-card/80 backdrop-blur-sm h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground tracking-wide uppercase">
            {title}
          </CardTitle>
          {IconComponent && (
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/50 border border-border/50 mt-1">
              <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3 pb-4 flex-1">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            {typeof value === "number" ? `+${value}` : value}
          </div>
          {change && (
            <div className="text-xs sm:text-sm text-muted-foreground">
              {change}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
