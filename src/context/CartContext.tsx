"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: number;
  name: string;
  priceKobo: number;
  imageUrl: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalKobo: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "shopng_cart";
// Which user the local cart was last synced with. If it differs from the
// signed-in user, the local cart was built as a guest and gets merged in.
const OWNER_KEY = "shopng_cart_owner";
const PUSH_DELAY_MS = 500;

async function fetchServerCart(): Promise<CartItem[] | null> {
  try {
    const res = await fetch("/api/cart", { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()) as { items: CartItem[] }).items;
  } catch {
    return null;
  }
}

function pushServerCart(items: CartItem[]): Promise<Response> {
  return fetch("/api/cart", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    }),
  });
}

function mergeCarts(local: CartItem[], server: CartItem[]): CartItem[] {
  const merged = new Map(server.map((i) => [i.productId, i]));
  for (const l of local) {
    const s = merged.get(l.productId);
    merged.set(l.productId, s ? { ...s, quantity: Math.max(s.quantity, l.quantity) } : l);
  }
  return [...merged.values()];
}

const sameCart = (a: CartItem[], b: CartItem[]) =>
  a.length === b.length &&
  a.every((x, i) => x.productId === b[i].productId && x.quantity === b[i].quantity);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const itemsRef = useRef<CartItem[]>([]);
  const syncedFor = useRef<string | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Hydrate from localStorage on mount — deferred to avoid
  // calling setState synchronously inside the effect body.
  useEffect(() => {
    Promise.resolve().then(() => {
      let parsed: CartItem[] = [];
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) parsed = JSON.parse(stored) as CartItem[];
      } catch {
        // ignore parse errors
      }
      setItems(parsed);
      setHydrated(true);
    });
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors (e.g. private browsing quota)
    }
  }, [items, hydrated]);

  // Signed in: load the server cart once per session (merging a guest cart).
  useEffect(() => {
    if (!hydrated || !userId) return;
    let cancelled = false;
    (async () => {
      const server = await fetchServerCart();
      if (cancelled || !server) return;
      const owner = localStorage.getItem(OWNER_KEY);
      const next = owner === userId ? server : mergeCarts(itemsRef.current, server);
      setItems((prev) => (sameCart(prev, next) ? prev : next));
      try {
        localStorage.setItem(OWNER_KEY, userId);
      } catch {}
      syncedFor.current = userId;
      if (!sameCart(next, server)) pushServerCart(next).catch(() => {});
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, userId]);

  // Signed out: forget the owner so the next login merges instead of overwriting.
  useEffect(() => {
    if (status !== "unauthenticated") return;
    syncedFor.current = null;
    try {
      localStorage.removeItem(OWNER_KEY);
    } catch {}
  }, [status]);

  // Push local changes to the server (debounced).
  useEffect(() => {
    if (!userId || syncedFor.current !== userId) return;
    pushTimer.current = setTimeout(() => {
      pushTimer.current = null;
      pushServerCart(items).catch(() => {});
    }, PUSH_DELAY_MS);
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [items, userId]);

  // Pick up changes made on another device when the tab regains focus.
  useEffect(() => {
    if (!userId) return;
    async function refresh() {
      if (document.visibilityState !== "visible") return;
      if (syncedFor.current !== userId || pushTimer.current) return;
      const server = await fetchServerCart();
      if (server && !pushTimer.current) {
        setItems((prev) => (sameCart(prev, server) ? prev : server));
      }
    }
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [userId]);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === newItem.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === newItem.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const totalKobo = useMemo(
    () => items.reduce((sum, i) => sum + i.priceKobo * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      totalKobo,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, totalItems, totalKobo, addItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
