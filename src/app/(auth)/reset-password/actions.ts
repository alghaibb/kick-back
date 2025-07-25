"use server"

import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limiter";
import { deleteResetPasswordToken } from "@/utils/tokens";
import { getUserByResetPasswordToken } from "@/utils/user";
import { resetPasswordSchema, ResetPasswordValues } from "@/validations/auth";
import bcrypt from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const limiter = rateLimit({ interval: 60000 });

export async function resetPassword(token: string, values: ResetPasswordValues) {
  try {
    const validatedValues = resetPasswordSchema.parse(values);
    const { newPassword, newConfirmPassword } = validatedValues;

    // Get IP address for rate limiting
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown';

    // Check rate limit before processing password reset
    try {
      await limiter.check(3, "ip", undefined, ipAddress);
    } catch (error) {
      if (error instanceof Response) {
        const body = await error.json();
        return { error: body?.error };
      }
    }

    if (newPassword !== newConfirmPassword) {
      return { error: "Passwords do not match" };
    }

    const resetPasswordToken = await prisma.resetPasswordToken.findFirst({
      where: { token },
      include: { user: true },
    });

    const user = await getUserByResetPasswordToken(token);

    if (await bcrypt.compare(newPassword, user?.password as string)) {
      return { error: "You cannot use the old password as the new password." };
    }

    if (!resetPasswordToken || !resetPasswordToken.user) {
      return { error: "Invalid or expired token." };
    }

    if (resetPasswordToken.expiresAt < new Date()) {
      await deleteResetPasswordToken(resetPasswordToken.id);
      return { error: "Token has expired. Please request a new password reset link." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: resetPasswordToken.userId },
      data: { password: hashedPassword },
    });

    await deleteResetPasswordToken(resetPasswordToken.token);

    redirect("/login");

  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error resetting password:", error);
    return { error: "Error resetting password" }
  }
}