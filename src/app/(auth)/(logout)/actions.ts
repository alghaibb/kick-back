"use server";

import { signOut as authSignOut } from "@/lib/auth";
import { getSession } from "@/utils/sessions";

export async function logout() {
  const session = getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  await authSignOut({ redirect: true, redirectTo: "/login" });
}