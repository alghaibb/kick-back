"use server"

import { signIn as authSignIn } from "@/lib/auth";
import { getUserByEmail } from "@/utils/user";
import { LoginValues, loginSchema } from "@/validations/auth";
import bcrypt from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

export async function login(values: LoginValues) {
  try {
    const validatedValues = loginSchema.parse(values);
    const { email, password } = validatedValues;

    const lowercaseEmail = email.toLowerCase();

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

    redirect("/dashboard");

  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error signing in:", error);
    return { error: "An error occurred. Please try again." };
  }
}