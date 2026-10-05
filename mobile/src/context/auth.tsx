import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { API_URL } from "../lib/api";

interface User {
  name: string;
  email: string;
}

interface AuthValue {
  token: string | null;
  user: User | null;
  loading: boolean;
  signIn: () => Promise<boolean>;
  /** Accepts the token handed back by the web sign-in (from the auth session or a deep link). */
  completeSignIn: (params: { token?: string; name?: string; email?: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);
const KEY = "shopng_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ token: string; user: User } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then((raw) => raw && setSession(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completeSignIn = useCallback(
    async ({ token, name, email }: { token?: string; name?: string; email?: string }) => {
      if (!token) return false;
      const next = { token, user: { name: name ?? "", email: email ?? "" } };
      setSession(next);
      await SecureStore.setItemAsync(KEY, JSON.stringify(next)).catch(() => {});
      return true;
    },
    []
  );

  /** Runs the web Google sign-in in an in-app browser; resolves true on success. */
  const signIn = useCallback(async () => {
    // shopng://auth in a built app, exp://…/--/auth inside Expo Go.
    const redirect = Linking.createURL("auth");
    const result = await WebBrowser.openAuthSessionAsync(
      `${API_URL}/api/mobile/auth?redirect=${encodeURIComponent(redirect)}`,
      redirect
    );
    if (result.type !== "success") return false;
    const params = new URL(result.url).searchParams;
    return completeSignIn({
      token: params.get("token") ?? undefined,
      name: params.get("name") ?? undefined,
      email: params.get("email") ?? undefined,
    });
  }, [completeSignIn]);

  const signOut = useCallback(async () => {
    setSession(null);
    await SecureStore.deleteItemAsync(KEY).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ token: session?.token ?? null, user: session?.user ?? null, loading, signIn, completeSignIn, signOut }),
    [session, loading, signIn, completeSignIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
