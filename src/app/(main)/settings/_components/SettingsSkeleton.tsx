import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Reminders Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Reminder Type */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Select */}
            </div>
            {/* Reminder Time */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
            {/* Timezone */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Select */}
            </div>
            {/* Update Button */}
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <Skeleton className="h-5 w-20" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
            {/* New Password */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
            {/* Confirm New Password */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-44" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
            {/* Change Password Button */}
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
