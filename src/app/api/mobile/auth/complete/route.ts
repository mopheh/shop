import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { signMobileToken } from "@/lib/mobile-auth";

export const runtime = "nodejs";

// `shopng` is the installed app (mobile/app.json); `exp`/`exps` is Expo Go during testing.
const ALLOWED_SCHEMES = ["shopng:", "exp:", "exps:"];

function appRedirect(req: NextRequest): URL {
  const raw = req.nextUrl.searchParams.get("redirect");
  try {
    const url = new URL(raw ?? "shopng://auth");
    if (ALLOWED_SCHEMES.includes(url.protocol)) return url;
  } catch {}
  return new URL("shopng://auth");
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    const retry = new URL("/api/mobile/auth", req.nextUrl.origin);
    retry.search = req.nextUrl.search;
    return NextResponse.redirect(retry);
  }
  const token = await signMobileToken({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });
  const redirect = appRedirect(req);
  redirect.searchParams.set("token", token);
  redirect.searchParams.set("name", session.user.name ?? "");
  redirect.searchParams.set("email", session.user.email ?? "");
  return NextResponse.redirect(redirect.toString());
}
