import { GroupsSkeleton } from "./_components/GroupsSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-8">
      {/* Page Header Skeleton */}
      <div className="space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6" /> {/* Users icon */}
            <Skeleton className="h-8 w-16" /> {/* "Groups" title */}
          </div>
          <Skeleton className="h-10 w-28" /> {/* "Create Group" button */}
        </div>
        <Skeleton className="h-5 w-72" /> {/* "Manage and create groups for your events or collaborations." subtitle */}
      </div>
      
      <GroupsSkeleton />
    </div>
  );
}
