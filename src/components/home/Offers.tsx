import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/anim/Reveal";
import HotDealsCarousel from "@/components/home/HotDealsCarousel";
import { getEnabledOffers } from "@/lib/services/offer.service";
import { getHotDealProducts } from "@/lib/services/product.service";
import { cn } from "@/lib/utils";

const TONE: Record<string, { card: string; eyebrow: string; cta: string; grain: string }> = {
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

const SPAN: Record<string, string> = {
  wide: "sm:col-span-2 min-h-[12rem]",
  tall: "sm:row-span-2 min-h-[12rem]",
  small: "min-h-[12rem]",
};

function GrainCorner({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className="pointer-events-none absolute -right-3 -top-3 h-28 w-28"
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

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          {/* LEFT — DB-driven offers (admin editable) */}
          <Reveal stagger={0.1} y={28}>
            {offers.length === 0 ? (
              <div className="rounded-3xl border border-husk/10 bg-rice-50 p-10 text-center text-husk-soft">
                Offers are being prepared — check back soon.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {offers.map((o) => {
                  const t = TONE[o.tone] ?? TONE.gold;
                  return (
                    <article
                      key={o.id}
                      className={cn(
                        "group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1",
                        t.card,
                        SPAN[o.size] ?? SPAN.small,
                      )}
                    >
                      <GrainCorner color={t.grain} />
                      <p className={cn("kicker relative", t.eyebrow)}>{o.eyebrow}</p>
                      <div className="relative mt-auto pt-8">
                        <h3
                          className={cn(
                            "font-display font-medium leading-tight",
                            o.size === "wide" ? "text-[clamp(1.5rem,2.4vw,2.1rem)]" : "text-xl",
                          )}
                        >
                          {o.title}
                        </h3>
                        {o.detail && (
                          <p className="mt-2 max-w-sm text-sm leading-relaxed opacity-80">
                            {o.detail}
                          </p>
                        )}
                        <Link
                          href={o.ctaHref}
                          className={cn(
                            "mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest transition-all duration-300",
                            t.cta,
                          )}
                        >
                          {o.cta} <span aria-hidden>→</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </Reveal>

          {/* RIGHT — Hot Deals carousel */}
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
