"use server";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limiter";
import { getSession } from "@/lib/sessions";
import { sendGroupInviteEmail } from "@/utils/sendEmails";
import { generateToken } from "@/utils/tokens";
import {
  createGroupSchema,
  CreateGroupValues,
} from "@/validations/group/createGroupSchema";
import {
  acceptInviteSchema,
  inviteGroupSchema,
  inviteGroupBatchSchema,
} from "@/validations/group/inviteGroupSchema";
import { revalidatePath } from "next/cache";
import { notifyGroupInvite } from "@/lib/notification-triggers";
import { del } from "@vercel/blob";

export async function createGroupAction(values: CreateGroupValues) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const parsed = createGroupSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().formErrors.join(", ") || "Invalid input",
    };
  }

  const { name, description, image } = parsed.data;

  try {
    const group = await prisma.group.create({
      data: {
        name,
        description,
        image,
        createdBy: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "owner",
          },
        },
      },
    });

    revalidatePath("/dashboard");

    return { success: true, group };
  } catch (error) {
    console.error("Group invite error:", error);
    return { error: "Failed to create group" };
  }
}

export async function inviteToGroupAction(
  formData: FormData,
  skipRateLimit: boolean = false
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  if (!skipRateLimit) {
    const limiter = rateLimit({ interval: 3600000 }); // 1 hour
    try {
      await limiter.check(10, "email", `group-invite:${session.user.id}`);
    } catch (error) {
      console.error("Rate limit error:", error);
      return { error: "Too many invite requests. Please try again later." };
    }
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = inviteGroupSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().formErrors.join(", ") || "Invalid input",
    };
  }

  const { groupId, email, role } = parsed.data;

  try {
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
      include: {
        members: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
      },
    });

    if (!group) {
      return {
        error: "Group not found or you don't have permission to invite members",
      };
    }

    const existingMember = group.members.find(
      (member) => member.user.email === email
    );
    if (existingMember) {
      return { error: "User is already a member of this group" };
    }

    const invitedUser = await prisma.user.findUnique({ where: { email } });
    if (!invitedUser) {
      return { error: "No user with this email exists." };
    }

    const existingInvite = await prisma.groupInvite.findFirst({
      where: {
        groupId,
        email,
        status: "pending",
      },
    });

    if (existingInvite) {
      return { error: "An invitation has already been sent to this email" };
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.groupInvite.upsert({
      where: {
        groupId_email: {
          groupId,
          email,
        },
      },
      create: {
        groupId,
        email,
        invitedBy: session.user.id,
        role,
        token,
        expiresAt,
        status: "pending",
      },
      update: {
        invitedBy: session.user.id,
        role,
        token,
        expiresAt,
        status: "pending",
        updatedAt: new Date(),
      },
    });

    try {
      await sendGroupInviteEmail(
        email,
        session.user.firstName || session.user.email,
        group.name,
        token
      );
    } catch (emailError) {
      // If email fails, delete the invite and return error
      await prisma.groupInvite.delete({ where: { id: invite.id } });
      console.error("Failed to send invite email:", emailError);
      return { error: "Failed to send invitation email. Please try again." };
    }

    try {
      if (invitedUser) {
        await notifyGroupInvite({
          userId: invitedUser.id,
          groupId: group.id,
          groupName: group.name,
          inviterName: session.user.firstName || session.user.email,
          inviteId: token,
        });
      }
    } catch (notificationError) {
      console.error(
        "Failed to send group invite notification:",
        notificationError
      );
      // Don't fail the invite if notification fails
    }

    revalidatePath("/groups");
    return { success: true, invite };
  } catch (error) {
    console.error("Group invite error:", error);
    return { error: "Failed to send invitation" };
  }
}

export async function inviteToGroupBatchAction(data: {
  groupId: string;
  emails: string[];
  role: string;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const parsed = inviteGroupBatchSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().formErrors.join(", ") || "Invalid input",
    };
  }

  const { groupId, emails, role } = parsed.data;

  try {
    // Single rate-limit check for the whole batch
    const limiter = rateLimit({ interval: 3600000 });
    try {
      await limiter.check(10, "email", `group-invite:${session.user.id}`);
    } catch (error) {
      console.error("Rate limit error:", error);
      return { error: "Too many invite requests. Please try again later." };
    }

    const results = await Promise.allSettled(
      emails.map(async (email) => {
        const fd = new FormData();
        fd.append("groupId", groupId);
        fd.append("email", email);
        fd.append("role", role);
        const res = await inviteToGroupAction(fd, true);
        if (res?.error) return { email, ok: false, error: res.error } as const;
        return { email, ok: true } as const;
      })
    );

    const succeeded: string[] = [];
    const failed: { email: string; error: string }[] = [];
    results.forEach((r) => {
      if (r.status === "fulfilled") {
        if (r.value.ok) succeeded.push(r.value.email);
        else failed.push({ email: r.value.email, error: r.value.error });
      }
    });

    return { success: true, succeeded, failed };
  } catch (error) {
    console.error("Batch group invite error:", error);
    return { error: "Failed to send some invitations" };
  }
}

