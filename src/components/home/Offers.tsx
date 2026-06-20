import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/anim/Reveal";
import HotDealsCarousel from "@/components/home/HotDealsCarousel";
import { getEnabledOffers } from "@/lib/services/offer.service";
import { getHotDealProducts } from "@/lib/services/product.service";
import { cn } from "@/lib/utils";

const TONE: Record<
  string,
  { card: string; eyebrow: string; ctaBtn: string; grain: string }
> = {
  gold: {
    card: "bg-harvest-500 text-paddy-950",
    eyebrow: "text-paddy-900/70",
    ctaBtn: "bg-paddy-900 text-rice-50 hover:bg-paddy-800",
    grain: "rgba(29,41,22,0.16)",
  },
  paddy: {
    card: "bg-field text-rice-50",
    eyebrow: "text-harvest-300",
    ctaBtn: "bg-harvest-500 text-paddy-950 hover:bg-harvest-400",
    grain: "rgba(243,222,160,0.14)",
  },
  clay: {
    card: "bg-clay-500 text-rice-50",
    eyebrow: "text-rice-100/70",
    ctaBtn: "bg-rice-50 text-clay-600 hover:bg-rice-100",
    grain: "rgba(255,255,255,0.14)",
  },
};

function GrainCorner({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className="pointer-events-none absolute -right-3 -top-3 h-24 w-24"
      aria-hidden
      fill={color}
    >
      {Array.from({ length: 9 }).map((_, i) => {
        const x = 20 + (i % 3) * 30;
        const y = 18 + Math.floor(i / 3) * 28;
        const r = (i * 37) % 60;
        return <ellipse key={i} cx={x} cy={y} rx="7" ry="3" transform={`rotate(${r} ${x} ${y})`} />;
      })}
    </svg>
  );
}

export default async function Offers() {
  let offers: Awaited<ReturnType<typeof getEnabledOffers>> = [];
  let deals: Awaited<ReturnType<typeof getHotDealProducts>> = [];
  try {
    [offers, deals] = await Promise.all([
      getEnabledOffers(),
      getHotDealProducts(8),
    ]);
  } catch {
    /* hide gracefully on DB hiccup */
  }

  if (offers.length === 0 && deals.length === 0) return null;

  return (
    <section id="offers" className="relative bg-rice-100 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          kicker="Worth stocking up for"
          title="Offers from the mill"
          intro="Rice is a pantry staple — buy the way Sri Lankan kitchens always have, and let the savings stack up."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[19rem_1fr] lg:items-start">
          {/* LEFT — three compact offer cards, each with a clear CTA */}
          <Reveal stagger={0.1} y={24} className="flex flex-col gap-4">
            {offers.length === 0 ? (
              <div className="rounded-2xl border border-husk/10 bg-rice-50 p-8 text-center text-sm text-husk-soft">
                Offers are being prepared — check back soon.
              </div>
            ) : (
              offers.slice(0, 3).map((o) => {
                const t = TONE[o.tone] ?? TONE.gold;
                return (
                  <article
                    key={o.id}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-2xl p-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1",
                      t.card,
                    )}
                  >
                    <GrainCorner color={t.grain} />
                    <p className={cn("kicker relative", t.eyebrow)}>{o.eyebrow}</p>
                    <h3 className="relative mt-2 font-display text-lg font-medium leading-snug">
                      {o.title}
                    </h3>
                    {o.detail && (
                      <p className="relative mt-1.5 line-clamp-2 text-xs leading-relaxed opacity-80">
                        {o.detail}
                      </p>
                    )}
                    <Link
                      href={o.ctaHref}
                      className={cn(
                        "relative mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-wider transition-all duration-300 hover:gap-2.5",
                        t.ctaBtn,
                      )}
                    >
                      {o.cta} <span aria-hidden>→</span>
                    </Link>
                  </article>
                );
              })
            )}
          </Reveal>

          {/* RIGHT — expanded Hot Deals, default product cards */}
          <div className="relative overflow-hidden rounded-3xl bg-field p-7 text-rice-50 sm:p-9">
            {/* faint terrace lines */}
            <svg
              viewBox="0 0 600 300"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
              aria-hidden
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <path
                  key={i}
                  d={`M0 ${50 + i * 45}c100 -16 200 -16 300 0s200 16 300 0`}
                  stroke="var(--color-harvest-300)"
                  strokeWidth="1"
                  fill="none"
                />
              ))}
            </svg>

            <div className="relative mb-6 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-harvest-500 text-paddy-950">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                  <path d="M13 2 4 13h7l-1 9 9-11h-7l1-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="kicker text-harvest-300">Hot deals</p>
                <h3 className="font-display text-2xl leading-tight text-rice-50">
                  This week&apos;s discounts
                </h3>
              </div>
            </div>

            {deals.length === 0 ? (
              <div className="relative rounded-2xl border border-rice-50/15 bg-rice-50/[0.05] p-8 text-center text-rice-100/70">
                No discounts running right now.{" "}
                <Link href="/shop" className="text-harvest-300 underline-offset-4 hover:underline">
                  Browse the shop →
                </Link>
              </div>
            ) : (
              <div className="relative">
                <HotDealsCarousel products={deals} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
