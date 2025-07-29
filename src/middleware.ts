import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const sessionToken =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value;

  const isLoggedIn = Boolean(sessionToken);

  const unauthOnlyRoutes = [
    "/login",
    "/create-account",
    "/verify-account",
    "/magic-link-verify",
    "/magic-link-create",
    "/magic-link-login",
  ];

  const protectedRoutes = [
    "/dashboard",
    "/calendar",
    "/events",
    "/groups",
    "/profile",
    "/settings",
    "/onboarding",
  ];

  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth-only pages
  if (isLoggedIn && unauthOnlyRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (
    !isLoggedIn &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
