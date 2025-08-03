import { Skeleton } from "@/components/ui/skeleton";

export function AdminGroupsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
      {/* Groups List Skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-xl">
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"
              >
                {/* Group Image */}
                <div className="flex-shrink-0">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                </div>

                {/* Group Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>

                  {/* Members */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <div className="flex -space-x-2">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <Skeleton key={j} className="h-6 w-6 rounded-full" />
                      ))}
                    </div>
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 