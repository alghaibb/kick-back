import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function getSession() {
  try {
    const cookieStore = await cookies();

    const possibleTokens = [
      // Check production token first
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
      // Fallback tokens
      "authjs.session-token",
      "next-auth.session-token",
      "__Secure-authjs.session-token",
    ];

    let sessionToken = null;

    for (const tokenName of possibleTokens) {
      const cookie = cookieStore.get(tokenName);
      if (cookie?.value) {
        sessionToken = cookie.value;
        break;
      }
    }

    if (!sessionToken) {
      console.log("[getSession] No session token found in cookies");
      return null;
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session) {
      console.log("[getSession] No session found in database for token");
      return null;
    }

    // Check if session is expired
    if (new Date(session.expires) < new Date()) {
      console.log("[getSession] Session expired, cleaning up");

      // Clean up expired session from database
      try {
        await prisma.session.delete({
          where: { sessionToken },
        });
      } catch (error) {
        console.error("[getSession] Failed to delete expired session:", error);
      }

      return null;
    }

    // Extend session if it's close to expiring (within 7 days)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (session.expires < sevenDaysFromNow) {
      try {
        await prisma.session.update({
          where: { sessionToken },
          data: {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Extend by 30 days
          },
        });
      } catch (error) {
        console.error("[getSession] Failed to extend session:", error);
      }
    }

    return {
      ...session,
      user: {
        id: session.user.id,
        nickname: session.user.nickname,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        email: session.user.email,
        password: session.user.password,
        emailVerified: session.user.emailVerified,
        image: session.user.image,
        timezone: session.user.timezone,
        hasOnboarded: session.user.hasOnboarded,
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
      },
      expires: session.expires.toISOString(),
    };
  } catch (error) {
    console.error("[getSession] An error occurred while fetching the session:", error);
    return null;
  }
}
