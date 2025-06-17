import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function getSession() {
  try {
    const cookieStore = await cookies();

    const possibleTokens = [
      "authjs.session-token",
      "next-auth.session-token",
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
    ];

    let sessionToken = null;

    for (const tokenName of possibleTokens) {
      const cookie = cookieStore.get(tokenName);
      if (cookie) {
        sessionToken = cookie.value;
        break;
      }
    }

    if (!sessionToken) {
      return null;
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || new Date(session.expires) < new Date()) {
      return null;
    }

    return {
      ...session,
      user: {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
      },
      expires: session.expires.toISOString(),
    };
  } catch (error) {
    console.error("An error occurred while fetching the session:", error);
    return null;
  }
}