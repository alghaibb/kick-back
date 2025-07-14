import { Skeleton } from "@/components/ui/skeleton";

export function GroupsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Groups Owned Section */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" /> {/* "Groups You Own" title */}
        <Skeleton className="h-5 w-52" /> {/* "You don't own any groups yet." */}
      </div>

      {/* Groups Member Section */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-40" /> {/* "Groups You're In" title */}
        <Skeleton className="h-5 w-60" /> {/* "You're not a member of any other groups." */}
      </div>
    </div>
  );
}
