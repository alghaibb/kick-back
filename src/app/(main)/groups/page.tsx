export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { Users } from "lucide-react";
import { Suspense } from "react";
import { CreateActionButton } from "../_components/CreateActionButton";
import { PageHeader } from "../_components/PageHeader";
import GroupsClient from "./_components/GroupsClient";
import { GroupsSkeleton } from "./_components/GroupsSkeleton";

async function GroupsData() {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="text-muted-foreground">
        You must be logged in to view your groups.
      </div>
    );
  }

  // Fetch groups the user owns
  const groupsOwned = await prisma.group.findMany({
    where: { createdBy: userId },
    include: {
      members: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch groups the user is a member of (but not owner)
  const groupsIn = await prisma.group.findMany({
    where: {
      members: { some: { userId } },
      NOT: { createdBy: userId },
    },
    include: {
      members: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const hasGroups = groupsOwned.length > 0 || groupsIn.length > 0;

  return hasGroups ? (
    <GroupsClient
      groupsOwned={groupsOwned}
      groupsIn={groupsIn}
      currentUser={{
        ...session!.user,
        firstName: session!.user.firstName ?? undefined,
        lastName: session!.user.lastName ?? undefined,
        image: session!.user.image ?? undefined,
      }}
    />
  ) : (
    <div className="text-muted-foreground">No groups yet.</div>
  );
}

export default async function Page() {
  const session = await getSession();

  return (
    <div className="container py-8">
      <PageHeader
        icon={<Users className="h-6 w-6" />}
        title="Groups"
        subtitle="Manage and create groups for your events or collaborations."
        action={
          <CreateActionButton modalType="create-group" label="Create Group" />
        }
      />
      <Suspense fallback={<GroupsSkeleton />}>
        <GroupsData />
      </Suspense>
    </div>
  );
}
