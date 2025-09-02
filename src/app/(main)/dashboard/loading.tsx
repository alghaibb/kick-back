import { UnifiedSkeleton } from "@/components/ui/skeleton";
import { ActionLoader } from "@/components/ui/loading-animations";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="h-8 bg-muted rounded w-48 mx-auto animate-pulse" />
        <div className="h-4 bg-muted rounded w-64 mx-auto animate-pulse" />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl flex flex-col items-center justify-center space-y-4"
          >
            <ActionLoader action="sync" size="lg" />
            <div className="text-center space-y-2">
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              <div className="h-8 bg-muted rounded w-16 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <UnifiedSkeleton variant="list-rows" count={3} />
    </div>
  );
}
