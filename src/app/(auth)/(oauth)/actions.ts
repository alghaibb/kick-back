"use server";

import { env } from "@/env";
import { signIn } from "@/lib/auth";

export async function googleLogin() {
  await signIn("google", {
    redirect: true,
    redirectTo: `${env.NEXT_PUBLIC_BASE_URL}/dashboard`,
  });
}