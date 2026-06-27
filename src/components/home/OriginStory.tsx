"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { STORY } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function StepIcon({ i, className }: { i: number; className?: string }) {
  const paths = [
    // paddy field
    <g key="0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 26c4-3 8-3 12 0M4 22c4-3 8-3 12 0" transform="translate(8 4)" />
      <path d="M16 18V8M16 12c-3 0-4-2-4-4 3 0 4 2 4 4ZM16 12c3 0 4-2 4-4-3 0-4 2-4 4Z" />
    </g>,
    // harvest (sun + cut stalks)
    <g key="1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="9" r="3.2" />
      <path d="M12 3.5v-1M12 16v-1M5.5 9h-1M19.5 9h-1M7.3 4.3l-.7-.7M17.4 4.3l.7-.7" />
      <path d="M8 27c1-4 3-6 4-6s3 2 4 6" transform="translate(0 -6)" />
    </g>,
    // mill (roller)
    <g key="2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="5" y="8" width="14" height="8" rx="4" />
      <path d="M9 8V6M15 8V6M9 16v2M15 16v2M5 12H3M21 12h-2" />
    </g>,
    // pack (bag)
    <g key="3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M7 9h10l1 11H6L7 9Z" />
      <path d="M9 9V7c0-1.5 1-2.5 3-2.5S15 5.5 15 7v2" strokeLinecap="round" />
      <path d="M10 13.5h4" strokeLinecap="round" />
    </g>,
    // kitchen (pot + steam)
    <g key="4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M5 12h14M6 12l1 7c0 1 .8 1.8 1.8 1.8h6.4c1 0 1.8-.8 1.8-1.8l1-7" strokeLinejoin="round" />
      <path d="M4 12h16" />
      <path d="M10 8c-1-1 0-2 0-3M14 8c-1-1 0-2 0-3" />
    </g>,
  ];
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {paths[i] ?? paths[0]}
    </svg>
  );
}

export default function OriginStory() {
  const section = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  // Pre-size the section so the CSS-sticky panel has vertical room to scroll
  // through the full horizontal track. Runs synchronously before the browser's
  // post-hydration repaint; OriginStory is always below the fold on load so the
  // section expanding never registers as a viewport CLS event.
  useLayoutEffect(() => {
    const sectionEl = section.current;
    const trackEl = track.current;
    if (!sectionEl || !trackEl) return;

    const update = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (isDesktop) {
        const dist = trackEl.scrollWidth - window.innerWidth + 96;
        sectionEl.style.height = `${dist + window.innerHeight}px`;
      } else {
        sectionEl.style.height = "";
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useGSAP(
    () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const trackEl = track.current;
      if (!isDesktop || reduce || !trackEl) return;

      const getDistance = () => trackEl.scrollWidth - window.innerWidth + 96;

      gsap.to(trackEl, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${getDistance()}`,
          scrub: 1,
          // CSS sticky on the panel replaces GSAP pin — no pin-spacer injected,
          // no DOM change after SSR, CLS = 0.
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} className="bg-paper relative">
      <div
        ref={panel}
        className="flex min-h-[48vh] flex-col justify-center overflow-hidden py-12 sm:min-h-[60vh] sm:py-20 lg:sticky lg:top-0 lg:h-[100svh]"
      >
        <div className="mx-auto mb-5 w-full max-w-7xl px-5 sm:mb-10 sm:px-8">
          <p className="kicker mb-2 flex items-center gap-3 text-clay-500 sm:mb-4">
            <span className="h-px w-8 bg-clay-400/50" />
            Paddy field to plate
          </p>
          <h2 className="font-display text-[clamp(1.7rem,4.5vw,3.4rem)] font-medium text-husk">
            The journey of a single grain
          </h2>
        </div>

        {/* track: GSAP-driven on desktop, swipeable on mobile */}
        <div
          ref={track}
          className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-3 sm:gap-6 sm:px-8 sm:pb-4 lg:overflow-visible lg:px-[max(2rem,calc((100vw-80rem)/2))]"
        >
          {STORY.map((step, i) => (
            <article
              key={step.n}
              className="group relative flex w-[72vw] shrink-0 snap-start flex-col rounded-2xl border border-husk/10 bg-rice-50 p-5 shadow-[0_20px_50px_-34px_rgba(34,31,23,0.6)] transition-colors duration-500 hover:border-clay-400/40 sm:w-[60vw] sm:rounded-3xl sm:p-8 md:w-[24rem]"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl text-rice-300 sm:text-5xl">{step.n}</span>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-paddy-800 text-harvest-300 transition-transform duration-500 group-hover:-rotate-6 sm:h-14 sm:w-14">
                  <StepIcon i={i} className="h-5 w-5 sm:h-7 sm:w-7" />
                </span>
              </div>
              <p className="mt-3 font-[var(--font-sinhala)] text-sm text-clay-500 sm:mt-6 sm:text-lg">
                {step.sinhala}
              </p>
              <h3 className="mt-1 font-display text-lg text-husk sm:text-2xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-husk-soft sm:mt-3 sm:text-[0.96rem]">
                {step.body}
              </p>
              {i < STORY.length - 1 && (
                <span className="absolute -right-3 top-1/2 hidden h-px w-6 bg-clay-400/40 lg:block" />
              )}
            </article>
          ))}

          {/* closing flourish */}
          <div className="hidden w-[20rem] shrink-0 flex-col justify-center px-4 lg:flex">
            <p className="font-display text-3xl italic text-paddy-700">
              …and onto your table.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
