"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { serverOnboardingSchema } from "@/validations/onboardingSchema";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function onboarding(values: unknown) {
  try {
    const validated = serverOnboardingSchema.parse(values);
    const { firstName, lastName, nickname, image, previousImage, reminderType, phoneNumber, reminderTime, timezone } = validated;

    const session = await getSession();
    const userId = session?.user?.id;
    if (!userId) {
      return { error: "You must be logged in to complete onboarding" };
    }

    // Check if user exists and hasn't already onboarded
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasOnboarded: true, image: true }
    });

    if (!existingUser) {
      return { error: "User not found" };
    }

    if (existingUser.hasOnboarded) {
      return { error: "You have already completed onboarding" };
    }

    // Delete previous image if it exists and is different
    if (
      previousImage &&
      previousImage.includes("vercel-storage") &&
      previousImage !== image
    ) {
      try {
        await del(previousImage);
      } catch (error) {
        console.error("Failed to delete previous image:", error);
        // Don't fail the entire operation if image deletion fails
      }
    }

    if (phoneNumber) {
      const existingUser = await prisma.user.findUnique({
        where: { phoneNumber },
        select: { id: true }
      });

      if (existingUser && existingUser.id !== userId) {
        return { error: "This phone number is already registered" };
      }
    }

    // Update user profile with reminder preferences
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        nickname: nickname || null,
        image,
        hasOnboarded: true,
        reminderType,
        phoneNumber,
        reminderTime,
        timezone,
      },
    });

    // Revalidate user-related pages
    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: "Profile setup completed successfully!" };
  } catch (error) {
    console.error("Onboarding error:", error);

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Something went wrong. Please try again." };
  }
}
