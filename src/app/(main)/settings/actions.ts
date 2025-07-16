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

    const { reminderType, reminderTime, timezone, phoneNumber, notificationOptIn } = validatedFields.data;

    // Validate and format phone number using utils
    let formattedPhone: string | null = null;
    if (reminderType === "sms" || reminderType === "both") {
      const country = detectCountryForSMS(phoneNumber || "", timezone, "AU");
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
      return { error: "You cannot change password. Your account uses social login (Google/Facebook) or magic link authentication." };
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
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