"use server";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limiter";
import { getSession } from "@/lib/sessions";
import { sendGroupInviteEmail } from "@/utils/sendEmails";
import { generateToken } from "@/utils/tokens";
import { serverCreateGroupSchema } from "@/validations/group/createGroupSchema";
import { acceptInviteSchema, serverInviteGroupSchema } from "@/validations/group/inviteGroupSchema";
import { revalidatePath } from "next/cache";

export async function createGroupAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = serverCreateGroupSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(", ") || "Invalid input" };

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

    revalidatePath("/dashboard")

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
    await limiter.check(10, 'email', session.user.id);
  } catch (error) {
    console.error("Rate limit error:", error);
    return { error: "Too many invite requests. Please try again later." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = serverInviteGroupSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(", ") || "Invalid input" };

  }

  const { groupId, email } = parsed.data;

  try {
    // Check if group exists and user has permission
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        members: {
          some: {
            userId: session.user.id,
            role: { in: ["admin", "owner"] }
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      }
    });

    if (!group) {
      return { error: "Group not found or you don't have permission to invite members" };
    }

    // Check if user is already a member
    const existingMember = group.members.find(member => member.user.email === email);
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
        status: "pending"
      }
    });

    if (existingInvite) {
      return { error: "An invitation has already been sent to this email" };
    }

    // Generate invite token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invite
    const invite = await prisma.groupInvite.create({
      data: {
        groupId,
        email,
        invitedBy: session.user.id,
        token,
        expiresAt,
      }
    });

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
    return { error: parsed.error.flatten().formErrors.join(", ") || "Invalid input" };

  }

  const { token } = parsed.data;

  try {
    // Find and validate invite
    const invite = await prisma.groupInvite.findUnique({
      where: { token },
      include: {
        group: true,
        inviter: {
          select: { firstName: true, email: true }
        }
      }
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
          userId: session.user.id
        }
      }
    });

    if (existingMember) {
      // Mark invite as accepted even though user is already a member
      await prisma.groupInvite.update({
        where: { id: invite.id },
        data: { status: "accepted" }
      });
      return { error: "You are already a member of this group" };
    }

    // Add user to group
    await prisma.$transaction([
      prisma.groupMember.create({
        data: {
          groupId: invite.groupId,
          userId: session.user.id,
          role: "member"
        }
      }),
      prisma.groupInvite.update({
        where: { id: invite.id },
        data: { status: "accepted" }
      })
    ]);

    revalidatePath("/groups");
    revalidatePath("/dashboard");
    return { success: true, group: invite.group };
  } catch (error) {
    console.error("Accept invite error:", error);
    return { error: "Failed to accept invitation" };
  }
}

export async function cancelGroupInviteAction(inviteId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
    // Check if user has permission to cancel this invite
    const invite = await prisma.groupInvite.findFirst({
      where: {
        id: inviteId,
        invitedBy: session.user.id,
        status: "pending"
      }
    });

    if (!invite) {
      return { error: "Invitation not found or you don't have permission to cancel it" };
    }

    await prisma.groupInvite.update({
      where: { id: inviteId },
      data: { status: "cancelled" }
    });

    revalidatePath("/groups");
    return { success: true };
  } catch (error) {
    console.error("Cancel invite error:", error);
    return { error: "Failed to cancel invitation" };
  }
}

