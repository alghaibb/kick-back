'use server';

import prisma from '@/lib/prisma';
import { sendGroupInviteEmail } from '@/utils/sendEmails';
import { getSession } from '@/utils/sessions';
import { createGroupSchema, CreateGroupValues } from '@/validations/group';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function createGroupAction(values: CreateGroupValues) {
  try {
    const session = await getSession();
    const user = session?.user;
    if (!user || !user.id) {
      return { error: 'Unauthorized' };
    }

    const parsed = createGroupSchema.parse(values);
    const { name, description, invites } = parsed;

    const rawEmails =
      invites
        ?.split(',')
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0) || [];

    if (rawEmails.includes(user.email.toLowerCase())) {
      return { error: 'You cannot invite yourself to your own group.' };
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        ownerId: user.id,
      },
    });

    const emails = rawEmails.filter(
      (email) => email !== user.email.toLowerCase()
    );

    const inviterName = user.nickname || user.firstName || 'Someone';

    for (const email of emails) {
      const token = uuidv4();

      await prisma.groupInvite.create({
        data: {
          groupId: group.id,
          email,
          token,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      });

      await sendGroupInviteEmail({
        email,
        inviterName,
        groupName: group.name,
        token,
      });
    }

    revalidatePath('/dashboard/groups');
    return { success: 'Group created successfully!', groupId: group.id };
  } catch (error) {
    console.error('Error creating group:', error);
    return { error: 'An error occurred. Please try again.' };
  }
}

export async function deleteGroupAction(groupId: string) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user || !user.id) {
      return { error: 'Unauthorized' };
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group || group.ownerId !== user.id) {
      return { error: 'You are not authorized to delete this group.' };
    }

    await prisma.groupMember.deleteMany({
      where: { groupId },
    });

    await prisma.groupInvite.deleteMany({
      where: { groupId },
    });

    await prisma.group.delete({
      where: { id: groupId },
    });

    revalidatePath('/dashboard/groups');
    return { success: 'Group deleted successfully.' };
  } catch (error) {
    console.error('Error deleting group:', error);
    return { error: 'Failed to delete group. Please try again.' };
  }
}

export async function updateGroupAction(
  groupId: string,
  values: CreateGroupValues
) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user || !user.id) {
      return { error: 'Unauthorized' };
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group || group.ownerId !== user.id) {
      return { error: 'You are not allowed to edit this group.' };
    }

    const parsed = createGroupSchema.parse(values);

    await prisma.group.update({
      where: { id: groupId },
      data: {
        name: parsed.name,
        description: parsed.description,
      },
    });

    revalidatePath('/dashboard/groups');
    return { success: 'Group updated successfully.' };
  } catch (error) {
    console.error('Error updating group:', error);
    return { error: 'Failed to update group. Please try again.' };
  }
}

export async function inviteSingleEmail(groupId: string, email: string) {
  try {
    const session = await getSession();
    const user = session?.user;
    if (!user || !user.id) throw new Error('Unauthorized');

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group || group.ownerId !== user.id) {
      return { error: 'You are not authorized to invite to this group.' };
    }

    const normalized = email.trim().toLowerCase();
    if (normalized === user.email.toLowerCase()) {
      return { error: 'You cannot invite yourself.' };
    }

    const existingInvite = await prisma.groupInvite.findFirst({
      where: { groupId, email: normalized },
    });

    if (existingInvite) return { error: 'This user was already invited.' };

    const token = uuidv4();

    await prisma.groupInvite.create({
      data: {
        groupId,
        email: normalized,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    await sendGroupInviteEmail({
      email: normalized,
      inviterName: user.nickname || user.firstName || 'Someone',
      groupName: group.name,
      token,
    });

    revalidatePath('/dashboard/groups');
    return { success: 'Invite sent!' };
  } catch (error) {
    console.error('Error sending invite:', error);
    return { error: 'Something went wrong. Try again.' };
  }
}

