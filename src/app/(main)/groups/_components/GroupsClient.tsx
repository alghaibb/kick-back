import { Suspense } from "react";
import { GroupsClientContent } from "./GroupsClientContent";
import { GroupsSkeleton } from "./GroupsSkeleton";

interface FullGroup {
  id: string;
  name: string;
  createdBy: string;
  members: {
    userId: string;
    role: string;
    user?: {
      id: string;
      firstName?: string;
      email?: string;
      image?: string | null;
    };
  }[];
  description?: string | null;
  image?: string | null;
}

export default async function GroupsClient({
  groupsOwned,
  groupsIn,
  currentUser,
}: {
  groupsOwned: FullGroup[];
  groupsIn: FullGroup[];
  currentUser: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    image?: string | null;
  };
}) {
  return (
    <Suspense fallback={<GroupsSkeleton />}>
      <div className="space-y-6">
        <GroupsClientContent
          groupsOwned={groupsOwned}
          groupsIn={groupsIn}
          currentUser={currentUser}
        />
      </div>
    </Suspense>
  );
}
