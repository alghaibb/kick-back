export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { SettingsContent } from "./_components/SettingsContent";
import { UnifiedSkeleton } from "@/components/ui/skeleton";
import { PageErrorBoundary } from "@/components/ui/error-boundary";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account security, email, timezone, and notification preferences",
};

export default function SettingsPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-start justify-center p-4 pt-8">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account security, email, timezone, and notification
            preferences
          </p>
        </div>

        <PageErrorBoundary title="Settings Page">
          <Suspense fallback={<UnifiedSkeleton variant="form" count={6} />}>
            <SettingsContent />
          </Suspense>
        </PageErrorBoundary>
      </div>
    </div>
  );
}
