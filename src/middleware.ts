import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("authjs.session-token")?.value;

  const isLoggedIn = Boolean(sessionToken);

  const unauthOnlyRoutes = [
    "/login",
    "/create-account",
    "/verify-account",
    "/magic-link-verify",
    "/magic-link-create",
    "/magic-link-login",
  ];

  const { pathname } = request.nextUrl;

  if (isLoggedIn && unauthOnlyRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/create-account",
    "/verify-account",
    "/magic-link-verify",
    "/magic-link-create",
    "/magic-link-login",
  ],
};
