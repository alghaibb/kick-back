import { Metadata } from "next";
import { DashboardQuickActionsClient } from "./_components/DashboardQuickActionsClient";
import { DashboardStatsClient } from "./_components/DashboardStatsClient";
import { WelcomeSection } from "./_components/WelcomeSection";
import { PageErrorBoundary, ComponentErrorBoundary } from "@/components/ui/error-boundary";

export const metadata: Metadata = {
  title: "Dashboard | Kick Back",
  description: "Your personal event planning dashboard",
};

export default function Page() {
  return (
    <PageErrorBoundary title="Dashboard">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Welcome Section */}
        <ComponentErrorBoundary title="Welcome Section">
          <div className="bg-card border border-border rounded-2xl p-8">
            <WelcomeSection />
          </div>
        </ComponentErrorBoundary>

        {/* Overview Section */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Here&apos;s what&apos;s happening with your events and plans.
            </p>
          </div>

          <ComponentErrorBoundary title="Dashboard Stats">
            <DashboardStatsClient />
          </ComponentErrorBoundary>
        </div>

        {/* Quick Actions Section */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Quick Actions</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started with these common tasks.
            </p>
          </div>

          <ComponentErrorBoundary title="Quick Actions">
            <DashboardQuickActionsClient />
          </ComponentErrorBoundary>
        </div>
      </div>
    </PageErrorBoundary>
  );
}
