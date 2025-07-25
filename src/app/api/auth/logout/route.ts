import { signOut } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await signOut({ redirect: false });

    const response = NextResponse.json({ success: true, redirect: "/login" });

    // Clear auth cookies - use the same naming convention as auth.ts
    const cookieName = `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}authjs.session-token`;

    // Clear all possible cookie variations
    response.cookies.delete(cookieName);
    response.cookies.delete("authjs.session-token");
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-authjs.session-token");

    // Also set cookies to expire immediately as a fallback
    response.cookies.set(cookieName, "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
} 