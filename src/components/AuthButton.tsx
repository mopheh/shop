"use client";

import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { UserIcon } from "./icons";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
    );
  }

  if (session?.user) {
    const { name, email, image } = session.user;
    const displayName = name ?? email ?? "Account";
    const initial = displayName.charAt(0).toUpperCase();

    return (
      <div className="flex items-center gap-2">
        {/* User avatar */}
        <div
          className="relative w-8 h-8 rounded-full overflow-hidden bg-green-100 dark:bg-green-900 flex items-center justify-center flex-none"
          aria-hidden="true"
        >
          {image ? (
            <Image
              src={image}
              alt={displayName}
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-green-700 dark:text-green-300">
              {initial}
            </span>
          )}
        </div>

        {/* Sign-out button */}
        <button
          id="sign-out-btn"
          onClick={() => signOut({ redirectTo: "/" })}
          aria-label={`Sign out of ${displayName}'s account`}
          className="hidden sm:block text-xs font-medium text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      id="sign-in-btn"
      onClick={() => signIn("google")}
      aria-label="Sign in with Google"
      className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-green-600 dark:hover:text-green-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <UserIcon className="w-4 h-4" />
      <span className="hidden sm:inline">Sign in</span>
    </button>
  );
}
