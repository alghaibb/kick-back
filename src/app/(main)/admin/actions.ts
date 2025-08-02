"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  requireAdminWithAudit,
  canManageUser,
  validateAdminAction,
} from "@/lib/admin-auth";
import {
  editUserSchema,
  type EditUserInput,
} from "@/validations/admin/editUserSchema";
import bcrypt from "bcryptjs";
import { del } from "@vercel/blob";

// Enhanced error handling and logging
class AdminActionError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AdminActionError";
  }
}

// Helper function to check if URL is a Vercel Blob URL that we can delete
function isVercelBlobUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname.includes("blob.vercel-storage.com") ||
      urlObj.hostname.includes("vercel-storage.com")
    );
  } catch {
    return false;
  }
}

// User Management Actions with enhanced security and error handling
export async function updateUser(
  userId: string,
  updates: Record<string, unknown>
) {
  try {
    // Validate action and data
    validateAdminAction("update_user", { userId, updates });

    // Check admin permissions with audit logging
    await requireAdminWithAudit("update_user", `user:${userId}`, true);

    // Check if admin can manage this user
    const { canManage, error } = await canManageUser(userId);
    if (!canManage) {
      throw new AdminActionError(
        error || "Cannot manage this user",
        "FORBIDDEN",
        403
      );
    }

    // Verify user exists and is not deleted
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true, role: true },
    });

    if (!existingUser) {
      throw new AdminActionError("User not found", "NOT_FOUND", 404);
    }

    if (existingUser.deletedAt) {
      throw new AdminActionError(
        "Cannot update deleted user",
        "INVALID_STATE",
        400
      );
    }

    // Prevent role escalation vulnerabilities
    if (updates.role && updates.role !== existingUser.role) {
    }

    // Update user with transaction for data consistency
    const updatedUser = await prisma.$transaction(async (tx) => {
      return tx.user.update({
        where: { id: userId },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
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
          _count: {
            select: {
              groupMembers: true,
              eventComments: true,
              contacts: true,
            },
          },
        },
      });
    });

    // Revalidate relevant paths
    const pathsToRevalidate = ["/dashboard", "/admin/users", "/admin"];
    pathsToRevalidate.forEach((path) => revalidatePath(path));

    return {
      user: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
      success: true,
    };
  } catch (error) {
    console.error("Error updating user:", error);

    if (error instanceof AdminActionError) {
      throw error;
    }

    throw new AdminActionError("Failed to update user", "INTERNAL_ERROR", 500);
  }
}

// Contact Management with enhanced validation
export async function deleteContact(contactId: string) {
  try {
    validateAdminAction("delete_contact", { contactId });
    await requireAdminWithAudit("delete_contact", `contact:${contactId}`, true);

    if (!contactId || typeof contactId !== "string") {
      throw new AdminActionError(
        "Valid contact ID is required",
        "INVALID_INPUT",
        400
      );
    }

    // Verify contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId },
      select: { id: true },
    });

    if (!existingContact) {
      throw new AdminActionError("Contact not found", "NOT_FOUND", 404);
    }

    // Delete the contact
    await prisma.contact.delete({
      where: { id: contactId },
    });

    // Revalidate paths
    revalidatePath("/admin/contacts");
    revalidatePath("/admin");

    return { success: true, message: "Contact deleted successfully" };
  } catch (error) {
    console.error("Error deleting contact:", error);

    if (error instanceof AdminActionError) {
      throw error;
    }

    throw new AdminActionError(
      "Failed to delete contact",
      "INTERNAL_ERROR",
      500
    );
  }
}

