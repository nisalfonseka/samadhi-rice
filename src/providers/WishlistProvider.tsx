"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type WishlistContextValue = {
  items: string[];
  count: number;
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  isOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}

const STORAGE_KEY = "samadhi-wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) queueMicrotask(() => setItems(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const has = useCallback((slug: string) => items.includes(slug), [items]);

  const toggle = useCallback((slug: string) => {
    setItems((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  const openWishlist = useCallback(() => setIsOpen(true), []);
  const closeWishlist = useCallback(() => setIsOpen(false), []);

  const count = items.length;

  const value = useMemo(
    () => ({
      items,
      count,
      has,
      toggle,
      isOpen,
      openWishlist,
      closeWishlist,
    }),
    [items, count, has, toggle, isOpen, openWishlist, closeWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

