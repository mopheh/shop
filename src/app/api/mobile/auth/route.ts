import { NextRequest, NextResponse } from "next/server";

/**
 * Start of the mobile sign-in flow. The app opens this URL in an in-app
 * browser; we send the user through the normal web sign-in page and then on to
 * /api/mobile/auth/complete, which hands a token back to the app.
 */
export function GET(req: NextRequest) {
  const url = new URL("/sign-in", req.nextUrl.origin);
  const complete = new URL("/api/mobile/auth/complete", req.nextUrl.origin);
  const redirect = req.nextUrl.searchParams.get("redirect");
  if (redirect) complete.searchParams.set("redirect", redirect);
  url.searchParams.set("callbackUrl", complete.pathname + complete.search);
  return NextResponse.redirect(url);
}
