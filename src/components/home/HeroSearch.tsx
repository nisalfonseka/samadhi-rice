"use client";

import { useSearch } from "@/providers/SearchProvider";

export default function HeroSearch() {
  const { openSearch } = useSearch();

  return (
    <button
      onClick={() => openSearch()}
      aria-label="Search products"
      className="group mt-8 flex w-full max-w-[30rem] items-center gap-3 rounded-2xl border border-rice-50/18 bg-white/[0.07] px-4 py-3 text-left backdrop-blur-sm transition-all duration-300 hover:border-rice-50/36 hover:bg-white/[0.12]"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0 text-rice-100/50"
        fill="none"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.65" />
        <path
          d="m20 20-3.2-3.2"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex-1 text-[0.88rem] text-rice-100/45">
        Suwandel, Kalu Heenati, red rice…
      </span>
      <kbd className="hidden items-center gap-px rounded-lg border border-rice-100/14 px-1.5 py-0.5 font-mono text-[0.58rem] text-rice-100/35 sm:flex">
        <span className="text-[0.7rem]">⌘</span>K
      </kbd>
    </button>
  );
}
