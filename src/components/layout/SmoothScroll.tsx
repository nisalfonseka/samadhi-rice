"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/providers/CartProvider";

gsap.registerPlugin(ScrollTrigger);

/**
 * Wires Lenis smooth scrolling into the GSAP ticker so ScrollTrigger and the
 * inertial scroll stay perfectly in sync. Respects reduced-motion preferences.
 * Also hosts the cart context so the whole app shares one provider tree.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onRaf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add("lenis");

    return () => {
      gsap.ticker.remove(onRaf);
      lenis.destroy();
      document.documentElement.classList.remove("lenis");
    };
  }, []);

  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
