import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { useAuth } from "./auth";
import { api } from "../lib/api";

export interface CartItem {
  productId: number;
  name: string;
  priceKobo: number;
  imageUrl: string;
  quantity: number;
}

interface CartValue {
  items: CartItem[];
  totalItems: number;
  totalKobo: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartValue | null>(null);
const STORAGE_KEY = "shopng_cart";
// Which user the local cart was last synced with. If it differs from the
// signed-in user, the local cart was built as a guest and gets merged in.
const OWNER_KEY = "shopng_cart_owner";
const PUSH_DELAY_MS = 500;

function mergeCarts(local: CartItem[], server: CartItem[]): CartItem[] {
  const merged = new Map(server.map((i) => [i.productId, i]));
  for (const l of local) {
    const s = merged.get(l.productId);
    merged.set(l.productId, s ? { ...s, quantity: Math.max(s.quantity, l.quantity) } : l);
  }
  return [...merged.values()];
}

const sameCart = (a: CartItem[], b: CartItem[]) =>
  a.length === b.length && a.every((x, i) => x.productId === b[i].productId && x.quantity === b[i].quantity);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { token, user } = useAuth();
  const owner = user?.email || null;
  const itemsRef = useRef<CartItem[]>([]);
  const syncedFor = useRef<string | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => stored && setItems(JSON.parse(stored) as CartItem[]))
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, hydrated]);

  // Signed in: load the server cart once per session (merging a guest cart).
  useEffect(() => {
    if (!hydrated || !token || !owner) return;
    let cancelled = false;
    (async () => {
      let server: CartItem[];
      try {
        server = await api.cart(token);
      } catch {
        return;
      }
      if (cancelled) return;
      const lastOwner = await AsyncStorage.getItem(OWNER_KEY).catch(() => null);
      const next = lastOwner === owner ? server : mergeCarts(itemsRef.current, server);
      setItems((prev) => (sameCart(prev, next) ? prev : next));
      AsyncStorage.setItem(OWNER_KEY, owner).catch(() => {});
      syncedFor.current = owner;
      if (!sameCart(next, server)) api.saveCart(token, next).catch(() => {});
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, token, owner]);

  // Signed out: forget the owner so the next login merges instead of overwriting.
  useEffect(() => {
    if (!hydrated || token) return;
    syncedFor.current = null;
    AsyncStorage.removeItem(OWNER_KEY).catch(() => {});
  }, [hydrated, token]);

  // Push local changes to the server (debounced).
  useEffect(() => {
    if (!token || !owner || syncedFor.current !== owner) return;
    pushTimer.current = setTimeout(() => {
      pushTimer.current = null;
      api.saveCart(token, items).catch(() => {});
    }, PUSH_DELAY_MS);
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [items, token, owner]);

  // Pick up changes made on another device when the app returns to the foreground.
  useEffect(() => {
    if (!token || !owner) return;
    const sub = AppState.addEventListener("change", async (state) => {
      if (state !== "active" || syncedFor.current !== owner || pushTimer.current) return;
      try {
        const server = await api.cart(token);
        if (!pushTimer.current) setItems((prev) => (sameCart(prev, server) ? prev : server));
      } catch {}
    });
    return () => sub.remove();
  }, [token, owner]);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) =>
      prev.some((i) => i.productId === newItem.productId)
        ? prev.map((i) => (i.productId === newItem.productId ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { ...newItem, quantity: 1 }]
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      totalKobo: items.reduce((s, i) => s + i.priceKobo * i.quantity, 0),
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
