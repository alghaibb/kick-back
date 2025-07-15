import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Skeleton className="w-24 h-24 rounded-full" /> {/* Avatar */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" /> {/* Upload button */}
            <Skeleton className="h-9 w-20" /> {/* Remove button */}
          </div>
          <Skeleton className="h-4 w-48" /> {/* Help text */}
        </CardContent>
      </Card>

      {/* Profile Information Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* First Name */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>

            {/* Nickname */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>

            {/* Update Profile Button */}
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <Skeleton className="h-5 w-20" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-80 mb-4" /> {/* Description text */}
          <Skeleton className="h-10 w-full" /> {/* Change Password button */}
        </CardContent>
      </Card>
    </div>
  );
}
