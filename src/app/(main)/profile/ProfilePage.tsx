import { Suspense } from "react";
import { ProfileContent } from "./_components/ProfileContent";
import { UnifiedSkeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-start justify-center p-4 pt-8">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Update your account information and preferences
          </p>
        </div>

              <Suspense fallback={<UnifiedSkeleton variant="profile" />}>
        <ProfileContent />
      </Suspense>
      </div>
    </div>
  );
}
