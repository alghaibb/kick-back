"use client";

import { useDashboardStats } from "@/hooks/queries/useDashboardStats";
import { dashboardStatsTemplate } from "./dashboard-data";
import { StatsCard } from "./StatsCard";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { AlertCircle } from "lucide-react";

export function DashboardStatsClient() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return <DashboardSkeleton />;
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
    return <DashboardSkeleton />;
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
  ];

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {dashboardStats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
