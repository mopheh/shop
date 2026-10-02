/**
 * proxy.ts — protects checkout and order history from unauthenticated access.
 * Per AGENTS.md: browsing is public; checkout and order history require login.
 *
 * Next.js 16 renamed "middleware" to "proxy". The function export must be named
 * `proxy` (or be a default export).
 */

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NextAuth v5's auth() wraps the proxy function and injects req.auth
export const proxy = auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!(req as { auth?: unknown }).auth;

  // Routes that require authentication
  const protectedPrefixes = ["/checkout", "/orders"];
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !isLoggedIn) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Run on all routes except static files and Next internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
