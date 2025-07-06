"use server";

import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limiter";
import { sendMagicLinkEmail } from "@/utils/sendEmails";
import { generateMagicLinkToken } from "@/utils/tokens";
import { getUserByEmail } from "@/utils/user";
import { MagicLinkCreateAccountValues, magicLinkCreateAccountSchema } from "@/validations/auth";

const limiter = rateLimit({ interval: 60000 });

export async function magicLinkCreate(values: MagicLinkCreateAccountValues) {
  try {
    const validatedValues = magicLinkCreateAccountSchema.parse(values);
    const { firstName, lastName, email } = validatedValues;

    const lowercaseEmail = email.toLowerCase();

    await limiter.check(5, "email", lowercaseEmail);

    const existingUser = await getUserByEmail(lowercaseEmail);
    if (existingUser) {
      return { error: "This email is already in use." };
    }

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: lowercaseEmail,
      },
    });

    const magicLinkToken = await generateMagicLinkToken(lowercaseEmail);

    await sendMagicLinkEmail(lowercaseEmail, magicLinkToken);

    return { success: "Check your email for a magic link to complete sign-up." };
  } catch (error) {
    console.error("Error in Magic Link Sign-Up:", error);
    return { error: "An error occurred. Please try again." };
  }
}