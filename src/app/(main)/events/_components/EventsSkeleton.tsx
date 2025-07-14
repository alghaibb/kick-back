import { Skeleton } from "@/components/ui/skeleton";

export function EventsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Today's Events Section */}
      <div>
        <Skeleton className="h-7 w-32 mb-4" /> {/* "Today's Events" title */}
        <Skeleton className="h-5 w-36" /> {/* "No events today." */}
      </div>

      {/* Upcoming Events Section */}
      <div>
        <Skeleton className="h-7 w-40 mb-4" /> {/* "Upcoming Events" title */}
        <Skeleton className="h-5 w-44" /> {/* "No upcoming events." */}
      </div>

      {/* Past Events Section */}
      <div>
        <Skeleton className="h-7 w-28 mb-4" /> {/* "Past Events" title */}
        <Skeleton className="h-5 w-36" /> {/* "No past events." */}
      </div>
    </div>
  );
}
