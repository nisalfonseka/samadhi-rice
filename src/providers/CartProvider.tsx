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
  subtotal: number;
  add: (line: Omit<CartLine, "qty"> & { qty?: number }) => void;
  setQty: (slug: string, weight: number, qty: number) => void;
  remove: (slug: string, weight: number) => void;
  clear: () => void;
  /** timestamp of the last add — lets the header animate the cart badge */
  lastAddedAt: number;
  // drawer
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
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
  const [isOpen, setIsOpen] = useState(false);

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
    setIsOpen(true);
  }, []);

  const setQty = useCallback<CartContextValue["setQty"]>(
    (slug, weight, qty) => {
      setLines((prev) =>
        prev
          .map((l) =>
            l.slug === slug && l.weight === weight
              ? { ...l, qty: Math.max(0, qty) }
              : l,
          )
          .filter((l) => l.qty > 0),
      );
    },
    [],
  );

  const remove = useCallback<CartContextValue["remove"]>((slug, weight) => {
    setLines((prev) =>
      prev.filter((l) => !(l.slug === slug && l.weight === weight)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.price * l.qty, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      count,
      subtotal,
      add,
      setQty,
      remove,
      clear,
      lastAddedAt,
      isOpen,
      openCart,
      closeCart,
    }),
    [lines, count, subtotal, add, setQty, remove, clear, lastAddedAt, isOpen, openCart, closeCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
