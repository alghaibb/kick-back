import { signOut } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await signOut({ redirect: false });

    const response = NextResponse.json({ success: true });

    // Clear auth cookies
    response.cookies.delete("authjs.session-token");
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-authjs.session-token");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
} 