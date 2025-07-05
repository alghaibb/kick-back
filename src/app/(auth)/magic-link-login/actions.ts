"use server";

import { sendMagicLinkEmail } from "@/utils/sendEmails";
import { generateMagicLinkToken } from "@/utils/tokens";
import { getUserByEmail } from "@/utils/user";
import { magicLinkLoginSchema, MagicLinkLoginValues } from "@/validations/auth";

export async function magicLinkLogin(values: MagicLinkLoginValues) {
  try {
    const validatedValues = magicLinkLoginSchema.parse(values);
    const { email } = validatedValues;

    const lowercaseEmail = email.toLowerCase();

    const user = await getUserByEmail(lowercaseEmail);

    if (!user) {
      return { error: "User not found. Please sign up first." };
    }

    const magicLinkToken = await generateMagicLinkToken(lowercaseEmail);
    
    await sendMagicLinkEmail(lowercaseEmail, magicLinkToken);
    return { success: "Check your email for a magic link to sign in." };
  } catch (error) {
    console.error("Error in Magic Link Sign-In:", error);
    return { error: "An error occurred. Please try again." };
  }
}