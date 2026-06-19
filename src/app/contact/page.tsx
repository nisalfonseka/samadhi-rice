import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/services/settings.service";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Reach SamadhiRice.lk by phone, WhatsApp, or email. Visit a branch or send us a message.",
};

export const dynamic = "force-dynamic";

/* ── small inline icons ── */
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M5 4h4.5l2 5-2.5 1.5a11 11 0 0 0 5 5L15.5 13l5 2V19a2 2 0 0 1-2 2A18 18 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.95-1.418A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm5.078 14.148c-.21.593-1.234 1.13-1.703 1.197-.434.062-.985.088-1.588-.1a14.563 14.563 0 0 1-1.44-.535c-2.53-1.094-4.18-3.652-4.305-3.82-.122-.168-.997-1.327-.997-2.531s.631-1.796.855-2.043c.224-.247.488-.309.65-.309l.469.009c.15.006.352-.057.55.421.21.499.713 1.72.775 1.846.062.125.104.271.021.437-.083.166-.125.27-.247.415-.124.148-.26.33-.372.444-.124.124-.254.258-.11.506.148.247.655 1.08 1.406 1.748.965.86 1.779 1.126 2.03 1.25.248.124.392.104.537-.062.148-.166.631-.738.8-.99.166-.254.331-.21.557-.126.224.083 1.425.673 1.67.796.247.124.41.186.47.29.06.1.06.578-.15 1.17Z" />
    </svg>
  );
}
function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="m2 7 10 7 10-7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58ZM10 15V9l5.2 3-5.2 3Z" />
    </svg>
  );
}
function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07Z" />
    </svg>
  );
}

