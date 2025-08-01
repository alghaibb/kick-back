import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";

export async function checkAdminAccess() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { isAdmin: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return { isAdmin: false, error: "User not found" };
    }

    const isAdmin = user.role === "ADMIN";

    return { isAdmin, error: isAdmin ? null : "Insufficient permissions" };
  } catch (error) {
    console.error("Admin access check error:", error);
    return { isAdmin: false, error: "Authentication error" };
  }
}

export async function requireAdmin() {
  const { isAdmin, error } = await checkAdminAccess();

  if (!isAdmin) {
    throw new Error(error || "Admin access required");
  }

  return true;
}
