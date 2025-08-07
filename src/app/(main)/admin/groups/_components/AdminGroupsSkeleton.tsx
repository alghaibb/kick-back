import { Skeleton } from "@/components/ui/skeleton";

export function AdminGroupsSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-xl">
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm relative"
            >
              {/* Dropdown skeleton - top right */}
              <div className="absolute top-4 right-4">
                <Skeleton className="h-8 w-8 rounded" />
              </div>

              {/* Group Image */}
              <div className="flex-shrink-0">
                <Skeleton className="h-16 w-16 rounded-xl" />
              </div>

              {/* Group Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Skeleton className="h-6 w-48" />
                      <div className="flex flex-wrap gap-1">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>

                {/* Members */}
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex -space-x-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className="h-8 w-8 rounded-full" />
                    ))}
                  </div>
                </div>

                {/* Created date */}
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 