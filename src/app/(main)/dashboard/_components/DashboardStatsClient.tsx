"use client";

import { useDashboardStats } from "@/hooks/queries/useDashboardStats";
import { dashboardStatsTemplate } from "./dashboard-data";
import { StatsCard } from "./StatsCard";
import { UnifiedSkeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/ui/list-animations";
import { ActionLoader } from "@/components/ui/loading-animations";

export function DashboardStatsClient() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-5 auto-rows-fr">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl flex flex-col items-center justify-center space-y-4"
          >
            <ActionLoader action="sync" size="lg" />
            <div className="text-center space-y-2">
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              <div className="h-8 bg-muted rounded w-16 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full">
          <div className="flex items-center justify-center p-12 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 mx-auto">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-semibold text-foreground">
                Unable to load stats
              </h3>
              <p className="text-muted-foreground">
                Failed to load dashboard stats. Please try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <UnifiedSkeleton variant="dashboard-stats" count={4} />;
  }

  const dashboardStats = [
    {
      ...dashboardStatsTemplate[0],
      title: stats.todaysEventsLabel,
      value: stats.todaysEventsCount,
      change: <span className="block mt-2">{stats.nextTodayEventText}</span>,
    },
    {
      ...dashboardStatsTemplate[1],
      value: stats.upcomingEvents,
      change: (
        <span className="block mt-2">{stats.nextEventDateFormatted}</span>
      ),
    },
    {
      ...dashboardStatsTemplate[2],
      value: stats.groups,
      change: (
        <span className="block mt-2">Active groups: {stats.activeGroups}</span>
      ),
    },
    {
      ...dashboardStatsTemplate[3],
      value: stats.eventsCreated,
      change: (
        <span className="block mt-2">{stats.upcomingCreatedEventsText}</span>
      ),
    },
    {
      title: "Saved Events",
      value: stats.savedEventsCount || 0,
      change: (
        <span className="block mt-2">
          {stats.savedEventsCount
            ? `${stats.savedEventsCount} event${stats.savedEventsCount > 1 ? "s" : ""} saved`
            : "Save events for quick access"}
        </span>
      ),
      icon: "Star",
    },
  ];

  return (
    <AnimatedList className="grid gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-5 auto-rows-fr">
      {dashboardStats.map((stat) => (
        <AnimatedListItem key={stat.title}>
          <StatsCard {...stat} />
        </AnimatedListItem>
      ))}
    </AnimatedList>
  );
}
