"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/* ── paddy-field placeholder (no images) ── */
function PaddyPlaceholder({ index }: { index: number }) {
  const palettes = [
    ["#15220f", "#2c3c1d", "#445b30", "#6b7c45"],
    ["#1a1f0a", "#2e3818", "#435226", "#687840"],
    ["#0f1e14", "#243318", "#384d28", "#5c7040"],
  ];
  const g = palettes[index % palettes.length];
  const id = `sky-${index}`;
  return (
    <svg viewBox="0 0 480 320" className="h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={g[0]} />
          <stop offset="60%" stopColor={g[1]} />
          <stop offset="100%" stopColor={g[2]} />
        </linearGradient>
      </defs>
      <rect width="480" height="320" fill={`url(#${id})`} />
      <path d="M0 320V180c120 28 240-10 360 0s80 30 120 20V320Z" fill={g[1]} opacity="0.9" />
      <path d="M0 320V220c100 20 220-4 360 8s80 18 120 10V320Z" fill={g[2]} opacity="0.85" />
      <path d="M0 320V260c80 14 200 0 320 6s120 8 160 4V320Z" fill={g[3]} opacity="0.7" />
      {Array.from({ length: 12 }).map((_, i) => {
        const x = 20 + i * 40 + (i % 3) * 5;
        return (
          <g key={i} transform={`translate(${x} 320)`}>
            <path d="M0 0 C-2 -50 -4 -80 -1 -110" stroke={g[3]} strokeWidth="2" fill="none" />
            <ellipse cx="-1" cy="-110" rx="6" ry="12" fill={g[3]} opacity="0.7" />
          </g>
        );
      })}
      <circle cx="80" cy="100" r="50" fill="#b9933f" opacity="0.15" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M12.5 5 7.5 10l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BranchCarousel({
  images,
  name,
  index,
}: {
  images: string[];
  name: string;
  index: number;
}) {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  /* touch swipe */
  let touchStartX = 0;
  const onTouchStart = (e: React.TouchEvent) => { touchStartX = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) dx > 0 ? next() : prev();
  };

  /* ── no images ── */
  if (total === 0) {
    return (
      <div className="h-40 w-full overflow-hidden lg:h-full">
        <PaddyPlaceholder index={index} />
      </div>
    );
  }

  /* ── single image ── */
  if (total === 1) {
    return (
      <div className="h-40 w-full overflow-hidden lg:h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]} alt={`${name} branch`} className="h-full w-full object-cover" />
      </div>
    );
  }

  /* ── multiple images: main + thumbnail strip ──
     On desktop this fills the full card height.
     The flex-col layout gives the main image all remaining space
     and pins the thumbnail strip to a fixed 72px at the bottom.
  */
  return (
    <div
      className="flex h-52 w-full flex-col overflow-hidden lg:h-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* main image — flex-1 so it fills whatever height is left */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {/* slide strip */}
        <div
          className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((url, i) => (
            <div key={i} className="relative h-full w-full shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${name} — photo ${i + 1}`}
                className="h-full w-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        {/* prev / next arrows */}
        <button
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-2.5 top-1/2 z-10 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/55 active:scale-95"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={next}
          aria-label="Next photo"
          className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/55 active:scale-95"
        >
          <ChevronRight />
        </button>

        {/* counter */}
        <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-black/40 px-2 py-0.5 text-[0.65rem] font-medium text-white backdrop-blur-sm">
          {current + 1}/{total}
        </span>
      </div>

      {/* thumbnail strip — fixed 72px, scrollable if many images */}
      <div className="flex h-[72px] shrink-0 gap-px overflow-x-auto bg-black/5">
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`View photo ${i + 1}`}
            className={cn(
              "relative h-full shrink-0 overflow-hidden transition-opacity duration-200",
              /* equal width up to 5 thumbs, then fixed 80px */
              total <= 5 ? "flex-1" : "w-20",
              i === current ? "opacity-100 ring-2 ring-inset ring-harvest-400" : "opacity-55 hover:opacity-80",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
