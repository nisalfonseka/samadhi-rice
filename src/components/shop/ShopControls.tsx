"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
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

  const activeCategory = sp.get("category") ?? "";
  const activeSort = sp.get("sort") ?? "featured";
  const activePrice = sp.get("price") ?? "";
  const hasFilters = Boolean(activeCategory || activePrice || sp.get("q"));

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

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      if ((sp.get("q") ?? "") !== q) setParam("q", q);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-col gap-6">
      {/* search */}
      <div className="relative max-w-md">
        <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-4 top-1/2 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-husk-soft" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
          <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Suwandel, red rice, biryani…"
          className="w-full rounded-full border border-husk/15 bg-rice-50 py-3 pl-11 pr-4 text-sm text-husk outline-none transition-colors placeholder:text-husk-soft/70 focus:border-paddy-600"
        />
      </div>

      {/* category pills */}
      <div className="flex flex-wrap gap-2">
        <CategoryPill
          active={!activeCategory}
          label="All rice"
          onClick={() => setParam("category", "")}
        />
        {categories.map((c) => (
          <CategoryPill
            key={c.slug}
            active={activeCategory === c.slug}
            label={`${c.name} (${c.count})`}
            onClick={() => setParam("category", c.slug)}
          />
        ))}
      </div>

      {/* sort + price + count */}
      <div className="flex flex-wrap items-center gap-3">
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
            onClick={() => {
              setQ("");
              startTransition(() => router.push(pathname, { scroll: false }));
            }}
            className="text-sm font-medium text-clay-600 underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-sm text-husk-soft">
          {total} {total === 1 ? "variety" : "varieties"}
        </span>
      </div>
    </div>
  );
}

function CategoryPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
        active
          ? "border-paddy-800 bg-paddy-800 text-rice-50"
          : "border-husk/15 text-husk hover:border-paddy-600",
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
