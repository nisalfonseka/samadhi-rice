"use client";

import { useState } from "react";
import Link from "next/link";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: POST to /api/newsletter (Resend) once the email service is wired
    setDone(true);
  };

  return (
    <section className="bg-rice-100 px-5 pb-24 pt-4 sm:px-8 sm:pb-28">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-field px-6 py-14 text-rice-50 sm:px-14 sm:py-20">
          {/* grain motif */}
          <svg
            viewBox="0 0 400 400"
            className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 opacity-[0.12]"
            aria-hidden
            fill="var(--color-harvest-300)"
          >
            {Array.from({ length: 40 }).map((_, i) => {
              const x = (i * 53) % 380 + 10;
              const y = (i * 89) % 380 + 10;
              const r = (i * 31) % 180;
              return <ellipse key={i} cx={x} cy={y} rx="9" ry="3.4" transform={`rotate(${r} ${x} ${y})`} />;
            })}
          </svg>

          <div className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="kicker mb-4 text-harvest-300">Stay close to the field</p>
              <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-medium leading-tight">
                Get the new harvest in your inbox
              </h2>
              <p className="mt-4 max-w-md text-rice-100/75">
                Seasonal milling news, recipes from Sri Lankan kitchens, and the
                occasional members-only offer. No spam — just rice.
              </p>

              {done ? (
                <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-rice-50/10 px-5 py-3 text-sm text-harvest-200">
                  ✺ Thank you — welcome to the SamadhiRice family.
                </p>
              ) : (
                <form onSubmit={submit} className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.lk"
                    className="w-full rounded-full border border-rice-50/20 bg-rice-50/[0.06] px-5 py-3.5 text-rice-50 outline-none transition-colors placeholder:text-rice-100/40 focus:border-harvest-400 focus:bg-rice-50/[0.1]"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-harvest-500 px-7 py-3.5 font-medium text-paddy-950 transition-all duration-300 hover:bg-harvest-400 hover:-translate-y-0.5"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

            {/* Rice Finder teaser */}
            <div className="rounded-3xl border border-rice-50/15 bg-rice-50/[0.05] p-7 backdrop-blur-sm">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-harvest-500 text-paddy-950">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
                  <path d="M8 16c-2-2-2-6 1-9s7-3 9-1c1 1-1 5-4 8s-5 3-6 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M9 13.5 14.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </span>
              <h3 className="mt-5 font-display text-2xl">Not sure which rice?</h3>
              <p className="mt-2 text-sm leading-relaxed text-rice-100/75">
                Answer three quick questions — what you&apos;re cooking, how many
                you&apos;re feeding, any dietary needs — and we&apos;ll match you
                to the perfect grain.
              </p>
              <Link
                href="/rice-finder"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-harvest-300 transition-all duration-300 hover:gap-3"
              >
                Try the Rice Finder →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
