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
    <section id="offers" className="relative bg-rice-100 py-12 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          kicker=""
          title="Offers from us"
          intro="Latest deals and special offers on our rice varieties."
        />

        <div className="mt-7 grid gap-4 sm:mt-14 sm:gap-8 lg:grid-cols-[19rem_1fr] lg:items-start">
          {/* LEFT — three compact offer cards, each with a clear CTA */}
          <Reveal stagger={0.1} y={24} className="flex flex-col gap-3 sm:gap-4">
            {offers.length === 0 ? (
              <div className="rounded-2xl border border-husk/10 bg-rice-50 p-5 text-center text-xs text-husk-soft sm:p-8 sm:text-sm">
                Offers are being prepared — check back soon.
              </div>
            ) : (
              offers.slice(0, 3).map((o) => {
                const t = TONE[o.tone] ?? TONE.gold;
                return (
                  <article
                    key={o.id}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-xl p-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 sm:rounded-2xl sm:p-5",
                      t.card,
                    )}
                  >
                    <GrainCorner color={t.grain} />
                    <p className={cn("kicker relative text-[0.65rem] sm:text-xs", t.eyebrow)}>{o.eyebrow}</p>
                    <h3 className="relative mt-1.5 font-display text-base font-medium leading-snug sm:mt-2 sm:text-lg">
                      {o.title}
                    </h3>
                    {o.detail && (
                      <p className="relative mt-1 line-clamp-2 text-[0.7rem] leading-relaxed opacity-80 sm:mt-1.5 sm:text-xs">
                        {o.detail}
                      </p>
                    )}
                    <Link
                      href={o.ctaHref}
                      className={cn(
                        "relative mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-wider transition-all duration-300 hover:gap-2.5 sm:mt-4 sm:px-4 sm:py-2 sm:text-[0.7rem]",
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
          <div className="relative overflow-hidden rounded-2xl bg-field p-4 text-rice-50 sm:rounded-3xl sm:p-9">
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

            <div className="relative mb-3 flex items-center gap-2.5 sm:mb-6 sm:gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-harvest-500 text-paddy-950 sm:h-9 sm:w-9">
                <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" aria-hidden>
                  <path d="M13 2 4 13h7l-1 9 9-11h-7l1-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="kicker text-[0.65rem] text-harvest-300 sm:text-xs">Hot deals</p>
                <h3 className="font-display text-lg leading-tight text-rice-50 sm:text-2xl">
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
