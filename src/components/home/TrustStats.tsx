"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { STATS } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function TrustStats() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const nums = gsap.utils.toArray<HTMLElement>("[data-count]");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      nums.forEach((n) => {
        const end = parseFloat(n.dataset.count || "0");
        if (reduce) {
          n.textContent = String(end);
          return;
        }
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end,
          duration: 2,
          ease: "power2.out",
          snap: { v: 1 },
          scrollTrigger: { trigger: section.current, start: "top 78%", once: true },
          onUpdate: () => {
            n.textContent = Math.round(obj.v).toString();
          },
        });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} className="bg-field relative overflow-hidden py-14 text-rice-50 sm:py-28">
      {/* faint terrace lines */}
      <svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
        aria-hidden
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <path
            key={i}
            d={`M0 ${60 + i * 50}c240-24 480-24 720 0s480 24 720 0`}
            stroke="var(--color-harvest-300)"
            strokeWidth="1"
            fill="none"
          />
        ))}
      </svg>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="kicker mb-2 flex items-center gap-3 text-harvest-300 sm:mb-4">
            <span className="h-px w-8 bg-harvest-400/60" />
          </p>
          <h2 className="font-display text-[clamp(1.7rem,4.5vw,3.4rem)] font-medium text-rice-50">
            Since 2000
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-rice-100/75 sm:mt-5 sm:text-[1.02rem]">
            Our customers know that every bag of Samadhi Rice is made with care, and that our quality is consistent.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:mt-16 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="border-l border-rice-50/15 pl-3 sm:pl-5">
              <p className="font-display text-[clamp(1.8rem,5vw,4rem)] leading-none text-harvest-300">
                <span data-count={s.value}>0</span>
                {s.suffix}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-rice-100/70 sm:mt-3 sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
