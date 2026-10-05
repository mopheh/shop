/**
 * Bearer-token auth for the mobile app. The web app uses NextAuth cookies;
 * the mobile app gets a short-lived HS256 JWT (signed with AUTH_SECRET) after
 * completing the same Google sign-in in an in-app browser.
 */

import { SignJWT, jwtVerify } from "jose";
import { auth } from "@/auth";

const secret = () => {
  if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(process.env.AUTH_SECRET);
};

export async function signMobileToken(user: {
  id: string;
  email?: string | null;
  name?: string | null;
}): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, aud: "mobile" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

/** Returns the signed-in user's id from a Bearer token or the web session cookie. */
export async function getUserId(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    try {
      const { payload } = await jwtVerify(header.slice(7), secret(), {
        audience: "mobile",
      });
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }
  const session = await auth();
  return session?.user?.id ?? null;
}