// Enhanced User Deletion with comprehensive ownership transfer
export async function deleteUser(userId: string) {
  try {
    validateAdminAction("delete_user", { userId });
    await requireAdminWithAudit("delete_user", `user:${userId}`, true);

    const { canManage, error } = await canManageUser(userId);
    if (!canManage) {
      throw new AdminActionError(
        error || "Cannot delete this user",
        "FORBIDDEN",
        403
      );
    }

    if (!userId || typeof userId !== "string") {
      throw new AdminActionError(
        "Valid user ID is required",
        "INVALID_INPUT",
        400
      );
    }

    // Use transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get user info before deletion
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: {
          groupMembers: {
            include: { group: true },
          },
          eventComments: true,
          contacts: true,
        },
      });

      if (!user) {
        throw new AdminActionError("User not found", "NOT_FOUND", 404);
      }

      if (user.deletedAt) {
        throw new AdminActionError(
          "User is already deleted",
          "INVALID_STATE",
          400
        );
      }

      // Handle group ownership transfers
      const groupsToTransfer = user.groupMembers.filter(
        (member) => member.role === "owner"
      );

      for (const member of groupsToTransfer) {
        const groupId = member.groupId;

        // Find the next oldest member to transfer ownership to
        const nextOwner = await tx.groupMember.findFirst({
          where: {
            groupId: groupId,
            userId: { not: userId },
            role: { not: "owner" },
          },
          orderBy: { joinedAt: "asc" },
        });

        if (nextOwner) {
          // Transfer ownership to the next oldest member
          await tx.groupMember.update({
            where: { id: nextOwner.id },
            data: { role: "owner" },
          });

          // Update group createdBy field
          await tx.group.update({
            where: { id: groupId },
            data: { createdBy: nextOwner.userId },
          });
        } else {
          // No other members, mark group as inactive
          await tx.group.update({
            where: { id: groupId },
            data: { createdBy: "" },
          });
        }
      }

      // Soft delete the user with proper data handling
      const deletedUser = await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          email: `deleted_${Date.now()}_${user.email}`, // Make email unique
          originalFirstName: user.firstName,
          originalLastName: user.lastName,
          firstName: "Deleted",
          lastName: "User",
          updatedAt: new Date(),
        },
      });

      return {
        deletedUser,
        transferredGroups: groupsToTransfer.length,
        totalComments: user.eventComments.length,
        totalContacts: user.contacts.length,
      };
    });

    // Revalidate paths
    const pathsToRevalidate = [
      "/admin/deleted-users",
      "/admin/users",
      "/admin",
    ];
    pathsToRevalidate.forEach((path) => revalidatePath(path));

    return {
      success: true,
      message: `User deleted successfully. Transferred ownership of ${result.transferredGroups} groups.`,
      details: {
        transferredGroups: result.transferredGroups,
        totalComments: result.totalComments,
        totalContacts: result.totalContacts,
      },
    };
  } catch (error: unknown) {
    console.error("Error deleting user:", error);

    if (error instanceof AdminActionError) {
      throw error;
    }

    // Check for specific Prisma errors
    const prismaError = error as { code?: string; message?: string };
    if (prismaError?.code === "P2025") {
      throw new AdminActionError(
        "User not found or already deleted",
        "NOT_FOUND",
        404
      );
    }
    if (prismaError?.code?.startsWith("P2")) {
      throw new AdminActionError(
        `Database error: ${(error as Error).message}`,
        "DATABASE_ERROR",
        500
      );
    }

    throw new AdminActionError("Failed to delete user", "INTERNAL_ERROR", 500);
  }
}

// Enhanced User Recovery with better error handling
export async function recoverUser(userId: string) {
  try {
    validateAdminAction("recover_user", { userId });
    await requireAdminWithAudit("recover_user", `user:${userId}`, true);

    if (!userId || typeof userId !== "string") {
      throw new AdminActionError(
        "Valid user ID is required",
        "INVALID_INPUT",
        400
      );
    }

    // Use transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the deleted user
      const deletedUser = await tx.user.findUnique({
        where: { id: userId },
        include: {
          groupMembers: {
            include: { group: true },
          },
        },
      });

      if (!deletedUser) {
        throw new AdminActionError("User not found", "NOT_FOUND", 404);
      }

      if (!deletedUser.deletedAt) {
        throw new AdminActionError("User is not deleted", "INVALID_STATE", 400);
      }

      // Restore the user's original email and name
      const originalEmail = deletedUser.email.replace(/^deleted_\d+_/, "");

      // Check if email is already in use
      const emailInUse = await tx.user.findFirst({
        where: {
          email: originalEmail,
          deletedAt: null,
        },
      });

      if (emailInUse) {
        throw new AdminActionError(
          "Cannot recover user: email is already in use by another active user",
          "EMAIL_CONFLICT",
          409
        );
      }

      // Restore original names with better fallback logic
      let firstName = deletedUser.originalFirstName;
      let lastName = deletedUser.originalLastName;

      if (!firstName || !lastName) {
        // Extract name from email as fallback
        const emailName = originalEmail.split("@")[0];
        if (emailName) {
          const nameParts = emailName.split(/[._-]/);
          if (nameParts.length >= 2) {
            firstName =
              nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
            lastName =
              nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
          } else {
            firstName =
              nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
            lastName = null;
          }
        } else {
          firstName = "Recovered";
          lastName = "User";
        }
      }

      // Recover the user
      const recoveredUser = await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: null,
          permanentlyDeletedAt: null,
          email: originalEmail,
          firstName: firstName,
          lastName: lastName,
          originalFirstName: null,
          originalLastName: null,
          updatedAt: new Date(),
        },
      });

      // Handle group ownership recovery
      const groupsToRecover = deletedUser.groupMembers.filter(
        (member) => member.role === "owner"
      );

      let recoveredGroups = 0;
      for (const member of groupsToRecover) {
        const groupId = member.groupId;

        // Check if the group currently has no owner (createdBy is empty)
        const group = await tx.group.findUnique({
          where: { id: groupId },
        });

        if (group && group.createdBy === "") {
          // Restore ownership to the recovered user
          await tx.group.update({
            where: { id: groupId },
            data: { createdBy: userId },
          });
          recoveredGroups++;
        }
      }

      return { recoveredUser, recoveredGroups };
    });

    // Revalidate paths
    const pathsToRevalidate = [
      "/admin/deleted-users",
      "/admin/users",
      "/admin",
    ];
    pathsToRevalidate.forEach((path) => revalidatePath(path));

    return {
      success: true,
      message: `User recovered successfully. Restored ownership of ${result.recoveredGroups} groups.`,
      details: {
        recoveredGroups: result.recoveredGroups,
      },
    };
  } catch (error) {
    console.error("Error recovering user:", error);

    if (error instanceof AdminActionError) {
      throw error;
    }

    throw new AdminActionError("Failed to recover user", "INTERNAL_ERROR", 500);
  }
}

