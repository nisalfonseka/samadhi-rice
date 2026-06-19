import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Journey",
  description:
    "The story of SamadhiRice.lk — from family paddy fields in Sri Lanka to kitchens across the island.",
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
            Where it began
          </span>
          <h2 className="font-display text-3xl text-husk mb-6">
            Rooted in tradition
          </h2>
          {/* Placeholder — edit these paragraphs with your real story */}
          <div className="space-y-5 text-[1.05rem] leading-relaxed text-husk/80">
            <p>
              [Your founding story goes here — where the farm is, how many generations
              have worked the land, what inspired you to start selling direct to
              families.]
            </p>
            <p>
              [Describe the paddy fields, the region, the seasonal rhythms of planting
              and harvest that shape every grain you sell.]
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
            What we grow
          </span>
          <h2 className="font-display text-3xl text-husk mb-6">
            Heritage varieties, milled fresh
          </h2>
          <div className="space-y-5 text-[1.05rem] leading-relaxed text-husk/80">
            <p>
              [Explain which rice varieties you cultivate — Suwandel, Kalu Heenati,
              Red Raw Rice, Keeri Samba — and why you chose these heirloom varieties
              over high-yield modern strains.]
            </p>
            <p>
              [Talk about your milling process — how you mill to order so nothing sits
              in a warehouse, and what that freshness means for flavour and nutrition.]
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
            A family effort
          </h2>
          <div className="space-y-5 text-[1.05rem] leading-relaxed text-husk/80">
            <p>
              [Introduce the family members, the farmers, and anyone else central to
              the operation. Personal names and roles make this feel real and build
              trust with customers.]
            </p>
            <p>
              [Share any milestones — years in business, number of families fed, awards
              or certifications, media features, etc.]
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
              { title: "Freshness", body: "[What fresh-milled means to you and to your customers.]" },
              { title: "Heritage", body: "[Why preserving traditional rice varieties matters.]" },
              { title: "Community", body: "[How the business supports local farmers and families.]" },
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
            Every bag ships fresh from the mill — no warehousing, no compromise.
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
