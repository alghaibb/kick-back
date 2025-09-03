"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, TrendingUp, Sparkles, Star } from "lucide-react";
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
  Star,
} as const;

export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap];

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group h-full">
      {/* Gradient Background using theme colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

      {/* Subtle Border using theme colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-border/20 via-transparent to-border/20 rounded-lg" />

      <div className="relative bg-card/80 backdrop-blur-sm h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-xs lg:text-sm font-medium text-muted-foreground tracking-wide uppercase">
            {title}
          </CardTitle>
          {IconComponent && (
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-background/50 border border-border/50">
              <IconComponent className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-primary" />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-2 pb-3 sm:pb-4 flex-1">
          <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight">
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
