"use server"

import { signIn } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { deleteVerificationOTP, verifyVerificationOTP } from "@/utils/tokens";
import { otpSchema, OTPValues } from "@/validations/auth";

export async function verifyAccount(values: OTPValues) {
  try {
    const validatedValues = otpSchema.parse(values);
    const { otp } = validatedValues;

    const { user, error } = await verifyVerificationOTP(otp);

    if (error) {
      return { error };
    }

    if (!user) {
      return { error: "Invalid or expired OTP." };
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