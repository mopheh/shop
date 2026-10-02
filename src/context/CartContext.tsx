"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

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
