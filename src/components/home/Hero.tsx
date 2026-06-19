"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Button from "@/components/ui/Button";
import HeroSearch from "@/components/home/HeroSearch";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 61) % 100,
  bottom: (i * 37) % 40,
  delay: (i % 8) * 1.1,
  dur: 9 + (i % 5) * 2.5,
  size: 2 + (i % 3),
}));

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // entrance
      gsap.from("[data-hero-in]", {
        y: 34,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.15,
      });

      if (reduce) return;

      // scroll parallax — each layer drifts at its own depth
      gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth || "0");
        gsap.to(layer, {
          yPercent: depth,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      // mouse parallax
      const layers = gsap.utils.toArray<HTMLElement>("[data-mouse]");
      const setters = layers.map((l) => ({
        x: gsap.quickTo(l, "x", { duration: 0.8, ease: "power3" }),
        y: gsap.quickTo(l, "y", { duration: 0.8, ease: "power3" }),
        m: parseFloat(l.dataset.mouse || "0"),
      }));
      const onMove = (e: PointerEvent) => {
        const cx = (e.clientX / window.innerWidth - 0.5) * 2;
        const cy = (e.clientY / window.innerHeight - 0.5) * 2;
        setters.forEach((s) => {
          s.x(cx * s.m);
          s.y(cy * s.m);
        });
      };
      window.addEventListener("pointermove", onMove);
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root },
  );

  return (
    <section
      id="site-hero"
      ref={root}
      className="relative mt-[25px] flex min-h-[100svh] w-full items-center overflow-hidden bg-paddy-950"
    >
      {/* ---- sky / dawn wash ---- */}
      <div
        data-depth="12"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #15220f 0%, #1d2916 26%, #314026 52%, #6b6a37 76%, #b9933f 100%)",
        }}
      />
      {/* sun haze */}
      <div
        data-depth="18"
        data-mouse="14"
        className="absolute left-[18%] top-[42%] h-[42vh] w-[42vh] -translate-x-1/2 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(243,222,160,0.85) 0%, rgba(216,184,99,0.35) 38%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,transparent_40%,rgba(18,27,13,0.85)_100%)]" />

      {/* ---- distant misty hills ---- */}
      <div data-depth="26" data-mouse="8" className="absolute inset-x-0 bottom-[34%] h-[26vh]">
        <svg viewBox="0 0 1440 240" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
          <path
            d="M0 240V120c120-30 220 20 360 10s260-60 420-50 240 60 380 44 180-40 280-30v176Z"
            fill="#3a4a2b"
            opacity="0.55"
          />
        </svg>
      </div>

      {/* ---- paddy terraces (back) ---- */}
      <div data-depth="40" className="absolute inset-x-0 bottom-[16%] h-[34vh]">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
          <path
            d="M0 320V92c160 26 300-20 520-20s420 56 620 40 220-44 300-40v248Z"
            fill="#445b30"
          />
          <path
            d="M0 320V150c180 18 320-8 540 6s420 40 620 26 200-30 280-28v194Z"
            fill="#3a4d28"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* ---- paddy terraces (front) with water sheen ---- */}
      <div data-depth="58" data-mouse="-6" className="absolute inset-x-0 bottom-0 h-[30vh]">
        <svg viewBox="0 0 1440 300" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
          <path d="M0 300V120c220 40 420 6 720 6s500 28 720-2v176Z" fill="#2c3c1d" />
          <path
            d="M0 300V160c220 30 420 2 720 2s500 22 720-6v144Z"
            fill="#243117"
          />
          {/* row glints */}
          <g stroke="#9bb06f" strokeWidth="1" opacity="0.18">
            <path d="M120 232c360-26 840-26 1200 0" fill="none" />
            <path d="M80 262c380-22 900-22 1280 0" fill="none" />
          </g>
        </svg>
      </div>

      {/* ---- foreground rice stalks ---- */}
      <div
        data-depth="74"
        data-mouse="-12"
        className="absolute inset-x-0 bottom-0 h-[24vh] origin-bottom"
      >
        <div className="absolute inset-0 origin-bottom animate-[sway_7s_ease-in-out_infinite]">
          <svg viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax meet" className="h-full w-full" aria-hidden>
            <g fill="#141f0c">
              {Array.from({ length: 26 }).map((_, i) => {
                const x = 20 + i * 55 + (i % 3) * 10;
                return (
                  <g key={i} transform={`translate(${x} 260)`}>
                    <path d="M0 0 C -3 -70 -6 -120 -2 -180" stroke="#141f0c" strokeWidth="3" fill="none" />
                    <path d="M-2 -180c10 6 10 22 0 30-10-8-10-24 0-30Z" />
                    <path d="M-2 -150c14-2 22 6 24 18-12 2-22-4-24-18Z" />
                    <path d="M-2 -150c-14-2-22 6-24 18 12 2 22-4 24-18Z" />
                    <path d="M-2 -120c12-2 20 6 22 16-11 2-20-4-22-16Z" />
                    <path d="M-2 -120c-12-2-20 6-22 16 11 2 20-4 22-16Z" />
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* ---- floating grain dust ---- */}
      <div className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-harvest-200"
            style={{
              left: `${p.left}%`,
              bottom: `${p.bottom}%`,
              width: p.size,
              height: p.size,
              animation: `float-grain ${p.dur}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ---- content ---- */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-5 pb-28 pt-28 sm:px-8">
        <div className="max-w-2xl">
          <h1
            data-hero-in
            className="font-display text-[clamp(2.6rem,7vw,5.4rem)] font-medium leading-[0.98] text-rice-50"
          >
            From the paddy field
            <br />
            to your <span className="italic text-harvest-300">plate.</span>
          </h1>

          <p
            data-hero-in
            className="mt-7 max-w-xl text-[1.05rem] leading-relaxed text-rice-100/80"
          >
            Single-origin Suwandel, Kalu Heenati and red raw rice — grown in
            family fields, milled fresh the day it ships, and carried to your
            kitchen with nothing lost in between.
          </p>

          <div data-hero-in className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="/shop" variant="gold" size="lg">
              Shop the harvest
              <span aria-hidden className="transition-transform duration-300 group-hover/btn:translate-x-1">
                →
              </span>
            </Button>
            <Button href="/about" variant="outline" size="lg" className="text-rice-50">
              Our journey
            </Button>
          </div>

          <div
            data-hero-in
            className="mt-10 flex items-center gap-5 text-sm text-rice-100/70"
          >
            <span className="flex items-center gap-1.5 text-harvest-300">
              {"★★★★★"}
            </span>
            <span>
              <span className="font-semibold text-rice-50">4.9</span> · loved by
              12,000+ Sri Lankan kitchens
            </span>
          </div>

          {/* ---- search bar ---- */}
          <div data-hero-in>
            <HeroSearch />
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-rice-100/60">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[0.65rem] uppercase tracking-[0.3em]">Scroll</span>
          <span className="flex h-9 w-5 items-start justify-center rounded-full border border-rice-100/40 p-1">
            <span className="h-2 w-1 rounded-full bg-harvest-300 animate-bounce" />
          </span>
        </div>
      </div>
    </section>
  );
}
