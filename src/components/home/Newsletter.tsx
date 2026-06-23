"use client";

import { useState } from "react";
import Link from "next/link";
import { VscSearchSparkle } from "react-icons/vsc";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to subscribe");
      }
      
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
                <form onSubmit={submit} className="mt-8 max-w-md">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.lk"
                      className="w-full rounded-full border border-rice-50/20 bg-rice-50/[0.06] px-5 py-3.5 pr-32 text-rice-50 outline-none transition-colors placeholder:text-rice-100/40 focus:border-harvest-400 focus:bg-rice-50/[0.1]"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="absolute inset-y-1.5 right-1.5 flex items-center justify-center rounded-full bg-harvest-500 px-5 text-sm font-medium text-paddy-950 transition-all hover:bg-harvest-400 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? "Subscribing..." : "Subscribe"}
                    </button>
                  </div>
                  {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
                </form>
              )}
            </div>

            {/* Rice Finder teaser */}
            <div
              className="rounded-3xl border bg-rice-50/[0.05] p-7 backdrop-blur-sm shadow-lg shadow-paddy-950/20"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-harvest-500 text-paddy-950">
                <span className="select-none text-xl leading-none">✦</span>
              </span>
              <h3 className="mt-5 font-display text-2xl">Not sure which rice?</h3>
              <p className="mt-2 text-sm leading-relaxed text-rice-100/75">
                Answer three quick questions — what you&apos;re cooking, how many
                you&apos;re feeding, any dietary needs — and we&apos;ll match you
                to the perfect grain.
              </p>
              <Link
                href="/rice-finder"
                className="group relative mt-6 inline-flex self-start items-center justify-center rounded-full px-6 py-2.5 transition-colors text-rice-50"
              >
                {/* Animated Gradient Border Mask (Always Visible) */}
                <div 
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    padding: "1.5px",
                    background: "linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853, #4285F4) 0% 0% / 200% 100%",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    animation: "google-border-flow 3s linear infinite"
                  }}
                />

                <div className="relative flex items-center gap-2 font-medium tracking-wide">
                  <VscSearchSparkle className="text-xl" />
                  <span>Try AI Mode</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
