"use client";

import { usePathname } from "next/navigation";

/** Hides storefront chrome (header, footer, cart, floating actions) on /admin. */
export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}

/** Hides footer chrome (footer, floating actions, cart, search) on /admin and /rice-finder. */
export function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/rice-finder")) return null;
  return <>{children}</>;
}