export async function resendGroupInviteAction(inviteId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Rate limiting for resend
  const limiter = rateLimit({ interval: 3600000 }); // 1 hour
  try {
    await limiter.check(5, 'email', session.user.id);
  } catch (error) {
    console.error("Rate limit error:", error);
    return { error: "Too many resend requests. Please try again later." };
  }

  try {
    // Find and validate invite
    const invite = await prisma.groupInvite.findFirst({
      where: {
        id: inviteId,
        invitedBy: session.user.id,
        status: "pending"
      },
      include: {
        group: true,
        inviter: {
          select: { firstName: true, email: true }
        }
      }
    });

    if (!invite) {
      return { error: "Invitation not found or you don't have permission to resend it" };
    }

    if (invite.expiresAt < new Date()) {
      return { error: "This invitation has expired" };
    }

    // Generate new token and extend expiration
    const newToken = generateToken();
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update invite with new token
    await prisma.groupInvite.update({
      where: { id: inviteId },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
        updatedAt: new Date()
      }
    });

    // Send new email
    try {
      await sendGroupInviteEmail(
        invite.email,
        session.user.firstName || session.user.email,
        invite.group.name,
        newToken
      );
    } catch (emailError) {
      console.error("Failed to resend invite email:", emailError);
      return { error: "Failed to resend invitation email. Please try again." };
    }

    return { success: true };
  } catch (error) {
    console.error("Resend invite error:", error);
    return { error: "Failed to resend invitation" };
  }
}



export async function updateGroupMemberRoleAction({ groupId, memberId, newRole }: { groupId: string; memberId: string; newRole: string }) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Not authenticated" };

  // Only owner or admin can update roles
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });
  if (!group) return { error: "Group not found" };
  const actingMember = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId: session.user.id } } });
  if (!actingMember || (actingMember.role !== "admin" && group.createdBy !== session.user.id)) {
    return { error: "You do not have permission to update roles" };
  }
  // Prevent owner from being demoted
  if (group.createdBy === memberId) {
    return { error: "Cannot change role of group owner" };
  }
  await prisma.groupMember.update({
    where: { groupId_userId: { groupId, userId: memberId } },
    data: { role: newRole },
  });
  revalidatePath("/groups")
  return { success: true };
}

export async function removeGroupMemberAction({ groupId, memberId }: { groupId: string; memberId: string }) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return { error: "Group not found" };
  const actingMember = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId: session.user.id } } });
  if (!actingMember || (actingMember.role !== "admin" && group.createdBy !== session.user.id)) {
    return { error: "You do not have permission to remove members" };
  }
  // Prevent owner from being removed
  if (group.createdBy === memberId) {
    return { error: "Cannot remove the group owner" };
  }
  await prisma.groupMember.delete({ where: { groupId_userId: { groupId, userId: memberId } } });
  revalidatePath("/groups")
  return { success: true };
}

export async function deleteGroupAction(groupId: string) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return { error: "Group not found" };
  if (group.createdBy !== session.user.id) {
    return { error: "Only the group owner can delete the group" };
  }
  await prisma.group.delete({ where: { id: groupId } });
  revalidatePath("/groups")
  return { success: true };
}

export async function leaveGroupAction(groupId: string) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return { error: "Group not found" };
  if (group.createdBy === session.user.id) {
    return { error: "Owner cannot leave the group. Disband the group instead." };
  }
  await prisma.groupMember.delete({ where: { groupId_userId: { groupId, userId: session.user.id } } });
  revalidatePath("/groups")
  return { success: true };
}

export async function editGroupAction(groupId: string, values: { name: string; description?: string; image?: string | null }) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Validate input
  const parsed = serverCreateGroupSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(", ") || "Invalid input" };
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
    if (!actingMember || (actingMember.role !== "admin" && group.createdBy !== session.user.id)) {
      return { error: "You do not have permission to edit this group" };
    }
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        image: values.image === null ? null : parsed.data.image ?? undefined,
      },
    });
    revalidatePath("/groups");
    return { success: true, group: updatedGroup };
  } catch (error) {
    console.error("Error editing group:", error);
    return { error: "An error occurred while editing the group." };
  }
}

export async function getGroupInvitesAction(groupId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated", invites: [] };
  }

  try {
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
      return { error: "Not authorized to view group invites", invites: [] };
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

    return { success: true, invites: formattedInvites };
  } catch (error) {
    console.error("Error fetching group invites:", error);
    return { error: "Failed to fetch group invites", invites: [] };
  }
}