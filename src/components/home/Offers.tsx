import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/anim/Reveal";
import { OFFERS, type Offer } from "@/lib/data";
import { cn } from "@/lib/utils";

const TONE: Record<Offer["tone"], { card: string; eyebrow: string; cta: string; grain: string }> = {
  gold: {
    card: "bg-harvest-500 text-paddy-950",
    eyebrow: "text-paddy-900/70",
    cta: "text-paddy-950 hover:gap-3",
    grain: "rgba(29,41,22,0.16)",
  },
  paddy: {
    card: "bg-field text-rice-50",
    eyebrow: "text-harvest-300",
    cta: "text-harvest-300 hover:gap-3",
    grain: "rgba(243,222,160,0.14)",
  },
  clay: {
    card: "bg-clay-500 text-rice-50",
    eyebrow: "text-rice-100/70",
    cta: "text-harvest-200 hover:gap-3",
    grain: "rgba(255,255,255,0.14)",
  },
};

const SPAN: Record<Offer["size"], string> = {
  wide: "lg:col-span-2 min-h-[15rem]",
  tall: "lg:row-span-2 min-h-[15rem]",
  small: "min-h-[15rem]",
};

function GrainCorner({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className="pointer-events-none absolute -right-3 -top-3 h-32 w-32"
      aria-hidden
      fill={color}
    >
      {Array.from({ length: 9 }).map((_, i) => {
        const x = 20 + (i % 3) * 30;
        const y = 18 + Math.floor(i / 3) * 28;
        const r = (i * 37) % 60;
        return (
          <ellipse key={i} cx={x} cy={y} rx="7" ry="3" transform={`rotate(${r} ${x} ${y})`} />
        );
      })}
    </svg>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  const t = TONE[offer.tone];
  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl p-7 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1",
        t.card,
        SPAN[offer.size],
      )}
    >
      <GrainCorner color={t.grain} />
      <p className={cn("kicker relative", t.eyebrow)}>{offer.eyebrow}</p>
      <div className="relative mt-auto pt-10">
        <h3
          className={cn(
            "font-display font-medium leading-tight",
            offer.size === "wide" ? "text-[clamp(1.8rem,3vw,2.6rem)]" : "text-2xl",
          )}
        >
          {offer.title}
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed opacity-80">
          {offer.detail}
        </p>
        <Link
          href="/shop"
          className={cn(
            "mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest transition-all duration-300",
            t.cta,
          )}
        >
          {offer.cta} <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

export default function Offers() {
  return (
    <section id="offers" className="relative bg-rice-100 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          kicker="Worth stocking up for"
          title="Offers from the mill"
          intro="Rice is a pantry staple — buy the way Sri Lankan kitchens always have, and let the savings stack up."
        />

        <Reveal
          stagger={0.12}
          y={36}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {OFFERS.map((o) => (
            <OfferCard key={o.id} offer={o} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
