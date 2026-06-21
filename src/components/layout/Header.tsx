"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { useCart } from "@/providers/CartProvider";
import { useSearch } from "@/providers/SearchProvider";
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
  Phone: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  MapPin: (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <path d="M12 21C12 21 5 13.5 5 9a7 7 0 1 1 14 0c0 4.5-7 12-7 12Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
};

export default function Header({ hotline }: { hotline?: string }) {
  const { count, lastAddedAt, openCart } = useCart();
  const { openSearch } = useSearch();
  const pathname = usePathname();
  const [overHero, setOverHero] = useState(pathname === "/");
  const [compact, setCompact] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const firstAdd = useRef(true);

  // Enable transitions only after the first paint so CSS doesn't animate
  // from "no styles" to "styled", which flashes the opaque header colours.
  useEffect(() => {
    const id = requestAnimationFrame(() => setHydrated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // colour theme: transparent + light text while over the dark hero.
  // Synchronously check hero visibility on mount to avoid a cream flash
  // when the browser restores scroll position on refresh.
  useEffect(() => {
    const hero = document.getElementById("site-hero");
    if (!hero) {
      setOverHero(false);
      return;
    }

    // Immediate sync check — prevents flash before observer fires
    const rect = hero.getBoundingClientRect();
    const headerH = 72;
    setOverHero(rect.bottom > headerH && rect.top < window.innerHeight);

    const obs = new IntersectionObserver(
      ([entry]) => setOverHero(entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 },
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, [pathname]);

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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* ── top utility bar ── */}
      <div
        className={cn(
          "overflow-hidden",
          hydrated ? "transition-[height,opacity,background-color] duration-500" : "",
          light ? "bg-transparent text-rice-100" : "bg-paddy-700 text-rice-100",
          compact ? "h-0 opacity-0" : "h-9 opacity-100 border-b border-white/10",
        )}
      >
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-5 sm:px-8">

          {/* left — hotline */}
          {hotline ? (
            <a
              href={`tel:${hotline}`}
              className="flex shrink-0 items-center gap-1.5 text-[0.72rem] tracking-wide text-rice-100/80 transition-colors hover:text-harvest-300"
            >
              <Icon.Phone className="h-3 w-3 text-harvest-400" />
              {hotline}
            </a>
          ) : (
            <span />
          )}

          {/* right — Our Branches */}
          <Link
            href="/branches"
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border border-harvest-500/30 px-3 py-0.5 text-[0.7rem] font-medium tracking-wide transition-all hover:border-harvest-400 hover:text-harvest-300",
              isActive("/branches") ? "border-harvest-400 text-harvest-300" : "text-rice-100/75",
            )}
          >
            <Icon.MapPin className="h-3 w-3" />
            Our Branches
          </Link>
        </div>
      </div>

      {/* ── main bar ── */}
      <div
        className={cn(
          "relative",
          hydrated ? "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" : "",
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
            {NAV_LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "group relative py-1 text-[0.92rem] font-medium tracking-wide transition-colors duration-200",
                    active
                      ? light ? "text-harvest-300" : "text-paddy-700"
                      : "hover:opacity-80",
                  )}
                >
                  {l.label}
                  {/* underline — always visible when active, animates in on hover */}
                  <span
                    className={cn(
                      "pointer-events-none absolute -bottom-0.5 left-0 h-px bg-harvest-500 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      active ? "w-full" : "w-0 group-hover:w-full",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openSearch()}
              aria-label="Search products (⌘K)"
              title="Search (⌘K)"
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

      {/* ── mobile overlay menu ── */}
      <div
        className={cn(
          "fixed inset-0 z-40 origin-top bg-rice-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="bg-paper flex h-full flex-col px-6 pb-10 pt-28">
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute right-5 top-5 rounded-full p-2.5 text-husk transition-colors hover:bg-husk/10"
          >
            <Icon.Close className="h-6 w-6" />
          </button>
          <nav className="flex flex-1 flex-col justify-center gap-1">
            {[...NAV_LINKS, { label: "Our Branches", href: "/branches" }].map((l, i) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "border-b border-husk/10 py-4 font-display text-3xl transition-all duration-500",
                    active ? "text-paddy-700" : "text-husk",
                    open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                  )}
                  style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
                >
                  <span className={cn("text-base align-middle mr-3", active ? "text-paddy-500/70" : "text-harvest-500/70")}>
                    0{i + 1}
                  </span>
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex flex-wrap items-center gap-4 text-sm text-husk-soft">
            {hotline && (
              <>
                <a href={`tel:${hotline}`} className="flex items-center gap-1.5 hover:text-paddy-700">
                  <Icon.Phone className="h-3.5 w-3.5" />
                  {hotline}
                </a>
                <span className="opacity-30">·</span>
              </>
            )}
            <button onClick={() => { setOpen(false); openSearch(); }}>Search</button>
            <span className="opacity-30">·</span>
            <Link href="/account" onClick={() => setOpen(false)}>Account</Link>
            <span className="opacity-30">·</span>
            <button onClick={() => { setOpen(false); openCart(); }}>Cart ({count})</button>
          </div>
        </div>
      </div>
    </header>
  );
}
