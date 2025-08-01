"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import {
  changePasswordSchema,
  ChangePasswordValues,
} from "@/validations/profile/profileSchema";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { settingsSchema, SettingsValues } from "@/validations/settingsSchema";
import { formatToE164 } from "@/utils/formatPhoneNumber";
import { detectCountryForSMS } from "@/utils/detectCountry";

export async function updateSettingsAction(values: SettingsValues) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Validate all settings fields
    const validatedFields = settingsSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const {
      reminderType,
      reminderTime,
      timezone,
      phoneNumber,
      notificationOptIn,
      inAppNotifications,
    } = validatedFields.data;

    // Validate and format phone number using utils
    let formattedPhone: string | null = null;
    if (reminderType === "sms" || reminderType === "both") {
      const country = detectCountryForSMS(phoneNumber || "", timezone);
      formattedPhone = formatToE164(phoneNumber || "", country);
      if (!formattedPhone) {
        return { error: "Invalid phone number for your country" };
      }
    }

    // Update all settings fields in the user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        reminderType,
        reminderTime,
        timezone,
        phoneNumber: formattedPhone || null,
        notificationOptIn,
        inAppNotifications,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Settings update error:", error);
    return { error: "Failed to update settings" };
  }
}

export async function changePasswordAction(values: ChangePasswordValues) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Validate the input
    const validatedFields = changePasswordSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return {
        error:
          "You cannot change password. Your account uses social login (Google/Facebook) or magic link authentication.",
      };
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      return { error: "Current password is incorrect" };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Password change error:", error);
    return { error: "Failed to change password" };
  }
}

export async function deleteAccountAction() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const userId = session.user.id;

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
      return { error: "User not found" };
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

    // Soft delete the user with 30-day grace period
    const gracePeriodDays = 30;
    const permanentlyDeletedAt = new Date();
    permanentlyDeletedAt.setDate(
      permanentlyDeletedAt.getDate() + gracePeriodDays
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        permanentlyDeletedAt: permanentlyDeletedAt,
        email: `deleted_${Date.now()}_${user.email}`, // Make email unique
        firstName: "Deleted",
        lastName: "User",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete account error:", error);
    return { error: "Failed to delete account" };
  }
}

export async function recoverAccountAction() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const userId = session.user.id;

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
      return { error: "User not found or not deleted" };
    }

    // Check if grace period has expired
    if (
      deletedUser.permanentlyDeletedAt &&
      new Date() > deletedUser.permanentlyDeletedAt
    ) {
      return {
        error: "Account recovery period has expired. Please contact support.",
      };
    }

    // Restore the user's original email and name
    const originalEmail = deletedUser.email.replace(/^deleted_\d+_/, "");

    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: null,
        permanentlyDeletedAt: null,
        email: originalEmail,
        firstName: "Recovered",
        lastName: "User",
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

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Account recovery error:", error);
    return { error: "Failed to recover account" };
  }
}
