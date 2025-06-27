"use server";

import prisma from '@/lib/prisma';
import { getSession } from '@/utils/sessions';
import { verifyGroupInviteToken } from '@/utils/tokens';
import { revalidatePath } from 'next/cache';

export async function acceptGroupInvite(token: string) {
  const session = await getSession();

  if (!session || !session.user?.email) {
    return { error: "You need to be logged in to accept an invite." };
  }

  const { invite, error } = await verifyGroupInviteToken(token);

  if (error || !invite) {
    return { error };
  }

  if (session.user.email !== invite.email) {
    return { error: "This invite was not sent to your account." };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { error: "You need to create an account before accepting the invite." };
  }

  await prisma.groupMember.create({
    data: {
      userId: user.id,
      groupId: invite.groupId,
    },
  });

  await prisma.groupInvite.update({
    where: { token },
    data: { status: "accepted" },
  });

  revalidatePath('/dashboard/groups');

  return { success: true, redirectTo: '/dashboard/groups' };
}
