"use server"

import { signIn } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limiter";
import { deleteVerificationOTP, verifyVerificationOTP } from "@/utils/tokens";
import { otpSchema, OTPValues } from "@/validations/auth";
import { headers } from "next/headers";

const limiter = rateLimit({ interval: 60000 });

export async function verifyAccount(values: OTPValues) {
  try {
    const validatedValues = otpSchema.parse(values);
    const { otp } = validatedValues;

    // Get IP address for rate limiting
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown';

    try {
      await limiter.check(5, "ip", undefined, ipAddress);
    } catch (error: any) {
      if (error instanceof Response) {
        const body = await error.json();
        return { error: body?.error };
      }
    }

    const { user, error } = await verifyVerificationOTP(otp);

    if (error) {
      return { error };
    }

    if (!user) {
      return { error: "Invalid or expired OTP." };
    }

    if (user.emailVerified) {
      return { error: "Your account is already verified." };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    await deleteVerificationOTP(otp);

    const result: { error?: string } = await signIn("credentials", {
      email: user.email,
      password: "",
      redirect: false,
    });

    if (result?.error) {
      console.error("Failed to log in user after verification:", result.error);
      return { error: "Failed to log in. Please try logging in manually." };
    }

    return { success: "Account verified successfully!" };
  } catch (error) {
    console.error("Error verifying account:", error);
    return { error: "An error occurred while verifying your account." };
  }
}