export const dynamic = "force-dynamic";

import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import { Users } from "lucide-react";
import GroupsClient from "./_components/GroupsClient";
import { Metadata } from "next";
import { PageHeader } from "../_components/PageHeader";
import { CreateActionButton } from "../_components/CreateActionButton";

export const metadata: Metadata = {
  title: "Your Groups",
  description:
    "Where you will see a list of groups you've created/or been invited to",
};

export default async function Page() {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="container py-8">
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
      {hasGroups ? (
        <GroupsClient
          groupsOwned={groupsOwned}
          groupsIn={groupsIn}
          currentUser={{
            ...session.user,
            firstName: session.user.firstName ?? undefined,
            lastName: session.user.lastName ?? undefined,
            image: session.user.image ?? undefined,
          }}
        />
      ) : (
        <div className="text-muted-foreground">No groups yet.</div>
      )}
    </div>
  );
}