export async function acceptGroupInviteAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = acceptInviteSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().formErrors.join(", ") || "Invalid input",
    };
  }

  const { token } = parsed.data;

  try {
    // Find and validate invite
    const invite = await prisma.groupInvite.findUnique({
      where: { token },
      include: {
        group: true,
        inviter: {
          select: { firstName: true, email: true },
        },
      },
    });

    if (!invite) {
      return { error: "Invalid or expired invitation" };
    }

    if (invite.status !== "pending") {
      return { error: "This invitation has already been used or cancelled" };
    }

    if (invite.expiresAt < new Date()) {
      return { error: "This invitation has expired" };
    }

    if (invite.email !== session.user.email) {
      return { error: "This invitation was sent to a different email address" };
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: invite.groupId,
          userId: session.user.id,
        },
      },
    });

    if (existingMember) {
      // Mark invite as accepted even though user is already a member
      await prisma.groupInvite.update({
        where: { id: invite.id },
        data: { status: "accepted" },
      });
      return { error: "You are already a member of this group" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.groupMember.create({
        data: {
          groupId: invite.groupId,
          userId: session.user.id,
          role: "member",
        },
      });

      const groupEvents = await tx.event.findMany({
        where: {
          groupId: invite.groupId,
          date: { gte: new Date() }, // Only future events
        },
        select: { id: true },
      });

      if (groupEvents.length > 0) {
        await tx.eventAttendee.createMany({
          data: groupEvents.map((event) => ({
            eventId: event.id,
            userId: session.user.id,
            rsvpStatus: "pending",
          })),
          skipDuplicates: true,
        });
      }

      // Mark invite as accepted
      await tx.groupInvite.update({
        where: { id: invite.id },
        data: { status: "accepted" },
      });

      await tx.notification.deleteMany({
        where: {
          userId: session.user.id,
          type: "GROUP_INVITE",
          data: {
            path: ["inviteId"],
            equals: token,
          },
        },
      });
    });

    revalidatePath("/groups");
    revalidatePath("/dashboard");
    return { success: true, group: invite.group };
  } catch (error) {
    console.error("Accept invite error:", error);
    return { error: "Failed to accept invitation" };
  }
}

export async function updateGroupMemberRoleAction({
  groupId,
  memberId,
  newRole,
}: {
  groupId: string;
  memberId: string;
  newRole: string;
}) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });
  if (!group) return { error: "Group not found" };

  if (group.createdBy !== session.user.id) {
    return { error: "Only the group owner can update member roles" };
  }
  // Prevent owner from being demoted
  if (group.createdBy === memberId) {
    return { error: "Cannot change role of group owner" };
  }
  await prisma.groupMember.update({
    where: { groupId_userId: { groupId, userId: memberId } },
    data: { role: newRole },
  });
  revalidatePath("/groups");
  return { success: true };
}

export async function removeGroupMemberAction({
  groupId,
  memberId,
}: {
  groupId: string;
  memberId: string;
}) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return { error: "Group not found" };

  if (group.createdBy !== session.user.id) {
    return { error: "Only the group owner can remove members" };
  }
  // Prevent owner from being removed
  if (group.createdBy === memberId) {
    return { error: "Cannot remove the group owner" };
  }
  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId: memberId } },
  });
  revalidatePath("/groups");
  return { success: true };
}

export async function deleteGroupAction(groupId: string) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, createdBy: true, image: true },
  });

  if (!group) return { error: "Group not found" };
  if (group.createdBy !== session.user.id) {
    return { error: "Only the group owner can delete the group" };
  }

  if (group.image) {
    try {
      await del(group.image);
    } catch (error) {
      console.error("Error deleting group image from blob storage:", error);
    }
  }

  await prisma.group.delete({ where: { id: groupId } });
  revalidatePath("/groups");
  return { success: true };
}

export async function leaveGroupAction(groupId: string) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return { error: "Group not found" };
  if (group.createdBy === session.user.id) {
    return {
      error: "Owner cannot leave the group. Disband the group instead.",
    };
  }
  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  });
  revalidatePath("/groups");
  return { success: true };
}

export async function editGroupAction(
  groupId: string,
  values: { name: string; description?: string; image?: string | null }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsed = createGroupSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().formErrors.join(", ") || "Invalid input",
    };
  }

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });
    if (!group) {
      return { error: "Group not found" };
    }
    const actingMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
    });
    if (
      !actingMember ||
      (actingMember.role !== "admin" && group.createdBy !== session.user.id)
    ) {
      return { error: "You do not have permission to edit this group" };
    }

    if (values.image === null && group.image) {
      try {
        await del(group.image);
      } catch (error) {
        console.error("Failed to delete old group image:", error);
      }
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        image: values.image === null ? null : (parsed.data.image ?? undefined),
      },
    });
    revalidatePath("/groups");
    return { success: true, group: updatedGroup };
  } catch (error) {
    console.error("Error editing group:", error);
    return { error: "An error occurred while editing the group." };
  }
}
