/**
 * src/auth.ts — single file for all NextAuth configuration.
 * Never scatter session checks elsewhere; use the helpers exported here.
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { upsertUser } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    // Persist the Google `sub` (user ID) into the JWT token
    jwt({ token, account, profile }) {
      if (account && profile) {
        token.sub = profile.sub ?? token.sub;
      }
      return token;
    },

    // Expose the token's sub in the session object
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },

    // Upsert the user into our DB on every sign-in
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile?.sub) {
        try {
          await upsertUser({
            id: profile.sub,
            email: user.email ?? "",
            name: user.name,
            image: user.image,
          });
        } catch (err) {
          console.error("[auth] Failed to upsert user:", err);
          // Return false would block sign-in; we allow it even if DB write fails
        }
      }
      return true;
    },
  },

  pages: {
    signIn: "/sign-in",
  },
});

// ─── Type augmentation — add `id` to the Session user ───────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
