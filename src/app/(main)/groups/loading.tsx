import { UnifiedSkeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export default function GroupsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Groups</h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage and create groups for your events or collaborations. Organize
            your community and streamline event planning.
          </p>
        </div>
        <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
      </div>

      <UnifiedSkeleton variant="card-list" count={4} />
    </div>
  );
}
