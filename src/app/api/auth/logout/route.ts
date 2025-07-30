import { signOut } from "@/lib/auth";
import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Get current session to clean up from database
    const session = await getSession();

    // Clean up session from database if it exists
    if (session?.sessionToken) {
      try {
        await prisma.session.delete({
          where: { sessionToken: session.sessionToken },
        });
      } catch (error) {
        console.error("Failed to delete session from database:", error);
      }
    }

    // Sign out using NextAuth
    await signOut({ redirect: false });

    const response = NextResponse.json({ success: true, redirect: "/login" });

    // Clear all possible cookie variations with proper attributes
    const cookieNames = [
      "authjs.session-token",
      "next-auth.session-token",
      "__Secure-authjs.session-token",
      `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}authjs.session-token`,
    ];

    for (const cookieName of cookieNames) {
      // Delete cookie
      response.cookies.delete(cookieName);

      // Also set to expire immediately with proper attributes
      response.cookies.set(cookieName, "", {
        expires: new Date(0),
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
      });
    }

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    // Even if there's an error, try to clear cookies
    const response = NextResponse.json(
      { error: "Failed to logout cleanly, but cookies cleared" },
      { status: 200 } // Return 200 since we want the client to redirect anyway
    );

    // Clear cookies even on error
    const cookieNames = [
      "authjs.session-token",
      "next-auth.session-token",
      "__Secure-authjs.session-token",
    ];

    for (const cookieName of cookieNames) {
      response.cookies.set(cookieName, "", {
        expires: new Date(0),
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    return response;
  }
} 