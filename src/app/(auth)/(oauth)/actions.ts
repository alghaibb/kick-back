"use server";

import { env } from "@/lib/env";
import { signIn } from "@/lib/auth";

export async function googleLogin() {
  await signIn("google", {
    redirect: true,
    redirectTo: `${env.NEXT_PUBLIC_BASE_URL}/onboarding`,
  });
}

export async function facebookLogin() {
  await signIn("facebook", {
    redirect: true,
    redirectTo: `${env.NEXT_PUBLIC_BASE_URL}/onboarding`,
  });
}