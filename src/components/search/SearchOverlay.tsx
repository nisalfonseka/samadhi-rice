"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/providers/SearchProvider";
import { formatLKR, priceFor } from "@/lib/pricing";
import type { ProductDTO } from "@/lib/services/product.service";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Suwandel",
  "Kalu Heenati",
  "Red rice",
  "Keeri Samba",
  "Nadu rice",
  "Suduru Samba",
  "Bulk order",
];

export default function SearchOverlay() {
  const { isOpen, closeSearch, query, setQuery } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // focus + reset when overlay opens/closes
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    } else {
      setResults([]);
      setActive(-1);
    }
  }, [isOpen]);

  // body scroll lock
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // debounced live search
  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.products ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, isOpen]);

  const navigate = useCallback(
    (href: string) => {
      closeSearch();
      router.push(href);
    },
    [closeSearch, router],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        closeSearch();
        break;
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(a + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(a - 1, -1));
        break;
      case "Enter":
        if (active >= 0 && results[active]) {
          navigate(`/shop/${results[active].slug}`);
        } else if (query.trim()) {
          navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
        }
        break;
    }
  };

  if (!isOpen) return null;

  const showSuggestions = query.trim().length < 2;
  const showResults = !showSuggestions && !loading && results.length > 0;
  const showEmpty = !showSuggestions && !loading && results.length === 0;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col" role="dialog" aria-modal aria-label="Search">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-paddy-950/75 backdrop-blur-sm"
        onClick={closeSearch}
      />

      {/* panel — slides down */}
      <div
        className="relative z-10 mx-auto mt-[clamp(3.5rem,7vh,7rem)] w-full max-w-[42rem] px-4"
        style={{ animation: "searchDrop 0.28s cubic-bezier(0.16,1,0.3,1)" }}
      >
        <div className="overflow-hidden rounded-3xl border border-husk/10 bg-rice-50 shadow-[0_40px_80px_-20px_rgba(18,27,13,0.8)]">

          {/* ── input row ── */}
          <div className="flex items-center gap-3 border-b border-husk/10 px-5 py-4">
            <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem] shrink-0 text-husk-soft" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.65" />
              <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              autoComplete="off"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(-1); }}
              onKeyDown={handleKeyDown}
              placeholder="Search Suwandel, Kalu Heenati, red rice…"
              className="flex-1 bg-transparent text-[0.95rem] text-husk outline-none placeholder:text-husk/35"
            />
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-paddy-300 border-t-paddy-700" />
            )}
            {query && !loading && (
              <button
                onClick={() => { setQuery(""); setActive(-1); inputRef.current?.focus(); }}
                aria-label="Clear"
                className="rounded-full p-1 text-husk-soft transition-colors hover:text-husk"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <button
              onClick={closeSearch}
              aria-label="Close search"
              className="hidden items-center gap-1 rounded-xl border border-husk/12 px-2 py-1 text-[0.62rem] font-medium text-husk-soft transition-colors hover:border-husk/25 hover:text-husk sm:flex"
            >
              Esc
            </button>
          </div>

          {/* ── body ── */}
          <div className="max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain">

            {/* suggestions */}
            {showSuggestions && (
              <div className="p-5">
                <p className="mb-3 text-[0.67rem] font-semibold uppercase tracking-[0.14em] text-husk-soft">
                  Popular varieties
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="rounded-full border border-husk/14 px-3.5 py-1.5 text-sm text-husk transition-all duration-200 hover:border-paddy-700 hover:bg-paddy-800 hover:text-rice-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-husk-soft">
                  Quick links
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { label: "All products", href: "/shop" },
                    { label: "On sale", href: "/shop?sort=newest" },
                    { label: "Best rated", href: "/shop?sort=rating" },
                  ].map((l) => (
                    <button
                      key={l.href}
                      onClick={() => navigate(l.href)}
                      className="flex items-center gap-1.5 rounded-full border border-husk/14 px-3.5 py-1.5 text-sm text-husk transition-all duration-200 hover:border-paddy-700 hover:bg-paddy-800 hover:text-rice-50"
                    >
                      {l.label}
                      <span aria-hidden className="text-xs opacity-50">↗</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* results */}
            {showResults && (
              <ul role="listbox">
                {results.map((p, i) => {
                  const net = priceFor(p.pricePerKg, 5, p.discountPercent);
                  const isActive = active === i;
                  return (
                    <li key={p.slug} role="option" aria-selected={isActive}>
                      <button
                        onMouseEnter={() => setActive(i)}
                        onMouseLeave={() => setActive(-1)}
                        onClick={() => navigate(`/shop/${p.slug}`)}
                        className={cn(
                          "flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors duration-150",
                          isActive ? "bg-paddy-800/[0.07]" : "hover:bg-paddy-800/[0.05]",
                        )}
                      >
                        {/* grain swatch */}
                        <span
                          className="h-11 w-11 shrink-0 rounded-xl"
                          style={{
                            background: `radial-gradient(circle at 38% 32%, ${p.grain.light}, ${p.grain.mid} 52%, ${p.grain.dark})`,
                          }}
                        />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="flex items-center gap-2 leading-snug">
                            <span className="font-medium text-husk">{p.name}</span>
                            {p.discountPercent > 0 && (
                              <span className="rounded-full bg-clay-500 px-1.5 py-px text-[0.58rem] font-semibold uppercase tracking-wide text-rice-50">
                                −{p.discountPercent}%
                              </span>
                            )}
                          </span>
                          {p.note && (
                            <span className="truncate text-xs text-husk-soft">{p.note}</span>
                          )}
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="font-display text-sm font-medium text-husk">
                            {formatLKR(net)}
                          </span>
                          <span className="block text-[0.62rem] text-husk-soft">per 5 kg</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* no results */}
            {showEmpty && (
              <div className="py-10 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-paddy-800/8 mx-auto">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-husk-soft" fill="none" aria-hidden>
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
                    <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M9 11h4M11 9v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="mt-3 font-display text-lg text-husk">
                  No rice matched &ldquo;{query}&rdquo;
                </p>
                <p className="mt-1 text-sm text-husk-soft">
                  Try a variety name — Suwandel, Keeri Samba…
                </p>
                <button
                  onClick={() => navigate(`/shop?q=${encodeURIComponent(query.trim())}`)}
                  className="mt-4 rounded-full bg-paddy-800 px-5 py-2 text-sm font-medium text-rice-50 transition-colors hover:bg-paddy-700"
                >
                  Browse all products →
                </button>
              </div>
            )}
          </div>

          {/* ── footer ── */}
          {showResults && (
            <div className="flex items-center justify-between border-t border-husk/8 px-5 py-2.5">
              <button
                onClick={() => navigate(`/shop?q=${encodeURIComponent(query.trim())}`)}
                className="text-[0.78rem] font-medium text-paddy-700 transition-colors hover:text-paddy-900"
              >
                View all results for &ldquo;{query}&rdquo; →
              </button>
              <span className="hidden gap-2 text-[0.62rem] text-husk/35 sm:flex">
                <kbd className="rounded border border-husk/12 px-1.5 py-0.5">↑↓</kbd> navigate
                <kbd className="rounded border border-husk/12 px-1.5 py-0.5">↵</kbd> open
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
