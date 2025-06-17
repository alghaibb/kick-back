"use server";

import { sendResetPasswordEmail } from "@/utils/sendEmails";
import { generateResetPasswordToken } from "@/utils/tokens";
import { getUserByEmail } from "@/utils/user";
import { forgotPasswordSchema, ForgotPasswordValues } from "@/validations/auth";

export async function forgotPassword(values: ForgotPasswordValues) {
  try {
    const validatedValues = forgotPasswordSchema.parse(values)
    const { email } = validatedValues

    const lowercasedEmail = email.toLowerCase()

    const user = await getUserByEmail(lowercasedEmail)
    if (!user) {
      return { error: "No user found with this email" }
    }

    const resetPasswordToken = await generateResetPasswordToken(user.email)

    await sendResetPasswordEmail(
      user.email,
      user.firstName,
      resetPasswordToken as string
    );

    return { success: "Reset password email sent" }

  } catch (error) {
    console.error("Error sending reset password email", error)
    return { error: "Error sending reset password email" }
  }
}