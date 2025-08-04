import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminEventsSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-xl">
      <CardHeader className="border-b border-border/50 bg-card/50 pb-4 sm:pb-6 pt-4 sm:pt-6">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
        </CardTitle>
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4 sm:p-6 md:p-8 relative">
              {/* Dropdown skeleton - top right */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8">
                <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded" />
              </div>
              
              <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
                <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  );
}
