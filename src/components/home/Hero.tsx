"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Button from "@/components/ui/Button";
import HeroSearch from "@/components/home/HeroSearch";
import {
  getSkyState,
  getPhotoMix,
  type SkyState,
  type PhotoMix,
} from "@/lib/skyCycle";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Golden pollen / dust motes that catch the light by day. */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 61) % 100,
  bottom: (i * 37) % 46,
  delay: (i % 8) * 1.1,
  dur: 9 + (i % 5) * 2.5,
  size: 2 + (i % 3),
}));

/** Deterministic star field in the upper sky — no hydration mismatch. */
const STARS = Array.from({ length: 50 }, (_, i) => ({
  left: (i * 97.13) % 100,
  top: ((i * 53.7) % 50) + 2,
  size: 1 + (i % 3) * 0.7,
  delay: (i % 9) * 0.6,
  dur: 2.6 + (i % 5) * 1.1,
}));

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  // Time-driven sky. First paint uses a neutral default so SSR/CSR agree;
  // the real Sri Lankan time is applied right after mount and every minute.
  const [sky, setSky] = useState<SkyState>(() =>
    getSkyState(new Date(2026, 0, 1, 9, 0)),
  );
  const [mix, setMix] = useState<PhotoMix>(() =>
    getPhotoMix(new Date(2026, 0, 1, 9, 0)),
  );
  // Snap to the real time on first paint (no sliding sun/moon path on load);
  // only enable the smooth transitions afterwards for the minute-by-minute drift.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setSky(getSkyState(now));
      setMix(getPhotoMix(now));
    };
    tick();
    const raf = requestAnimationFrame(() => setReady(true));
    const id = window.setInterval(tick, 60_000);
    return () => {
      window.clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, []);
  const move = ready
    ? "transition-[left,top,opacity] duration-[2500ms] ease-linear"
    : "";
  const fade = ready ? "transition-opacity duration-[2500ms] ease-linear" : "";

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

      // slow Ken Burns drift on the photo — keeps the scene alive
      gsap.to("[data-kenburns]", {
        scale: 1.1,
        xPercent: -2.5,
        yPercent: -2,
        duration: 26,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

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
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden bg-paddy-950"
    >
      {/* ---- background photos (4-way time-of-day crossfade + Ken Burns) ---- */}
      <div data-depth="8" className="absolute inset-0 overflow-hidden">
        <div
          data-kenburns
          className="absolute inset-0 will-change-transform transition-[filter] duration-[2500ms] ease-linear"
          style={{ filter: sky.photoFilter }}
        >
          {(
            [
              ["/hero-morning.webp", mix.morning],
              ["/hero-noon.webp", mix.noon],
              ["/hero-evening.webp", mix.evening],
              ["/hero-night.webp", mix.night],
            ] as const
          ).map(([src, opacity], i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover ${fade}`}
              style={{ opacity }}
              aria-hidden
              fetchPriority={i === 0 ? "high" : "auto"}
            />
          ))}
        </div>
      </div>

      {/* ---- left-side text-area blur: fades toward right + bottom ---- */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] backdrop-blur-[8px]"
        style={{
          maskImage:
            "linear-gradient(to right, #000 0%, #000 28%, transparent 58%), linear-gradient(to bottom, #000 0%, #000 30%, transparent 68%)",
          maskComposite: "intersect",
          WebkitMaskImage:
            "linear-gradient(to right, #000 0%, #000 28%, transparent 58%), linear-gradient(to bottom, #000 0%, #000 30%, transparent 68%)",
          WebkitMaskComposite: "source-in",
        }}
        aria-hidden
      />

      {/* ---- warm golden grade (soft-light, peaks at sunrise/sunset) ---- */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-[2500ms] ease-linear"
        style={{
          opacity: sky.warmOpacity,
          mixBlendMode: "soft-light",
          background:
            "linear-gradient(180deg, #ffe0a8 0%, #ff9e4d 52%, #ff7a33 100%)",
        }}
        aria-hidden
      />

      {/* ---- night grade (deep-navy multiply brings on the dark) ---- */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-[2500ms] ease-linear"
        style={{
          opacity: sky.nightOpacity,
          mixBlendMode: "multiply",
          background:
            "linear-gradient(180deg, #060c22 0%, #0d1736 58%, #182747 100%)",
        }}
        aria-hidden
      />

      {/* ---- stars (sky region, fade in after dusk) ---- */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[58%] transition-opacity duration-[2500ms] ease-linear"
        style={{ opacity: sky.starOpacity }}
        aria-hidden
      >
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-rice-50"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ---- moonlight cast into the scene (screen blend) ---- */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-[2500ms] ease-linear"
        style={{
          opacity: sky.moonBloom,
          mixBlendMode: "screen",
          background: `radial-gradient(60vh 60vh at ${sky.moonX}% ${sky.moonY}%, rgba(150,172,230,0.85) 0%, rgba(120,140,200,0.25) 38%, transparent 70%)`,
        }}
        aria-hidden
      />

      {/* ---- sunlight cast into the scene (screen blend) ---- */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-[2500ms] ease-linear"
        style={{
          opacity: sky.sunBloom,
          mixBlendMode: "screen",
          background: `radial-gradient(70vh 70vh at ${sky.sunX}% ${sky.sunY}%, ${sky.glow} 0%, rgba(255,200,120,0.28) 36%, transparent 68%)`,
        }}
        aria-hidden
      />

      {/* ---- moon ---- */}
      <div
        className={`pointer-events-none absolute z-[12] -translate-x-1/2 -translate-y-1/2 ${move}`}
        style={{ left: `${sky.moonX}%`, top: `${sky.moonY}%`, opacity: sky.moonOpacity }}
        aria-hidden
      >
        <div className="relative h-[11vh] w-[11vh] min-h-[58px] min-w-[58px]">
          {/* cool halo */}
          <div
            className="absolute left-1/2 top-1/2 h-[300%] w-[300%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle, rgba(205,216,255,0.5) 0%, rgba(205,216,255,0.12) 42%, transparent 70%)" }}
          />
          {/* realistic moon */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/moon.png"
            alt=""
            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_0_10px_rgba(200,214,255,0.45)]"
            aria-hidden
          />
        </div>
      </div>

      {/* ---- sun (disc + bloom) ---- */}
      <div
        className={`pointer-events-none absolute z-[12] -translate-x-1/2 -translate-y-1/2 ${move}`}
        style={{ left: `${sky.sunX}%`, top: `${sky.sunY}%`, opacity: sky.sunOpacity }}
        aria-hidden
      >
        <div className="relative h-[12vh] w-[12vh] min-h-[68px] min-w-[68px]">
          {/* broad haze (breathes) */}
          <div
            className="absolute left-1/2 top-1/2 h-[440%] w-[440%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl animate-[glowPulse_6s_ease-in-out_infinite]"
            style={{ background: `radial-gradient(circle, ${sky.glow} 0%, transparent 62%)`, opacity: 0.55 }}
          />
          {/* inner glow (tints with the hour) */}
          <div
            className="absolute left-1/2 top-1/2 h-[210%] w-[210%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
            style={{ background: `radial-gradient(circle, ${sky.glow} 0%, transparent 65%)`, opacity: 0.5 }}
          />
          {/* realistic sun orb */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sun.svg"
            alt=""
            className="absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2"
            aria-hidden
          />
        </div>
      </div>



      {/* ---- floating golden dust ---- */}
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
              opacity: 0.5 + sky.sunOpacity * 0.4,
              animation: `float-grain ${p.dur}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ---- cinematic colour grade: deep paddy-green framing the headline ---- */}
      {/* filmic green split-tone in the shadows (left → gold right) — fades out
          below the headline so the rating + search sit on the clean photo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          mixBlendMode: "multiply",
          opacity: 0.6,
          background:
            "linear-gradient(108deg, #16280f 0%, #1f3417 34%, rgba(40,54,31,0) 60%)",
          maskImage: "linear-gradient(180deg, #000 0%, #000 38%, transparent 62%)",
          WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 38%, transparent 62%)",
        }}
        aria-hidden
      />
      {/* deep green anchored at the top-left corner (matches reference) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 115% at 0% 0%, rgba(10,20,9,0.8) 0%, rgba(16,28,14,0.32) 28%, transparent 54%)",
        }}
        aria-hidden
      />
      {/* left text-column wash — also fades out toward the lower content */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(11,22,10,0.72) 0%, rgba(17,29,15,0.4) 26%, rgba(26,38,22,0.12) 46%, transparent 58%)",
          maskImage: "linear-gradient(180deg, #000 0%, #000 42%, transparent 66%)",
          WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 42%, transparent 66%)",
        }}
        aria-hidden
      />

      {/* ---- content ---- */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-5 pb-28 pt-35 sm:px-8">
        <div className="max-w-2xl">
          <h1
            data-hero-in
            className="font-display text-[clamp(2.2rem,6vw,4.6rem)] font-medium leading-[0.98] text-rice-50"
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
