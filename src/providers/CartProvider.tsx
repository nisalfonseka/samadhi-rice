"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartLine = {
  slug: string;
  name: string;
  weight: number;
  price: number;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (line: Omit<CartLine, "qty"> & { qty?: number }) => void;
  /** timestamp of the last add — lets the header animate the cart badge */
  lastAddedAt: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

const STORAGE_KEY = "samadhi-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [lastAddedAt, setLastAddedAt] = useState(0);

  // hydrate from localStorage (persists across sessions)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, [lines]);

  const add = useCallback<CartContextValue["add"]>((line) => {
    setLines((prev) => {
      const idx = prev.findIndex(
        (l) => l.slug === line.slug && l.weight === line.weight,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + (line.qty ?? 1) };
        return next;
      }
      return [...prev, { ...line, qty: line.qty ?? 1 }];
    });
    setLastAddedAt(Date.now());
  }, []);

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);
  const total = useMemo(
    () => lines.reduce((s, l) => s + l.price * l.qty, 0),
    [lines],
  );

  const value = useMemo(
    () => ({ lines, count, total, add, lastAddedAt }),
    [lines, count, total, add, lastAddedAt],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
