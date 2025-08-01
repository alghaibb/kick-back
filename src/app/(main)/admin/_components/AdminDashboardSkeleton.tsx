import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboardSkeleton() {
  return (
    <div className="relative pt-16 md:pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header Skeleton */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-lg" />
            <Skeleton className="h-8 w-48 md:h-10 md:w-64" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-6 w-32 mb-4 md:mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="hover:shadow-md transition-all">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-lg mb-3" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                    <Skeleton className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* System Status Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="flex items-center justify-between p-3 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex items-center justify-between p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
