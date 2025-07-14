import { EventsSkeleton } from "./_components/EventsSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-8">
      {/* Page Header Skeleton */}
      <div className="space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6" /> {/* Calendar icon */}
            <Skeleton className="h-8 w-16" /> {/* "Events" title */}
          </div>
          <Skeleton className="h-10 w-28" /> {/* "Create Event" button */}
        </div>
        <Skeleton className="h-5 w-48" /> {/* "Manage and view all your events." subtitle */}
      </div>
      
      <EventsSkeleton />
    </div>
  );
}
