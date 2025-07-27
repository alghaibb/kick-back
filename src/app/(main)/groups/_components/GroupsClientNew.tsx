"use client";

import { useGroups } from "@/hooks/queries/useGroups";
import { GroupsClientContent } from "./GroupsClientContent";
import { UnifiedSkeleton } from "@/components/ui/skeleton";
import { AlertCircle, Users } from "lucide-react";

export function GroupsClientNew() {
  const { data, isLoading, error } = useGroups();

  if (isLoading) {
    return <UnifiedSkeleton variant="card-list" count={2} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold">Unable to load groups</h3>
          <p className="text-muted-foreground">
            Failed to load groups. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <UnifiedSkeleton variant="card-list" count={2} />;
  }

  const { groupsOwned, groupsIn, currentUser } = data;
  const hasGroups = groupsOwned.length > 0 || groupsIn.length > 0;

  return hasGroups ? (
    <div className="space-y-8">
      <GroupsClientContent
        groupsOwned={groupsOwned}
        groupsIn={groupsIn}
        currentUser={currentUser}
      />
    </div>
  ) : (
    <div className="flex items-center justify-center py-16">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 border border-primary/20 mx-auto">
          <Users className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">No groups yet</h3>
          <p className="text-muted-foreground text-lg">
            Start building your community by creating your first group.
          </p>
        </div>
      </div>
    </div>
  );
}
