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
    "/auth-redirect",
  ];

  const adminRoutes = ["/admin"];

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from protected pages
  if (
    !isLoggedIn &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect unauthenticated users away from admin pages
  if (!isLoggedIn && adminRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For admin routes, we'll let the client-side AdminAccessGuard handle role checking
  // since we can't easily check the user role in middleware without a database call
  // The AdminAccessGuard will redirect non-admin users to /forbidden

  // Redirect authenticated users away from auth-only pages
  // Let auth-redirect page handle onboarding vs dashboard routing
  if (isLoggedIn && unauthOnlyRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth-redirect", request.url));
  }

  return NextResponse.next();
}
