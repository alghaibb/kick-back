import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
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

async function getGroupInvites(groupId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return [];
  }

  // Check if user has permission to view invites
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      members: {
        some: {
          userId: session.user.id,
          role: { in: ["admin", "owner"] },
        },
      },
    },
  });

  if (!group) {
    return [];
  }

  const invites = await prisma.groupInvite.findMany({
    where: {
      groupId,
      status: "pending",
    },
    include: {
      inviter: {
        select: { firstName: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return invites.map((invite) => ({
    id: invite.id,
    email: invite.email,
    status: invite.status,
    createdAt: invite.createdAt.toString(),
    expiresAt: invite.expiresAt.toString(),
    inviter: {
      firstName: invite.inviter.firstName,
      email: invite.inviter.email,
    },
  }));
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
  // Fetch invites for all groups the user owns
  const groupInvites = await Promise.all(
    groupsOwned.map(async (group) => ({
      groupId: group.id,
      groupName: group.name,
      invites: await getGroupInvites(group.id),
    }))
  );

  return (
    <Suspense fallback={<GroupsSkeleton />}>
      <div className="space-y-6">
        <GroupsClientContent
          groupsOwned={groupsOwned}
          groupsIn={groupsIn}
          currentUser={currentUser}
          groupInvites={groupInvites}
        />
      </div>
    </Suspense>
  );
}
