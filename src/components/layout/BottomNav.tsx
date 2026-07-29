"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useWishlist } from "@/providers/WishlistProvider";
import { cn } from "@/lib/utils";
import { VscSearchSparkle } from "react-icons/vsc";

/* ------------------------------------------------------------ icons ------ */
const Icon = {
  Home: (p: { className?: string; active?: boolean }) => (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <path
        d="M4 10.6 12 4l8 6.6V19a1.4 1.4 0 0 1-1.4 1.4h-3.2v-5.2H8.6v5.2H5.4A1.4 1.4 0 0 1 4 19v-8.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill={p.active ? "currentColor" : "none"}
        fillOpacity={p.active ? 0.14 : 0}
      />
    </svg>
  ),
  Store: (p: { className?: string; active?: boolean }) => (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <path d="M4 9.5 5 4h14l1 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M5 9.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={p.active ? "currentColor" : "none"}
        fillOpacity={p.active ? 0.14 : 0}
      />
      <path d="M10 20v-4.5a2 2 0 0 1 2-2 2 2 0 0 1 2 2V20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  User: (p: { className?: string; active?: boolean }) => (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <circle
        cx="12"
        cy="8"
        r="3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        fill={p.active ? "currentColor" : "none"}
        fillOpacity={p.active ? 0.16 : 0}
      />
      <path d="M5.5 19.5c1.2-3.4 4-5 6.5-5s5.3 1.6 6.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Heart: (p: { className?: string; active?: boolean }) => (
    <svg viewBox="0 0 20 20" fill="none" className={p.className} aria-hidden>
      <path
        d="M10 17.5s-7-4.5-7-9a3.5 3.5 0 0 1 7 0 3.5 3.5 0 0 1 7 0c0 4.5-7 9-7 9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill={p.active ? "currentColor" : "none"}
        fillOpacity={p.active ? 0.18 : 0}
      />
    </svg>
  ),
};

/**
 * Mobile-only bottom navigation. Renders a flow spacer alongside the fixed bar
 * so page content and the footer are never hidden behind it.
 *
 * z-[52] deliberately sits above FloatingActions (z-50) but below the header
 * (z-[55]), the shop filter sheet (z-[58]), the drawers (z-[60]) and search
 * (z-[70]) — so any of those correctly covers the bar when open.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { count: wishlistCount, openWishlist } = useWishlist();
  const { status } = useSession();

  const signedIn = status === "authenticated";
  const authLoading = status === "loading";

  const isHome = pathname === "/";
  const isShop = pathname.startsWith("/shop");
  const isAccount = pathname.startsWith("/account") || pathname.startsWith("/login") || pathname.startsWith("/register");
  const isFinder = pathname.startsWith("/rice-finder");

  return (
    <>
      {/* keeps the footer clear of the fixed bar; --bottom-nav-h is 0 from lg up */}
      <div aria-hidden style={{ height: "var(--bottom-nav-h)" }} />

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-[52] border-t border-husk/10 bg-rice-100/92 shadow-[0_-12px_34px_-26px_rgba(34,31,23,0.9)] backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch pb-[env(safe-area-inset-bottom)]">
          <Item href="/" label="Home" active={isHome}>
            <Icon.Home className="h-[1.3rem] w-[1.3rem]" active={isHome} />
          </Item>

          <Item href="/shop" label="Shop" active={isShop}>
            <Icon.Store className="h-[1.3rem] w-[1.3rem]" active={isShop} />
          </Item>

          <Item
            href={signedIn ? "/account" : "/login"}
            label={signedIn ? "Account" : "Login"}
            labelLoading={authLoading}
            active={isAccount}
          >
            <Icon.User className="h-[1.3rem] w-[1.3rem]" active={isAccount} />
          </Item>

          <Item
            onClick={openWishlist}
            label="Favourite"
            active={false}
            badge={wishlistCount}
            ariaLabel={`Open favourites, ${wishlistCount} items`}
          >
            <Icon.Heart className="h-[1.3rem] w-[1.3rem]" active={wishlistCount > 0} />
          </Item>

          <Item href="/rice-finder" label="AI Finder" active={isFinder} sparkle>
            <VscSearchSparkle className="text-[1.3rem]" aria-hidden />
          </Item>
        </ul>
      </nav>
    </>
  );
}

function Item({
  href,
  onClick,
  label,
  labelLoading,
  active,
  badge,
  sparkle,
  ariaLabel,
  children,
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  labelLoading?: boolean;
  active: boolean;
  badge?: number;
  sparkle?: boolean;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  const inner = (
    <>
      {/* active indicator — a short harvest-gold grain line along the top edge */}
      <span
        className={cn(
          "pointer-events-none absolute left-1/2 top-0 h-[2px] -translate-x-1/2 rounded-full bg-harvest-500 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          active ? "w-7 opacity-100" : "w-0 opacity-0",
        )}
      />

      <span className="relative">
        {children}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -right-2 -top-1.5 grid h-[0.95rem] min-w-[0.95rem] place-items-center rounded-full bg-clay-500 px-1 text-[0.58rem] font-bold text-rice-50">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>

      {labelLoading ? (
        <span className="mt-1 block h-[0.62rem] w-9 rounded-full shimmer" aria-hidden />
      ) : (
        <span className={cn("mt-1 block text-[0.62rem] leading-none tracking-wide", active && "font-semibold")}>
          {label}
        </span>
      )}
    </>
  );

  const cls = cn(
    "relative flex h-[4.25rem] w-full flex-col items-center justify-center gap-0 transition-colors duration-300",
    active ? "text-paddy-700" : "text-husk-soft active:text-husk",
    sparkle && !active && "text-paddy-800",
  );

  return (
    <li className="flex-1">
      {href ? (
        <Link href={href} aria-label={ariaLabel ?? label} aria-current={active ? "page" : undefined} className={cls}>
          {inner}
        </Link>
      ) : (
        <button type="button" onClick={onClick} aria-label={ariaLabel ?? label} className={cls}>
          {inner}
        </button>
      )}
    </li>
  );
}
