"use server";

import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limiter";
import { sendVerifyAccountEmail } from "@/utils/sendEmails";
import { generateVerificationCode } from "@/utils/tokens";
import { getUserByEmail } from "@/utils/user";
import { createAccountSchema, CreateAccountValues } from "@/validations/auth";
import bcrypt from "bcryptjs";

const limiter = rateLimit({ interval: 60000 });

export async function createAccount(values: CreateAccountValues) {
  try {
    const validatedValues = createAccountSchema.parse(values);
    const { firstName, lastName, email, password } = validatedValues;

    const lowercaseEmail = email.toLowerCase();

    await limiter.check(5, "email", lowercaseEmail);

    const existingUser = await getUserByEmail(lowercaseEmail);
    if (existingUser) {
      return { error: "This email is already in use." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: lowercaseEmail,
        password: hashedPassword,
      },
    });

    const verificationCode = await generateVerificationCode(lowercaseEmail, "create-account");

    await sendVerifyAccountEmail(lowercaseEmail, verificationCode);

    return { success: "Account created successfully! Please check your email to verify your account." };
  } catch (error) {
    console.error("Error signing up:", error);
    return { error: "An error occurred. Please try again." };
  }
}