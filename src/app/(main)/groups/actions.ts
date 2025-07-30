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
} from "@/validations/group/inviteGroupSchema";
import { revalidatePath } from "next/cache";
import { notifyGroupInvite } from "@/lib/notification-triggers";
import { del } from "@vercel/blob";

export async function createGroupAction(values: CreateGroupValues) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Validate the input
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
            role: "admin",
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

export async function inviteToGroupAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Rate limiting
  const limiter = rateLimit({ interval: 3600000 }); // 1 hour
  try {
    await limiter.check(10, "email", session.user.id);
  } catch (error) {
    console.error("Rate limit error:", error);
    return { error: "Too many invite requests. Please try again later." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = inviteGroupSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().formErrors.join(", ") || "Invalid input",
    };
  }

  const { groupId, email, role } = parsed.data;

  console.log("Invite action - received role:", role); // Debug log

  try {
    // Check if group exists and user has permission
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

    // Check if user is already a member
    const existingMember = group.members.find(
      (member) => member.user.email === email
    );
    if (existingMember) {
      return { error: "User is already a member of this group" };
    }

    // Check if user with this email exists
    const invitedUser = await prisma.user.findUnique({ where: { email } });
    if (!invitedUser) {
      return { error: "No user with this email exists." };
    }

    // Check if there's already a pending invite
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

    // Generate invite token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create or update invite (handles cancelled invites)
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

    console.log("Created/updated invite with role:", invite.role); // Debug log

    // Send email
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

    // Send in-app notification to invited user
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

    // Check if user is already a member
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

    // Add user to group and existing events
    await prisma.$transaction(async (tx) => {
      // Add user to group
      await tx.groupMember.create({
        data: {
          groupId: invite.groupId,
          userId: session.user.id,
          role: "member",
        },
      });

      // Add user to all existing events in this group
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

  // Only owner can update roles
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });
  if (!group) return { error: "Group not found" };

  // Only group owner can change member roles
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

  // Only group owner can remove members
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

  // Delete group image from Vercel blob storage if it exists
  if (group.image) {
    try {
      await del(group.image);
    } catch (error) {
      console.error("Error deleting group image from blob storage:", error);
      // Continue with group deletion even if image deletion fails
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

  // Validate input
  const parsed = createGroupSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().formErrors.join(", ") || "Invalid input",
    };
  }

  try {
    // Check if user is group owner or admin
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

    // Handle image deletion from Vercel blob storage
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
