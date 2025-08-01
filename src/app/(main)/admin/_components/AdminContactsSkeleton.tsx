import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminContactsSkeleton() {
  return (
    <div className="relative pt-16 md:pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header Skeleton */}
        <div className="mb-6 md:mb-8">
          <Skeleton className="h-10 w-32 mb-3 md:mb-4" />
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-lg" />
            <Skeleton className="h-8 w-48 md:h-10 md:w-64" />
          </div>
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Contacts List Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 md:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 md:gap-4 flex-1">
                      <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-3 w-40 mb-1" />
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-3 w-full mb-2" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-32 mt-2" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
 