"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import {
  updateProfileSchema,
  UpdateProfileValues,
} from "@/validations/profile/profileSchema";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(values: UpdateProfileValues) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Validate the input
    const validatedFields = updateProfileSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const { firstName, lastName, nickname, email, image } = validatedFields.data;

    // Get current user data to check for existing image
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return { error: "Email is already taken" };
      }
    }
    // Handle image upload if provided
    if (image === null && currentUser?.image) {
      try {
        await del(currentUser.image);
      } catch (error) {
        console.error("Failed to delete old image:", error);
      }
    }

    // Update user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName: lastName || null,
        nickname: nickname || null,
        email,
        image,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "Failed to update profile" };
  }
}

