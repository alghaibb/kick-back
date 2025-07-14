import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";

export async function getGroupInvites(groupId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  // Check if user has permission to view invites (must be admin or owner)
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
    throw new Error("Not authorized to view group invites");
  }

  const invites = await prisma.groupInvite.findMany({
    where: {
      groupId,
    },
    include: {
      inviter: {
        select: { firstName: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedInvites = invites.map((invite) => ({
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

  return formattedInvites;
}
