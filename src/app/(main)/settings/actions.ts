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
import { del } from "@vercel/blob";

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

    // 1. Collect all images associated with the user for deletion from Vercel Blob
    const imagesToDelete: string[] = [];

    // Get user profile image
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });
    if (user?.image) {
      imagesToDelete.push(user.image);
    }

    // Get all comment images by the user
    const commentImages = await prisma.eventComment.findMany({
      where: { userId, imageUrl: { not: null } },
      select: { imageUrl: true },
    });
    commentImages.forEach((comment: { imageUrl: string | null }) => {
      if (comment.imageUrl) imagesToDelete.push(comment.imageUrl);
    });

    // Get all event photos by the user
    const eventPhotos = await prisma.eventPhoto.findMany({
      where: { userId },
      select: { imageUrl: true },
    });
    eventPhotos.forEach((photo: { imageUrl: string }) => {
      imagesToDelete.push(photo.imageUrl);
    });

    // 2. Handle group ownership - transfer ownership or delete groups
    const groupsCreatedByUser = await prisma.group.findMany({
      where: { createdBy: userId },
      include: {
        members: {
          where: { userId: { not: userId } },
          include: { user: true },
        },
      },
    });

    for (const group of groupsCreatedByUser) {
      // Add group image to deletion list
      if (group.image) {
        imagesToDelete.push(group.image);
      }

      if (group.members.length > 0) {
        // Transfer ownership to the first remaining member
        const newOwner = group.members[0];
        await prisma.groupMember.update({
          where: {
            groupId_userId: {
              groupId: group.id,
              userId: newOwner.userId,
            },
          },
          data: { role: "admin" },
        });

        // Update group's createdBy
        await prisma.group.update({
          where: { id: group.id },
          data: { createdBy: newOwner.userId },
        });
      } else {
        // No other members, delete the group entirely
        await prisma.group.delete({
          where: { id: group.id },
        });
      }
    }

    // 3. Handle events created by the user
    const eventsCreatedByUser = await prisma.event.findMany({
      where: { createdBy: userId },
      include: {
        group: {
          include: {
            members: {
              where: { userId: { not: userId } },
              orderBy: { joinedAt: "asc" },
            },
          },
        },
      },
    });

    for (const event of eventsCreatedByUser) {
      if (event.group && event.group.members.length > 0) {
        // Transfer event ownership to the first group member
        const newOwner = event.group.members[0];
        await prisma.event.update({
          where: { id: event.id },
          data: { createdBy: newOwner.userId },
        });
      } else {
        // No group or no other members, delete the event
        await prisma.event.delete({
          where: { id: event.id },
        });
      }
    }

    // 4. Delete all images from Vercel Blob
    const deletePromises = imagesToDelete.map(async (imageUrl) => {
      try {
        await del(imageUrl);
      } catch (error) {
        console.error(`Failed to delete image ${imageUrl}:`, error);
      }
    });
    await Promise.allSettled(deletePromises);

    // 5. Delete the user (this will cascade delete most related data)
    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete account error:", error);
    return { error: "Failed to delete account" };
  }
}