export default async function ContactPage() {
  const s = await getSettings();

  const socials = [
    { href: s.socialFacebook, Icon: FacebookIcon, label: "Facebook" },
    { href: s.socialInstagram, Icon: InstagramIcon, label: "Instagram" },
    { href: s.socialYoutube, Icon: YoutubeIcon, label: "YouTube" },
    { href: s.socialTiktok, Icon: TiktokIcon, label: "TikTok" },
  ].filter((x) => x.href);

  return (
    <main className="relative z-10 min-h-screen bg-rice-50">

      {/* ── Hero ── */}
      <section className="relative mt-[10px] flex min-h-[46vh] items-end overflow-hidden bg-paddy-950 pb-16 pt-32">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg,#0f1a0a 0%,#1a2912 35%,#2d4020 65%,#5a6830 100%)",
          }}
        />
        {/* paddy terraces */}
        <div className="absolute inset-x-0 bottom-0 h-[26vh]">
          <svg viewBox="0 0 1440 240" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
            <path d="M0 240V100c200 36 400 4 720 4s520 26 720-4v140Z" fill="#2c3c1d" />
            <path d="M0 240V140c200 28 400 2 720 2s520 20 720-6v104Z" fill="#243117" />
          </svg>
        </div>
        {/* grain dust */}
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-harvest-200"
              style={{
                left: `${(i * 73) % 100}%`,
                bottom: `${20 + (i * 41) % 35}%`,
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                animation: `float-grain ${9 + (i % 5) * 2}s linear ${(i % 8) * 1.3}s infinite`,
                opacity: 0.35,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
          <p className="kicker mb-4 flex items-center gap-3 text-harvest-300">
            <span className="h-px w-10 bg-harvest-400/70" />
            We&apos;re here for you
          </p>
          <h1 className="font-display text-[clamp(2.6rem,6vw,5rem)] font-medium leading-[0.97] text-rice-50">
            Let&apos;s talk<span className="italic text-harvest-300">.</span>
          </h1>
        </div>
      </section>

      {/* ── Quick-contact strip ── */}
      <section className="border-b border-husk/8 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-husk/8 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">

          {/* Phone */}
          <a
            href={`tel:${s.contactPhone}`}
            className="group flex items-center gap-5 px-0 py-8 transition-colors hover:bg-paddy-800/3 sm:px-8"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-paddy-800/8 text-paddy-700 transition-colors group-hover:bg-paddy-800 group-hover:text-rice-50">
              <PhoneIcon />
            </span>
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-husk/40 mb-0.5">Call us</p>
              <p className="font-display text-lg font-medium text-husk group-hover:text-paddy-700 transition-colors">
                {s.contactPhone || "+94 77 000 0000"}
              </p>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${s.contactWhatsapp || s.contactPhone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-5 px-0 py-8 transition-colors hover:bg-paddy-800/3 sm:px-8"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#25D366]/10 text-[#128C7E] transition-colors group-hover:bg-[#25D366] group-hover:text-white">
              <WhatsAppIcon />
            </span>
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-husk/40 mb-0.5">WhatsApp</p>
              <p className="font-display text-lg font-medium text-husk group-hover:text-[#128C7E] transition-colors">
                Chat with us
              </p>
            </div>
          </a>

          {/* Email */}
          <a
            href={`mailto:${s.contactEmail}`}
            className="group flex items-center gap-5 px-0 py-8 transition-colors hover:bg-paddy-800/3 sm:px-8"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-harvest-400/10 text-harvest-600 transition-colors group-hover:bg-harvest-500 group-hover:text-white">
              <EmailIcon />
            </span>
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-husk/40 mb-0.5">Email</p>
              <p className="font-display text-lg font-medium text-husk group-hover:text-harvest-600 transition-colors break-all">
                {s.contactEmail || "hello@samadhirice.lk"}
              </p>
            </div>
          </a>

        </div>
      </section>

      {/* ── Main: info + form ── */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:grid lg:grid-cols-[1fr_1.4fr] lg:gap-20">

        {/* LEFT — location, hours, social */}
        <div className="mb-16 lg:mb-0">

          {/* decorative grain watermark */}
          <div className="relative mb-10">
            <span
              aria-hidden
              className="pointer-events-none absolute -left-4 -top-6 select-none font-display text-[6rem] font-bold leading-none text-husk/[0.05]"
            >
              01
            </span>
            <p className="kicker relative mb-2 text-paddy-600">Find us</p>
            <h2 className="relative font-display text-3xl font-medium text-husk">
              Visit the mill
            </h2>
          </div>

          <ul className="space-y-6">
            {/* Address */}
            <li className="flex items-start gap-4">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-paddy-800/8 text-paddy-700">
                <PinIcon />
              </span>
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-husk/40 mb-1">Address</p>
                <p className="text-sm leading-relaxed text-husk/80">
                  {s.addressLine1 || "No. 42, Negombo Road"}
                  <br />
                  {s.addressCity || "Wattala, Western Province"}
                </p>
                {s.addressGoogleMaps && (
                  <a
                    href={s.addressGoogleMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-paddy-700 hover:underline"
                  >
                    Open in Maps →
                  </a>
                )}
              </div>
            </li>

            {/* Hours */}
            <li className="flex items-start gap-4">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-paddy-800/8 text-paddy-700">
                <ClockIcon />
              </span>
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-husk/40 mb-1">Hours</p>
                <p className="text-sm leading-relaxed text-husk/80">
                  {s.businessHours || "Mon–Sat · 8.00 am – 6.00 pm"}
                </p>
              </div>
            </li>
          </ul>

          {/* divider */}
          <div className="my-8 h-px bg-husk/8" />

          {/* social */}
          {socials.length > 0 && (
            <div>
              <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-widest text-husk/40">
                Follow along
              </p>
              <div className="flex gap-3">
                {socials.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-husk/10 text-husk/50 transition-all hover:border-paddy-600 hover:bg-paddy-800 hover:text-rice-50"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* branches CTA */}
          <div className="mt-10">
            <Link
              href="/branches"
              className="inline-flex items-center gap-2 rounded-full border border-husk/15 px-5 py-2.5 text-sm font-medium text-husk transition-all hover:border-paddy-600 hover:text-paddy-700"
            >
              <PinIcon />
              View all branch locations →
            </Link>
          </div>
        </div>

        {/* RIGHT — form */}
        <div>
          <div className="relative mb-10">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-4 -top-6 select-none font-display text-[6rem] font-bold leading-none text-husk/[0.05]"
            >
              02
            </span>
            <p className="kicker relative mb-2 text-paddy-600">Drop us a line</p>
            <h2 className="relative font-display text-3xl font-medium text-husk">
              Send a message
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-husk/60">
              Questions about an order, a specific variety, bulk pricing, or anything else — we read every message.
            </p>
          </div>

          <ContactForm />
        </div>

      </section>

      {/* ── Bottom CTA band ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#1a2912 0%,#2d4020 50%,#3d5228 100%)",
        }}
      >
        {/* paddy silhouette */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32">
          <svg viewBox="0 0 1440 128" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
            <path d="M0 128V60c220 28 440 6 720 6s500 18 720-6v68Z" fill="#243117" opacity="0.6" />
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <p className="kicker mb-3 text-harvest-300">Rather shop now?</p>
          <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-medium text-rice-50 mb-6">
            Explore the harvest
          </h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-harvest-500 px-8 py-4 font-medium text-husk transition-all duration-300 hover:bg-harvest-400 hover:-translate-y-0.5"
          >
            Shop all rice varieties →
          </Link>
        </div>
      </section>

    </main>
  );
}
