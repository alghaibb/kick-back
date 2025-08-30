"use server";

import { signIn } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verifyMagicLinkToken } from "@/utils/tokens";

export async function verifyMagicLink(token: string) {
  try {
    const user = await verifyMagicLinkToken(token);

    if (!user || "error" in user || !user.email) {
      throw new Error("Invalid or expired magic link.");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    await signIn("credentials", {
      email: user.email,
      redirect: false,
    });

    return { success: true, redirectTo: "/onboarding" };

  } catch (error) {
    console.error("Error verifying magic link:", error);
    return { error: "An error occurred. Please try again." };
  }
}