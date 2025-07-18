export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { SettingsContent } from "./_components/SettingsContent";
import { SettingsSkeleton } from "./_components/SettingsSkeleton";

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

        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsContent />
        </Suspense>
      </div>
    </div>
  );
}
