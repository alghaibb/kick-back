import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

// Unified skeleton component with presets
interface UnifiedSkeletonProps {
  variant?:
    | "simple"
    | "card-list"
    | "form"
    | "profile"
    | "dashboard-stats"
    | "calendar-month"
    | "list-rows"
    | "gallery-grid"
    | "custom";
  count?: number;
  className?: string;
  children?: React.ReactNode;
}

function UnifiedSkeleton({
  variant = "simple",
  count = 1,
  className,
  children,
}: UnifiedSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "simple":
        return <Skeleton className={cn("w-full h-96", className)} />;

      case "card-list":
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "dashboard-stats":
        return (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "calendar-month":
        return (
          <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={`dow-${i}`} className="h-5" />
              ))}
              {Array.from({ length: 42 }).map((_, i) => (
                <div
                  key={`day-${i}`}
                  className="rounded-lg border border-border/50 p-2 sm:p-3 bg-card/40 min-h-[80px] sm:min-h-[110px]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-6" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "gallery-grid":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden">
                <Skeleton className="w-full h-full" />
              </div>
            ))}
          </div>
        );

      case "list-rows":
        return (
          <div className={cn("space-y-3", className)}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        );

      case "form":
        return (
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <Skeleton className="h-10 w-full mt-6" />
            </CardContent>
          </Card>
        );

      case "profile":
        return (
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-5 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>

            {/* Profile Form */}
            <UnifiedSkeleton variant="form" count={4} />
          </div>
        );

      case "custom":
        return (
          children || <Skeleton className={cn("w-full h-32", className)} />
        );

      default:
        return <Skeleton className={cn("w-full h-32", className)} />;
    }
  };

  return <div className={className}>{renderSkeleton()}</div>;
}

export { Skeleton, UnifiedSkeleton };
