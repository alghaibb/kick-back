"use client";

import { useGroups } from "@/hooks/queries/useGroups";
import { GroupsClientContent } from "./GroupsClientContent";
import { GroupsSkeleton } from "./GroupsSkeleton";

export function GroupsClientNew() {
  const { data, isLoading, error } = useGroups();

  if (isLoading) {
    return <GroupsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-muted-foreground">
        Failed to load groups. Please try again.
      </div>
    );
  }

  if (!data) {
    return <GroupsSkeleton />;
  }

  const { groupsOwned, groupsIn, currentUser } = data;
  const hasGroups = groupsOwned.length > 0 || groupsIn.length > 0;

  return hasGroups ? (
    <div className="space-y-6">
      <GroupsClientContent
        groupsOwned={groupsOwned}
        groupsIn={groupsIn}
        currentUser={currentUser}
      />
    </div>
  ) : (
    <div className="text-muted-foreground">No groups yet.</div>
  );
}