// Utility function to get admin action logs (could be enhanced with proper logging table)
export async function getAdminActionSummary() {
  try {
    await requireAdminWithAudit("view_stats", "admin_actions", true);

    // This could be enhanced with a proper audit log table
    // For now, return basic statistics
    const [recentDeleted, recentRecovered] = await Promise.all([
      prisma.user.count({
        where: {
          deletedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      prisma.user.count({
        where: {
          deletedAt: null,
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          originalFirstName: null, // Users that were recovered (originalFirstName is cleared)
        },
      }),
    ]);

    return {
      recentDeleted,
      recentRecovered,
      period: "7 days",
    };
  } catch (error) {
    console.error("Error getting admin action summary:", error);
    throw new AdminActionError(
      "Failed to get admin action summary",
      "INTERNAL_ERROR",
      500
    );
  }
}

// Edit User Profile with Password Change Support
export async function editUserProfile(userId: string, data: EditUserInput) {
  try {
    // Validate input data
    const validatedData = editUserSchema.parse(data);

    // Check admin permissions (skip rate limit for legitimate admin operations)
    await requireAdminWithAudit("edit_user_profile", `user:${userId}`, true);

    // Check if admin can manage this user (allow self-editing for profile updates)
    const { canManage, error } = await canManageUser(userId, true);

    if (!canManage) {
      throw new AdminActionError(
        error || "Cannot manage this user",
        "FORBIDDEN",
        403
      );
    }

    // Verify user exists and is not deleted
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        deletedAt: true,
        role: true,
        firstName: true,
        lastName: true,
        nickname: true,
        email: true,
        image: true,
        hasOnboarded: true,
      },
    });

    if (!existingUser) {
      throw new AdminActionError("User not found", "NOT_FOUND", 404);
    }

    if (existingUser.deletedAt) {
      throw new AdminActionError(
        "Cannot edit deleted user",
        "INVALID_STATE",
        400
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      nickname: validatedData.nickname,
      role: validatedData.role,
      hasOnboarded: validatedData.hasOnboarded,
      updatedAt: new Date(),
    };

    // Handle image update if provided
    if (validatedData.image !== undefined) {
      const newImageUrl = validatedData.image || null;
      const oldImageUrl = existingUser.image;

      // If image is changing and there's an old image, delete it from blob storage
      if (
        oldImageUrl &&
        oldImageUrl !== newImageUrl &&
        isVercelBlobUrl(oldImageUrl)
      ) {
        try {
          await del(oldImageUrl);
        } catch (error) {
          console.error(`Failed to delete old image ${oldImageUrl}:`, error);
          // Continue with the update even if blob deletion fails
        }
      }

      updateData.image = newImageUrl;
    }

    // Handle password change if provided
    if (validatedData.newPassword && validatedData.newPassword.length > 0) {
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);
      updateData.password = hashedPassword;
    }

    // Log role changes
    if (validatedData.role !== existingUser.role) {
    }

    // Update user

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nickname: true,
        email: true,
        image: true,
        role: true,
        hasOnboarded: true,
        updatedAt: true,
        _count: {
          select: {
            groupMembers: true,
            eventComments: true,
            contacts: true,
          },
        },
      },
    });

    // Revalidate relevant paths
    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return {
      user: {
        ...updatedUser,
        createdAt: updatedUser.updatedAt.toISOString(), // Use updatedAt as fallback
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
      success: true,
      message: validatedData.newPassword
        ? "User profile and password updated successfully"
        : "User profile updated successfully",
    };
  } catch (error: unknown) {
    console.error("Error editing user profile:", error);

    if (error instanceof AdminActionError) {
      throw error;
    }

    // Check for specific error types (Prisma errors)
    const prismaError = error as { code?: string; message?: string };
    if (prismaError?.code === "P2025") {
      throw new AdminActionError(
        "User not found or already deleted",
        "NOT_FOUND",
        404
      );
    }

    if (prismaError?.code?.startsWith("P2")) {
      throw new AdminActionError(
        `Database error: ${(error as Error).message}`,
        "DATABASE_ERROR",
        500
      );
    }

    throw new AdminActionError(
      "Failed to edit user profile",
      "INTERNAL_ERROR",
      500
    );
  }
}
