"use client";

import { usePathname } from "next/navigation";

/** Hides storefront chrome (header, footer, cart, floating actions) on /admin. */
export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
