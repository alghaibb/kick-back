import { DashboardSkeleton } from "./_components/DashboardSkeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md mb-2" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded-md" />
        </div>
        <DashboardSkeleton />
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="h-8 w-32 bg-muted animate-pulse rounded-md mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="h-32 animate-pulse bg-muted rounded-lg" />
      </div>
    </div>
  );
}
