"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { serverOnboardingSchema } from "@/validations/onboardingSchema";
import { del } from "@vercel/blob";

export async function onboarding(values: unknown) {
  try {
    const validated = serverOnboardingSchema.parse(values);
    const { firstName, lastName, nickname, image, previousImage } = validated;

    const session = await getSession();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Not authenticated");

    if (
      previousImage &&
      previousImage.includes("vercel-storage") &&
      previousImage !== image
    ) {
      await del(previousImage);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, nickname, image, hasOnboarded: true },
    });

    return { success: "Onboarding was successful!" };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
}
