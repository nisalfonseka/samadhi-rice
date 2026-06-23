import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import BranchCarousel from "@/components/branches/BranchCarousel";

export const metadata: Metadata = {
  title: "Our Branches",
  description: "Visit any SamadhiRice.lk branch — fresh-milled heritage rice, always in stock.",
};

export const revalidate = 300;

/* ── tiny icon components ── */
function Pin() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
      <path d="M10 18s-6-6.5-6-10a6 6 0 1 1 12 0c0 3.5-6 10-6 10Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function Phone() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
      <path d="M4 3h3.5l1.5 4-2 1.2a11 11 0 0 0 4.8 4.8L13 11l4 1.5V16a2 2 0 0 1-2 2A14 14 0 0 1 2 5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function Clock() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}


export default async function BranchesPage() {
  const [branches, s] = await Promise.all([
    prisma.branch.findMany({ orderBy: { position: "asc" } }).catch(() => []),
    getSettings(),
  ]);

  return (
    <main className="relative z-10 min-h-screen bg-rice-50">

      {/* ── hero ── */}
      <section className="relative mt-[10px] flex min-h-[48vh] items-end overflow-hidden bg-paddy-950 pb-16 pt-32">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg,#0f1a0a 0%,#1a2912 35%,#2d4020 65%,#5a6830 100%)",
          }}
        />
        {/* paddy terraces */}
        <div className="absolute inset-x-0 bottom-0 h-[26vh]">
          <svg viewBox="0 0 1440 240" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
            <path d="M0 240V100c200 36 400 4 720 4s520 26 720-4v140Z" fill="#2c3c1d" />
            <path d="M0 240V140c200 28 400 2 720 2s520 20 720-6v104Z" fill="#243117" />
          </svg>
        </div>
        {/* grain dust particles */}
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-harvest-200"
              style={{
                left: `${(i * 61) % 100}%`,
                bottom: `${20 + (i * 37) % 30}%`,
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                animation: `float-grain ${9 + (i % 5) * 2}s linear ${(i % 8) * 1.1}s infinite`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
          <p className="kicker mb-4 flex items-center gap-3 text-harvest-300">
            <span className="h-px w-10 bg-harvest-400/70" />
            {branches.length} Location{branches.length !== 1 ? "s" : ""} island-wide
          </p>
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.8rem)] font-medium leading-[0.98] text-rice-50">
            Find us near<br />
            <span className="italic text-harvest-300">your kitchen.</span>
          </h1>
          {s.contactPhone && (
            <a
              href={`tel:${s.contactPhone}`}
              className="mt-6 inline-flex items-center gap-2 text-rice-100/70 transition-colors hover:text-harvest-300"
            >
              <Phone />
              <span className="text-sm">{s.contactPhone}</span>
            </a>
          )}
        </div>
      </section>

      {/* ── empty state ── */}
      {branches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-paddy-800/10">
            <Pin />
          </div>
          <h2 className="font-display text-2xl text-husk">Coming soon</h2>
          <p className="mt-2 text-husk-soft">Branch locations are being added. Check back shortly.</p>
          <Link href="/shop" className="mt-8 rounded-full bg-paddy-800 px-7 py-3 text-sm font-medium text-rice-50 hover:bg-paddy-700 transition-colors">
            Shop online instead →
          </Link>
        </div>
      )}

      {/* ── branch cards ── */}
      {branches.length > 0 && (
        <section className="mx-auto max-w-6xl space-y-0 px-5 py-16 sm:px-8">
          {branches.map((branch, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={branch.id} className="relative">
                {/* branch number watermark */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-4 select-none font-display text-[8rem] font-bold leading-none text-husk/[0.04]"
                  style={{ left: isEven ? "-0.5rem" : undefined, right: !isEven ? "-0.5rem" : undefined }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div
                  className={`group relative mb-6 rounded-3xl border border-husk/10 bg-white shadow-[0_4px_40px_-12px_rgba(34,31,23,0.12)] transition-shadow duration-500 hover:shadow-[0_8px_60px_-12px_rgba(34,31,23,0.2)] overflow-hidden lg:grid lg:h-[420px] ${
                    isEven ? "lg:grid-cols-[1.1fr_1fr]" : "lg:grid-cols-[1fr_1.1fr]"
                  }`}
                >
                  {/* image carousel — stretches to match the details panel height */}
                  <div
                    className={`relative overflow-hidden ${!isEven ? "lg:order-2" : ""}`}
                  >
                    <BranchCarousel images={branch.images ?? []} name={branch.name} index={idx} />
                  </div>

                  {/* details */}
                  <div
                    className={`flex flex-col justify-between p-6 lg:p-8 ${!isEven ? "lg:order-1" : ""}`}
                  >
                    <div>
                      {/* index + name */}
                      <div className="mb-1 flex items-baseline gap-3">
                        <span className="font-display text-[0.7rem] font-bold uppercase tracking-[0.25em] text-paddy-600/60">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="h-px flex-1 bg-husk/10" />
                      </div>
                      <h2 className="font-display text-2xl font-medium text-husk mb-0.5">
                        {branch.name}
                      </h2>
                      <p className="text-sm font-medium text-paddy-600 mb-4">{branch.city}</p>

                      {/* info list */}
                      <ul className="space-y-2.5">
                        <li className="flex items-start gap-3 text-sm text-husk/80">
                          <span className="mt-0.5 text-paddy-500"><Pin /></span>
                          <span>{branch.address}{branch.city ? `, ${branch.city}` : ""}</span>
                        </li>
                        {branch.phone && (
                          <li className="flex items-center gap-3 text-sm text-husk/80">
                            <span className="text-paddy-500"><Phone /></span>
                            <a href={`tel:${branch.phone}`} className="hover:text-paddy-700 transition-colors">
                              {branch.phone}
                            </a>
                          </li>
                        )}
                        {branch.hours && (
                          <li className="flex items-start gap-3 text-sm text-husk/80">
                            <span className="mt-0.5 text-paddy-500"><Clock /></span>
                            <span>{branch.hours}</span>
                          </li>
                        )}
                      </ul>

                      {/* description — shown under hours */}
                      {branch.description && (
                        <p className="mt-4 text-sm leading-relaxed text-husk/60 border-t border-husk/8 pt-4">
                          {branch.description}
                        </p>
                      )}
                    </div>

                    {/* CTAs */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      {branch.mapsUrl && (
                        <a
                          href={branch.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/btn inline-flex items-center gap-2 rounded-full bg-paddy-800 px-5 py-2.5 text-sm font-medium text-rice-50 transition-all duration-300 hover:bg-paddy-700 hover:-translate-y-0.5"
                        >
                          <Pin />
                          Get directions
                          <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
                        </a>
                      )}
                      {branch.phone && (
                        <a
                          href={`tel:${branch.phone}`}
                          className="inline-flex items-center gap-2 rounded-full border border-husk/20 px-5 py-2.5 text-sm font-medium text-husk transition-all duration-300 hover:border-paddy-600 hover:text-paddy-700"
                        >
                          <Phone />
                          Call us
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* ── bottom CTA ── */}
      <section className="border-t border-husk/8 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8">
          <p className="kicker mb-3 text-paddy-600">Can&apos;t make it in-store?</p>
          <h2 className="font-display text-3xl text-husk mb-4">
            Order online — delivered to your door
          </h2>
          <p className="mx-auto max-w-md text-husk-soft mb-8">
            Fresh-milled, island-wide delivery. Same rice, same quality, straight to your kitchen.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-paddy-800 px-8 py-4 font-medium text-rice-50 transition-all duration-300 hover:bg-paddy-700 hover:-translate-y-0.5"
          >
            Shop the harvest →
          </Link>
        </div>
      </section>
    </main>
  );
}
