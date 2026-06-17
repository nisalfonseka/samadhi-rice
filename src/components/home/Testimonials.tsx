"use client";

import { useRef, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { TESTIMONIALS } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function Testimonials() {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const [grabbing, setGrabbing] = useState(false);

  const onDown = (e: React.PointerEvent) => {
    const el = rail.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
    setGrabbing(true);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active || !rail.current) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    rail.current.scrollLeft = drag.current.startScroll - dx;
  };

  const end = () => {
    drag.current.active = false;
    setGrabbing(false);
  };

  const nudge = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section id="testimonials" className="bg-paper relative py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          kicker="From real kitchens"
          title="What Sri Lanka is saying"
          intro="Drag to read more. Every word below is from a verified order — no scripts, no stock smiles."
        />

        {/* drag controls */}
        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={() => nudge(-1)}
            aria-label="Previous testimonials"
            className="grid h-11 w-11 place-items-center rounded-full border border-husk/15 text-husk transition-colors hover:border-paddy-700 hover:bg-paddy-700 hover:text-rice-50"
          >
            ←
          </button>
          <button
            onClick={() => nudge(1)}
            aria-label="Next testimonials"
            className="grid h-11 w-11 place-items-center rounded-full border border-husk/15 text-husk transition-colors hover:border-paddy-700 hover:bg-paddy-700 hover:text-rice-50"
          >
            →
          </button>
          <span className="ml-2 text-xs uppercase tracking-widest text-husk-soft">
            Drag →
          </span>
        </div>
      </div>

      <div
        ref={rail}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={end}
        onPointerLeave={end}
        className={cn(
          "no-scrollbar mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:px-8",
          grabbing ? "cursor-grabbing select-none" : "cursor-grab",
        )}
      >
        {/* left gutter to align with container */}
        <div className="hidden shrink-0 lg:block lg:w-[max(0px,calc((100vw-80rem)/2))]" />
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.id}
            className="flex w-[82vw] shrink-0 snap-start flex-col rounded-3xl border border-husk/10 bg-rice-50 p-8 shadow-[0_18px_44px_-34px_rgba(34,31,23,0.5)] sm:w-[26rem]"
          >
            <div className="flex items-center gap-1 text-harvest-500" aria-label={`${t.rating} out of 5`}>
              {"★★★★★".slice(0, t.rating)}
            </div>
            <blockquote className="mt-5 flex-1 font-display text-[1.35rem] leading-snug text-husk">
              <span className="text-clay-400">“</span>
              {t.quote}
              <span className="text-clay-400">”</span>
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-4 border-t border-husk/10 pt-5">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-paddy-800 font-display text-lg text-rice-50">
                {t.name.charAt(0)}
              </span>
              <div>
                <p className="font-semibold text-husk">{t.name}</p>
                <p className="text-sm text-husk-soft">
                  {t.place} · bought {t.product}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
        <div className="shrink-0 pr-3 sm:pr-5" />
      </div>
    </section>
  );
}
