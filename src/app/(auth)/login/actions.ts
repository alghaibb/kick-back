"use server"

import { signIn as authSignIn } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limiter";
import { getUserByEmail } from "@/utils/user";
import { LoginValues, loginSchema } from "@/validations/auth";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";

const limiter = rateLimit({ interval: 60000 });

export async function login(values: LoginValues) {
  try {
    const validatedValues = loginSchema.parse(values);
    const { email, password } = validatedValues;

    const lowercaseEmail = email.toLowerCase();

    // Get IP address for rate limiting
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown';

    // Check rate limit before processing login
    try {
      await limiter.check(5, "combined", lowercaseEmail, ipAddress);
    } catch (error) {
      if (error instanceof Response) {
        const body = await error.json();
        return { error: body?.error }
      }
    }

    const user = await getUserByEmail(lowercaseEmail);
    if (!user || !user.password) {
      return { error: "Invalid email or password." };
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password as string);

    if (!isPasswordCorrect) {
      return { error: "Invalid email or password." };
    }

    await authSignIn("credentials", {
      email: lowercaseEmail,
      password,
      redirect: false,
    });

    return { success: true };

  } catch (error) {
    console.error("Error signing in:", error);
    return { error: "An error occurred. Please try again." };
  }
}