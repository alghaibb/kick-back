"use server";

import { rateLimit } from "@/lib/rate-limiter";
import { sendMagicLinkEmail } from "@/utils/sendEmails";
import { generateMagicLinkToken } from "@/utils/tokens";
import { getUserByEmail } from "@/utils/user";
import { magicLinkLoginSchema, MagicLinkLoginValues } from "@/validations/auth";

const limiter = rateLimit({ interval: 60000 });

export async function magicLinkLogin(values: MagicLinkLoginValues) {
  try {
    const validatedValues = magicLinkLoginSchema.parse(values);
    const { email } = validatedValues;

    const lowercaseEmail = email.toLowerCase();

    await limiter.check(5, "email", lowercaseEmail);

    const user = await getUserByEmail(lowercaseEmail);

    if (!user) {
      return { error: "User not found. Please create an account first." };
    }
    const magicLinkToken = await generateMagicLinkToken(lowercaseEmail);

    await sendMagicLinkEmail(lowercaseEmail, magicLinkToken);

    return { success: "Magic link sent successfully!" };
  } catch (error) {
    console.error("Error sending magic link:", error);
    return { error: "Failed to send magic link. Please try again later." };
  }
}