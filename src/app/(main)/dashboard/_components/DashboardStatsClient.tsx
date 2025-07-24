"use client";

import { useDashboardStats } from "@/hooks/queries/useDashboardStats";
import { dashboardStatsTemplate } from "./dashboard-data";
import { StatsCard } from "./StatsCard";
import { DashboardSkeleton } from "./DashboardSkeleton";

export function DashboardStatsClient() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full text-center text-muted-foreground">
          Failed to load dashboard stats. Please try again.
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {dashboardStats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
