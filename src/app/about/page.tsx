import type { Metadata } from "next";
import Link from "next/link";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Samadhi Rice",
  description:
    "Learn how SamadhiRice.lk helps Sri Lankan households choose heritage and everyday rice varieties with clear origin, cooking and delivery information.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: "About Samadhi Rice",
    description:
      "Heritage and everyday Sri Lankan rice, practical variety guidance and island-wide ordering.",
    url: "/about",
    locale: "en_LK",
    siteName: SITE_NAME,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function AboutPage() {
  return (
    <main className="relative z-10 min-h-screen bg-rice-50">
      {/* ── Hero banner ── */}
      <section className="relative flex min-h-[55vh] items-end overflow-hidden bg-paddy-950 pb-16 pt-32">
        {/* gradient wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #15220f 0%, #1d2916 40%, #314026 75%, #6b6a37 100%)",
          }}
        />
        {/* paddy silhouette */}
        <div className="absolute inset-x-0 bottom-0 h-[28vh]">
          <svg viewBox="0 0 1440 260" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
            <path d="M0 260V100c220 40 420 6 720 6s500 28 720-2v156Z" fill="#2c3c1d" />
            <path d="M0 260V140c220 30 420 2 720 2s500 22 720-6v124Z" fill="#243117" />
          </svg>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl px-5 sm:px-8">
          <p className="kicker mb-4 flex items-center gap-3 text-harvest-300">
            <span className="h-px w-10 bg-harvest-400/70" />
            Our Journey
          </p>
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.8rem)] font-medium leading-[0.98] text-rice-50">
            From the paddy field<br />
            <span className="italic text-harvest-300">to your table.</span>
          </h1>
        </div>
      </section>

      {/* ── Story content ── */}
      <article className="mx-auto max-w-3xl px-5 py-20 sm:px-8">

        {/* Section 1 — Origin */}
        <section className="mb-16">
          <span className="block text-[0.7rem] font-semibold uppercase tracking-widest text-paddy-600 mb-3">
            What we do
          </span>
          <h2 className="font-display text-3xl text-husk mb-6">
            Making rice easier to choose
          </h2>
          <div className="space-y-5 text-[1.05rem] leading-relaxed text-husk/80">
            <p>
              SamadhiRice.lk connects Sri Lankan households with a focused range of
              traditional and everyday rice. Our catalogue is designed to make each
              variety easier to understand before you buy, from grain and flavour to
              origin, pack size and cooking guidance.
            </p>
            <p>
              We serve customers online and through our listed branch locations. Every
              available location, phone number and opening time is kept on our branches
              page so you can confirm the details before travelling.
            </p>
          </div>
        </section>

        {/* decorative divider */}
        <div className="my-14 flex items-center gap-4">
          <span className="h-px flex-1 bg-husk/12" />
          <span className="text-harvest-500 text-xl">✺</span>
          <span className="h-px flex-1 bg-husk/12" />
        </div>

        {/* Section 2 — The Rice */}
        <section className="mb-16">
          <span className="block text-[0.7rem] font-semibold uppercase tracking-widest text-paddy-600 mb-3">
            What we offer
          </span>
          <h2 className="font-display text-3xl text-husk mb-6">
            Heritage varieties, milled fresh
          </h2>
          <div className="space-y-5 text-[1.05rem] leading-relaxed text-husk/80">
            <p>
              Our range includes fragrant Suwandel, wholegrain Kalu Heenati, red raw
              rice, Keeri Samba and familiar everyday grains. Each product page explains
              the variety in plain language and shows its current price, pack options
              and availability.
            </p>
            <p>
              If you are unsure which grain suits a dish, texture preference or budget,
              the Rice Finder can narrow the choice and link you directly to matching
              products.
            </p>
          </div>
        </section>

        {/* decorative divider */}
        <div className="my-14 flex items-center gap-4">
          <span className="h-px flex-1 bg-husk/12" />
          <span className="text-harvest-500 text-xl">✺</span>
          <span className="h-px flex-1 bg-husk/12" />
        </div>

        {/* Section 3 — The people */}
        <section className="mb-16">
          <span className="block text-[0.7rem] font-semibold uppercase tracking-widest text-paddy-600 mb-3">
            The people behind it
          </span>
          <h2 className="font-display text-3xl text-husk mb-6">
            A local service
          </h2>
          <div className="space-y-5 text-[1.05rem] leading-relaxed text-husk/80">
            <p>
              Behind the website is a local retail team helping customers choose rice,
              confirm stock and arrange orders. You can reach the team by phone,
              WhatsApp or email using the current details on our contact page.
            </p>
            <p>
              We publish branch information, product details and practical rice guides
              openly so customers can make informed choices without relying on vague
              claims.
            </p>
          </div>
        </section>

        {/* decorative divider */}
        <div className="my-14 flex items-center gap-4">
          <span className="h-px flex-1 bg-husk/12" />
          <span className="text-harvest-500 text-xl">✺</span>
          <span className="h-px flex-1 bg-husk/12" />
        </div>

        {/* Section 4 — Values */}
        <section className="mb-16">
          <span className="block text-[0.7rem] font-semibold uppercase tracking-widest text-paddy-600 mb-3">
            What we believe in
          </span>
          <h2 className="font-display text-3xl text-husk mb-6">
            Our values
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { title: "Clarity", body: "Useful product details, current availability and straightforward ordering." },
              { title: "Heritage", body: "Making traditional Sri Lankan varieties easier to discover and enjoy." },
              { title: "Service", body: "Local contact channels and branch information when you need a real person." },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl border border-husk/10 bg-white p-5">
                <p className="font-display text-xl text-husk mb-2">{v.title}</p>
                <p className="text-sm leading-relaxed text-husk/70">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-3xl bg-paddy-950 px-8 py-12 text-center">
          <h2 className="font-display text-3xl text-rice-50 mb-3">
            Taste the difference
          </h2>
          <p className="text-rice-100/70 mb-8 max-w-md mx-auto">
            Compare the current range, pack sizes, prices and availability before you order.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-harvest-500 px-8 py-4 font-medium text-paddy-950 transition-all duration-300 hover:bg-harvest-400 hover:-translate-y-0.5"
          >
            Shop the harvest →
          </Link>
        </div>
      </article>
    </main>
  );
}
