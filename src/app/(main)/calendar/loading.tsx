import { CalendarSkeleton } from "./_components/CalendarSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-8">
      {/* Page Header Skeleton */}
      <div className="space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6" /> {/* Calendar icon */}
            <Skeleton className="h-8 w-32" /> {/* "Your Calendar" title */}
          </div>
        </div>
        <Skeleton className="h-5 w-64" /> {/* "View all your upcoming events here" subtitle */}
      </div>
      
      <CalendarSkeleton />
    </div>
  );
}
