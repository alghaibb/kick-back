"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

// User Management Actions (Mutations Only)
export async function updateUser(
  userId: string,
  updates: Record<string, unknown>
) {
  try {
    await requireAdmin();

    if (!userId || !updates) {
      throw new Error("User ID and updates are required");
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        nickname: true,
        role: true,
        hasOnboarded: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return {
      user: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
        _count: {
          groupMembers: 0,
          eventComments: 0,
          contacts: 0,
        },
      },
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

// Contact Management Actions (Mutations Only)
export async function deleteContact(contactId: string) {
  try {
    await requireAdmin();

    if (!contactId) {
      throw new Error("Contact ID is required");
    }

    // Delete the contact
    await prisma.contact.delete({
      where: { id: contactId },
    });

    revalidatePath("/admin/contacts");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw new Error("Failed to delete contact");
  }
}

// User Management Actions - Soft Delete with Ownership Transfer
export async function deleteUser(userId: string) {
  try {
    await requireAdmin();

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get user info before deletion
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        groupMembers: {
          include: { group: true },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Handle group ownership transfers
    const groupsToTransfer = user.groupMembers.filter(
      (member) => member.role === "owner"
    );

    for (const member of groupsToTransfer) {
      const groupId = member.groupId;

      // Find the next oldest member to transfer ownership to
      const nextOwner = await prisma.groupMember.findFirst({
        where: {
          groupId: groupId,
          userId: { not: userId },
          role: { not: "owner" },
        },
        orderBy: { joinedAt: "asc" },
      });

      if (nextOwner) {
        // Transfer ownership to the next oldest member
        await prisma.groupMember.update({
          where: { id: nextOwner.id },
          data: { role: "owner" },
        });

        // Update group createdBy field
        await prisma.group.update({
          where: { id: groupId },
          data: { createdBy: nextOwner.userId },
        });
      } else {
        // No other members, mark group as inactive by setting createdBy to empty string
        await prisma.group.update({
          where: { id: groupId },
          data: { createdBy: "" },
        });
      }
    }

    // Soft delete the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: `deleted_${Date.now()}_${user.email}`, // Make email unique
        originalFirstName: user.firstName,
        originalLastName: user.lastName,
        firstName: "Deleted",
        lastName: "User",
      },
    });

    revalidatePath("/admin/deleted-users");
    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

// User Recovery Action
export async function recoverUser(userId: string) {
  try {
    await requireAdmin();

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get the deleted user
    const deletedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        groupMembers: {
          include: { group: true },
        },
      },
    });

    if (!deletedUser || !deletedUser.deletedAt) {
      throw new Error("User not found or not deleted");
    }

    // Restore the user's original email and name
    const originalEmail = deletedUser.email.replace(/^deleted_\d+_/, "");

    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: null,
        permanentlyDeletedAt: null,
        email: originalEmail,
        firstName: deletedUser.originalFirstName || "Recovered",
        lastName: deletedUser.originalLastName || "User",
        originalFirstName: null,
        originalLastName: null,
      },
    });

    // Handle group ownership recovery
    const groupsToRecover = deletedUser.groupMembers.filter(
      (member) => member.role === "owner"
    );

    for (const member of groupsToRecover) {
      const groupId = member.groupId;

      // Check if the group currently has no owner (createdBy is empty)
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (group && group.createdBy === "") {
        // Restore ownership to the recovered user
        await prisma.group.update({
          where: { id: groupId },
          data: { createdBy: userId },
        });
      }
      // If group has a current owner, leave it as is to avoid conflicts
    }

    revalidatePath("/admin/deleted-users");
    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error recovering user:", error);
    throw new Error("Failed to recover user");
  }
}
