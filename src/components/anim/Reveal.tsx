"use client";

import { useEffect, useRef, type ElementType, type ReactNode, type Ref } from "react";
import gsap from "gsap";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** vertical travel distance in px */
  y?: number;
  delay?: number;
  /** when > 0, animates the element's direct children in sequence */
  stagger?: number;
};

/**
 * Scroll-triggered entrance driven by IntersectionObserver (decoupled from
 * Lenis/ScrollTrigger so it fires reliably). Single element by default; pass
 * `stagger` to sequence direct children.
 */
export default function Reveal({
  children,
  className,
  as: Tag = "div",
  y = 30,
  delay = 0,
  stagger = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets: Element[] =
      stagger > 0 ? Array.from(el.children) : [el];
    gsap.set(targets, { opacity: 0, y });

    let played = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (played) return;
        if (entries.some((e) => e.isIntersecting)) {
          played = true;
          gsap.to(targets, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            delay,
            stagger,
            clearProps: "transform",
          });
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);

    return () => io.disconnect();
  }, [y, delay, stagger]);

  return (
    <Tag ref={ref as Ref<HTMLElement>} className={className}>
      {children}
    </Tag>
  );
}
