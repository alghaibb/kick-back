import { UnifiedSkeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

export default function EventsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Events</h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage and view all your events in one place. Create, edit, and
            track your upcoming gatherings.
          </p>
        </div>
        <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
      </div>

      <UnifiedSkeleton variant="card-list" count={6} />
    </div>
  );
}
