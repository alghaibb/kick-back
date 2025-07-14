import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function CalendarSkeleton() {
  return (
    <div className="flex gap-6">
      {/* Calendar Component */}
      <div className="flex-1">
        <Card>
          <CardContent className="p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-8 w-24" /> {/* July 2025 */}
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
                <div key={i} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square p-2 text-center text-sm">
                  <Skeleton className="h-4 w-4 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Sidebar */}
      <div className="w-64">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-2" /> {/* July 14th, 2025 */}
            <Skeleton className="h-4 w-40 mb-4" /> {/* No events scheduled */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
