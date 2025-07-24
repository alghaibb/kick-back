import { Metadata } from "next";
import { DashboardQuickActionsClient } from "./_components/DashboardQuickActionsClient";
import { DashboardStatsClient } from "./_components/DashboardStatsClient";
import { WelcomeSection } from "./_components/WelcomeSection";

export const metadata: Metadata = {
  title: "Dashboard | Kick Back",
  description: "Your personal event planning dashboard",
};

export default function Page() {
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

          <DashboardStatsClient />
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
