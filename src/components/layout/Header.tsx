"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { useCart } from "@/providers/CartProvider";
import { NAV_LINKS } from "@/lib/data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------ icons ------ */
const Icon = {
  Search: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  User: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 19.5c1.2-3.4 4-5 6.5-5s5.3 1.6 6.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Bag: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <path d="M6 8h12l-1 11.5a1.5 1.5 0 0 1-1.5 1.4H8.5A1.5 1.5 0 0 1 7 19.5L6 8Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Menu: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  Close: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
};

const ANNOUNCEMENTS = [
  "Fresh Maha harvest just milled",
  "Free delivery in Colombo over Rs. 7,500",
  "Rs. 500 off your first order — code SAMADHI500",
  "Milled to order · never warehoused",
];

export default function Header() {
  const { count, lastAddedAt, openCart } = useCart();
  const [overHero, setOverHero] = useState(true);
  const [compact, setCompact] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const firstAdd = useRef(true);

  // colour theme: transparent + light text while over the dark hero
  useEffect(() => {
    const hero = document.getElementById("site-hero");
    if (!hero) {
      setOverHero(false);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => setOverHero(entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 },
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  // shrink + scroll-progress line
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setCompact(y > 40);
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(h > 0 ? Math.min(1, y / h) : 0);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // bump the cart badge whenever something is added
  useEffect(() => {
    if (firstAdd.current) {
      firstAdd.current = false;
      return;
    }
    setBump(true);
    const t = setTimeout(() => setBump(false), 600);
    return () => clearTimeout(t);
  }, [lastAddedAt]);

  // lock scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const light = overHero && !open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* announcement marquee */}
      <div
        className={cn(
          "overflow-hidden border-b border-white/10 bg-paddy-950 text-rice-100 transition-[height,opacity] duration-500",
          compact ? "h-0 opacity-0" : "h-9 opacity-100",
        )}
      >
        <div className="flex h-9 items-center">
          <div className="flex shrink-0 animate-[marquee_32s_linear_infinite] items-center gap-3 whitespace-nowrap pr-3">
            {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((a, i) => (
              <span key={i} className="flex items-center gap-3 text-[0.72rem] tracking-wide">
                <span className="text-harvest-400">✺</span>
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* main bar */}
      <div
        className={cn(
          "relative transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          light
            ? "bg-transparent text-rice-50"
            : "bg-rice-100/85 text-husk shadow-[0_1px_0_rgba(34,31,23,0.08),0_18px_40px_-30px_rgba(34,31,23,0.6)] backdrop-blur-xl",
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 transition-all duration-500 sm:px-8",
            compact ? "h-16" : "h-20",
          )}
        >
          <Link href="/" aria-label="SamadhiRice.lk home" className="z-10">
            <Logo />
          </Link>

          {/* desktop nav */}
          <nav className="hidden items-center gap-9 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group relative py-1 text-[0.92rem] font-medium tracking-wide"
              >
                {l.label}
                <span className="pointer-events-none absolute -bottom-0.5 left-0 h-px w-0 bg-harvest-500 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* actions */}
          <div className="flex items-center gap-1.5">
            <button
              aria-label="Search"
              className="hidden rounded-full p-2.5 transition-colors hover:bg-current/[0.08] sm:inline-flex"
            >
              <Icon.Search className="h-[1.15rem] w-[1.15rem]" />
            </button>
            <Link
              href="/account"
              aria-label="Account"
              className="hidden rounded-full p-2.5 transition-colors hover:bg-current/[0.08] sm:inline-flex"
            >
              <Icon.User className="h-[1.15rem] w-[1.15rem]" />
            </Link>
            <button
              onClick={openCart}
              aria-label={`Open cart, ${count} items`}
              className="relative rounded-full p-2.5 transition-colors hover:bg-current/[0.08]"
            >
              <Icon.Bag className="h-[1.15rem] w-[1.15rem]" />
              <span
                className={cn(
                  "absolute -right-0 -top-0 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-harvest-500 px-1 text-[0.65rem] font-bold text-paddy-950 transition-transform duration-300",
                  count > 0 ? "scale-100" : "scale-0",
                  bump && "animate-[bump_0.55s_cubic-bezier(0.16,1,0.3,1)]",
                )}
              >
                {count}
              </span>
            </button>

            <button
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
              className="ml-1 rounded-full p-2.5 transition-colors hover:bg-current/[0.08] lg:hidden"
            >
              {open ? <Icon.Close className="h-5 w-5" /> : <Icon.Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* scroll-progress grain line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-current/10">
          <div
            className="h-full origin-left bg-harvest-500 transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* mobile overlay menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 origin-top bg-rice-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="bg-paper flex h-full flex-col px-6 pb-10 pt-28">
          <nav className="flex flex-1 flex-col justify-center gap-1">
            {NAV_LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "border-b border-husk/10 py-4 font-display text-3xl text-husk transition-all duration-500",
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
                style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
              >
                <span className="text-harvest-500/70 text-base align-middle mr-3">
                  0{i + 1}
                </span>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-sm text-husk-soft">
            <Link href="/account" onClick={() => setOpen(false)}>Account</Link>
            <span className="opacity-30">·</span>
            <button
              onClick={() => {
                setOpen(false);
                openCart();
              }}
            >
              Cart ({count})
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
