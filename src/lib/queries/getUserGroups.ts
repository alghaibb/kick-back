import prisma from '@/lib/prisma';

export async function getUserGroups(userId: string) {
  if (!userId) return [];

  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { groupMembers: { some: { userId } } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      owner: true,
      groupMembers: {
        include: { user: true },
      },
      groupInvites: true,
    },
  });

  return groups;
}
