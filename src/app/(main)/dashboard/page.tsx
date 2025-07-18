export const dynamic = "force-dynamic";

import { getDashboardStats } from "@/lib/dashboard-stats";
import { getSession } from "@/lib/sessions";
import { Metadata } from "next";
import { Suspense } from "react";
import { dashboardStatsTemplate } from "./_components/dashboard-data";
import { DashboardQuickActionsClient } from "./_components/DashboardQuickActionsClient";
import { DashboardSkeleton } from "./_components/DashboardSkeleton";
import { StatsCard } from "./_components/StatsCard";
import { WelcomeSection } from "./_components/WelcomeSection";

export const metadata: Metadata = {
  title: "Dashboard | Kick Back",
  description: "Your personal event planning dashboard",
};

async function DashboardStats() {
  const session = await getSession();
  const userId = session?.user?.id;

  const stats = userId ? await getDashboardStats(userId) : null;

  const dashboardStats = [
    {
      ...dashboardStatsTemplate[0],
      title: stats?.todaysEventsLabel ?? dashboardStatsTemplate[0].title,
      value: stats?.todaysEventsCount ?? 0,
      change: <span className="block mt-2">{stats?.nextTodayEventText}</span>,
    },
    {
      ...dashboardStatsTemplate[1],
      value: stats?.upcomingEvents ?? 0,
      change: (
        <span className="block mt-2">{stats?.nextEventDateFormatted}</span>
      ),
    },
    {
      ...dashboardStatsTemplate[2],
      value: stats?.groups ?? 0,
      change: (
        <span className="block mt-2">
          Active groups: {stats?.activeGroups ?? 0}
        </span>
      ),
    },
    {
      ...dashboardStatsTemplate[3],
      value: stats?.eventsCreated ?? 0,
      change: (
        <span className="block mt-2">{stats?.upcomingCreatedEventsText}</span>
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

export default async function Page() {
  return (
    <>
      <div className="space-y-8">
        <WelcomeSection />

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your events and plans.
            </p>
          </div>

          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardStats />
          </Suspense>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Quick Actions
              </h2>
              <p className="text-muted-foreground">
                Get started with these common tasks.
              </p>
            </div>
          </div>

          <DashboardQuickActionsClient />
        </div>
      </div>
    </>
  );
}
