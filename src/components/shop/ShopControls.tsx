"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Cat = { name: string; slug: string; count: number };

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
];

const PRICES = [
  { value: "", label: "Any price" },
  { value: "lt300", label: "Under Rs. 300 / kg" },
  { value: "300-400", label: "Rs. 300 – 400 / kg" },
  { value: "gt400", label: "Over Rs. 400 / kg" },
];

/* "have we hydrated yet" — createPortal needs a real document. */
const noopSubscribe = () => () => {};

export default function ShopControls({
  categories,
  total,
}: {
  categories: Cat[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [sheet, setSheet] = useState(false);

  // the sheet is portalled to <body>: <main> is `relative z-10`, so anything
  // rendered inside it can never scrim the fixed header.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const activeCategory = sp.get("category") ?? "";
  const activeSort = sp.get("sort") ?? "featured";
  const activePrice = sp.get("price") ?? "";
  const hasFilters = Boolean(activeCategory || activePrice || sp.get("q") || sp.get("sort"));

  // badge on the mobile trigger — only counts what the sheet actually controls
  const sheetCount = (activePrice ? 1 : 0) + (activeSort !== "featured" ? 1 : 0);

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(sp.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      startTransition(() =>
        router.push(`${pathname}?${params.toString()}`, { scroll: false }),
      );
    },
    [sp, pathname, router],
  );

  const clearAll = useCallback(() => {
    setQ("");
    startTransition(() => router.push(pathname, { scroll: false }));
  }, [pathname, router]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      if ((sp.get("q") ?? "") !== q) setParam("q", q);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // lock the page behind the filter sheet
  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheet]);

  // close the sheet with Escape
  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  return (
    <div className="flex flex-col gap-3 sm:gap-6">
      {/* search — sits in a row with the filter trigger on mobile */}
      <div className="flex items-center gap-2 sm:max-w-md">
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-husk-soft sm:left-4 sm:h-[1.1rem] sm:w-[1.1rem]" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
            <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search rice"
            placeholder="Search rice…"
            /* text-base on mobile keeps iOS Safari from zooming the page on focus */
            className="w-full rounded-full border border-husk/15 bg-rice-50 py-2 pl-9 pr-9 text-base text-husk outline-none transition-colors placeholder:text-husk-soft/70 focus:border-paddy-600 sm:py-3 sm:pl-11 sm:pr-10 sm:text-sm"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-husk-soft transition-colors hover:bg-husk/8 hover:text-husk"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* mobile filter trigger */}
        <button
          onClick={() => setSheet(true)}
          aria-label="Filter and sort"
          className="relative grid h-[2.6rem] w-[2.6rem] shrink-0 place-items-center rounded-full border border-husk/15 bg-rice-50 text-husk transition-colors active:bg-rice-200 sm:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-[1.15rem] w-[1.15rem]" aria-hidden>
            <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          {sheetCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-paddy-800 px-1 text-[0.6rem] font-bold text-rice-50">
              {sheetCount}
            </span>
          )}
        </button>
      </div>

      {/* category pills — a swipeable rail on mobile, wraps from sm up.
          The negative margin lets the rail bleed to the screen edge. */}
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-1.5 overflow-x-auto px-4 pb-0.5 sm:mx-0 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0">
        <CategoryPill
          active={!activeCategory}
          label="All rice"
          onClick={() => setParam("category", "")}
        />
        {categories.map((c) => (
          <CategoryPill
            key={c.slug}
            active={activeCategory === c.slug}
            label={c.name}
            count={c.count}
            onClick={() => setParam("category", c.slug)}
          />
        ))}
      </div>

      {/* sort + price + count — desktop */}
      <div className="hidden flex-wrap items-center gap-3 sm:flex">
        <Select
          label="Sort"
          value={activeSort}
          options={SORTS}
          onChange={(v) => setParam("sort", v === "featured" ? "" : v)}
        />
        <Select
          label="Price"
          value={activePrice}
          options={PRICES}
          onChange={(v) => setParam("price", v)}
        />
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-sm font-medium text-clay-600 underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-sm text-husk-soft">
          {total} {total === 1 ? "variety" : "varieties"}
        </span>
      </div>

      {/* result count + reset — mobile */}
      <div className="flex items-center justify-between text-[0.72rem] text-husk-soft sm:hidden">
        <span>
          {total} {total === 1 ? "variety" : "varieties"}
          {activeSort !== "featured" && (
            <span className="text-husk-soft/70">
              {" · "}
              {SORTS.find((s) => s.value === activeSort)?.label}
            </span>
          )}
        </span>
        {hasFilters && (
          <button onClick={clearAll} className="font-medium text-clay-600 underline underline-offset-2">
            Clear all
          </button>
        )}
      </div>

      {/* ── mobile filter sheet ── */}
      {mounted && createPortal(
      <div
        className={cn(
          "fixed inset-0 z-[58] sm:hidden",
          sheet ? "" : "pointer-events-none",
        )}
        aria-hidden={!sheet}
      >
        <button
          tabIndex={-1}
          aria-label="Close filters"
          onClick={() => setSheet(false)}
          className={cn(
            "absolute inset-0 h-full w-full cursor-default bg-husk/40 transition-opacity duration-300",
            sheet ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          role="dialog"
          aria-modal={sheet}
          aria-label="Filter and sort"
          className={cn(
            "absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-husk/10 bg-rice-50 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-20px_50px_-20px_rgba(34,31,23,0.45)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            sheet ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="px-5 pt-2.5">
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-husk/20" />

            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-husk">Filter &amp; sort</h2>
              <button
                onClick={() => setSheet(false)}
                aria-label="Close filters"
                className="-mr-1.5 rounded-full p-1.5 text-husk-soft transition-colors hover:bg-husk/8"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <SheetGroup label="Sort by">
              {SORTS.map((o) => (
                <SheetChip
                  key={o.value}
                  label={o.label}
                  active={activeSort === o.value}
                  onClick={() => setParam("sort", o.value === "featured" ? "" : o.value)}
                />
              ))}
            </SheetGroup>

            <SheetGroup label="Price per kg">
              {PRICES.map((o) => (
                <SheetChip
                  key={o.value || "any"}
                  label={o.label}
                  active={activePrice === o.value}
                  onClick={() => setParam("price", o.value)}
                />
              ))}
            </SheetGroup>

            <div className="mt-5 flex gap-2">
              <button
                onClick={clearAll}
                className="flex-1 rounded-full border border-husk/15 py-2.5 text-sm font-medium text-husk transition-colors active:bg-rice-200"
              >
                Reset
              </button>
              <button
                onClick={() => setSheet(false)}
                className="flex-[1.6] rounded-full bg-paddy-800 py-2.5 text-sm font-semibold text-rice-50 transition-colors active:bg-paddy-900"
              >
                Show {total} {total === 1 ? "result" : "results"}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body,
      )}
    </div>
  );
}

function CategoryPill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 snap-start whitespace-nowrap rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition-all duration-300 sm:px-4 sm:py-2 sm:text-sm",
        active
          ? "border-paddy-800 bg-paddy-800 text-rice-50"
          : "border-husk/15 text-husk hover:border-paddy-600",
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn("ml-1", active ? "text-rice-50/60" : "text-husk-soft/60")}>
          {count}
        </span>
      )}
    </button>
  );
}

function SheetGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-husk-soft">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function SheetChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition-colors",
        active
          ? "border-paddy-800 bg-paddy-800 text-rice-50"
          : "border-husk/15 bg-rice-100 text-husk",
      )}
    >
      {label}
    </button>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-full border border-husk/15 bg-rice-50 py-2 pl-4 pr-2 text-sm">
      <span className="text-husk-soft">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer rounded-full bg-transparent py-1 pr-1 font-medium text-husk outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
