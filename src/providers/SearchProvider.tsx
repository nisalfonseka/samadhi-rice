"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

type SearchCtx = {
  isOpen: boolean;
  openSearch: (prefill?: string) => void;
  closeSearch: () => void;
  query: string;
  setQuery: (q: string) => void;
};

const Ctx = createContext<SearchCtx>({} as SearchCtx);
export const useSearch = () => useContext(Ctx);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const openSearch = useCallback((prefill = "") => {
    setQuery(prefill);
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [openSearch]);

  return (
    <Ctx.Provider value={{ isOpen, openSearch, closeSearch, query, setQuery }}>
      {children}
    </Ctx.Provider>
  );
}
