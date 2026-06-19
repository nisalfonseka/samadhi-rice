import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { getSettings } from "@/lib/services/settings.service";
import { prisma } from "@/lib/db";

const COLS = [
  {
    title: "Shop",
    links: [
      { label: "Suwandel Rice", href: "/shop/suwandel-rice" },
      { label: "Kalu Heenati", href: "/shop/kalu-heenati" },
      { label: "Red Raw Rice", href: "/shop/red-raw-rice" },
      { label: "Keeri Samba", href: "/shop/keeri-samba" },
      { label: "All varieties", href: "/shop" },
    ],
  },
  {
    title: "The Shop",
    links: [
      { label: "Our Journey", href: "/about" },
      { label: "Recipes & Blog", href: "/blog" },
      { label: "Wholesale & HoReCa", href: "/wholesale" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Delivery & areas", href: "/delivery" },
      { label: "Track your order", href: "/account/orders" },
      { label: "FAQ", href: "/faq" },
      { label: "Returns", href: "/returns" },
    ],
  },
];

/* SVG paths for social icons */
const SOCIAL_PATHS = {
  facebook: "M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.6V4q-.9-.1-2.1-.1c-2.4 0-4 1.4-4 4v2H8v3h2.6v8z",
  instagram: "M12 7.6A4.4 4.4 0 1 0 12 16.4 4.4 4.4 0 0 0 12 7.6m0 7.2A2.8 2.8 0 1 1 12 9.2a2.8 2.8 0 0 1 0 5.6M16.9 6a1 1 0 1 0 0 2.1 1 1 0 0 0 0-2.1M20.4 8.3a5.4 5.4 0 0 0-1.5-3.7 5.4 5.4 0 0 0-3.7-1.5C13.9 3 10.1 3 8.8 3.1A5.4 5.4 0 0 0 5.1 4.6 5.4 5.4 0 0 0 3.6 8.3C3.5 9.6 3.5 13.4 3.6 14.7a5.4 5.4 0 0 0 1.5 3.7 5.4 5.4 0 0 0 3.7 1.5c1.3.1 5.1.1 6.4 0a5.4 5.4 0 0 0 3.7-1.5 5.4 5.4 0 0 0 1.5-3.7c.1-1.3.1-5.1 0-6.4m-1.9 7.8a2.8 2.8 0 0 1-1.6 1.6c-1.1.4-3.7.3-4.9.3s-3.8.1-4.9-.3a2.8 2.8 0 0 1-1.6-1.6c-.4-1.1-.3-3.7-.3-4.9s-.1-3.8.3-4.9A2.8 2.8 0 0 1 7.1 5q1.65-.45 4.9-.3c1.2 0 3.8-.1 4.9.3a2.8 2.8 0 0 1 1.6 1.6c.4 1.1.3 3.7.3 4.9s.1 3.8-.3 4.6",
  youtube: "M21.6 8.2a2.5 2.5 0 0 0-1.7-1.8C18.3 6 12 6 12 6s-6.3 0-7.9.4A2.5 2.5 0 0 0 2.4 8.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 3.8 2.5 2.5 0 0 0 1.7 1.8C5.7 18 12 18 12 18s6.3 0 7.9-.4a2.5 2.5 0 0 0 1.7-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-3.8M10 15V9l5.2 3z",
  tiktok: "M19.6 6.9a4.7 4.7 0 0 1-4.7-4.7h-3.4v13.2a2.8 2.8 0 0 1-2.8 2.6 2.8 2.8 0 0 1-2.8-2.8 2.8 2.8 0 0 1 2.8-2.8c.3 0 .5 0 .8.1V9a6.2 6.2 0 0 0-.8-.1 6.2 6.2 0 0 0-6.2 6.2 6.2 6.2 0 0 0 6.2 6.2 6.2 6.2 0 0 0 6.2-6.2V9.3a8 8 0 0 0 4.7 1.5V7.4a4.7 4.7 0 0 1-2.4-1.3l2.4.8z",
  whatsapp: "M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3m4.1 11.8a2.5 2.5 0 0 1-1.7 1.2c-.4 0-.4.3-2.4-.5a11 11 0 0 1-4.2-3.7 4.9 4.9 0 0 1-1-2.6 2.8 2.8 0 0 1 .9-2.1.9.9 0 0 1 .7-.3h.5c.1 0 .3 0 .5.4l.7 1.6q.15.2 0 .5l-.4.4c-.1.1-.2.3-.1.5a6.5 6.5 0 0 0 1.2 1.5 5.9 5.9 0 0 0 1.7 1c.2.1.4.1.5-.1s.6-.7.7-.9.3-.2.5-.1 1.3.7 1.5.7.1.4.1.5",
};

function SocialIcon({ label, href, path }: { label: string; href: string; path: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="grid h-10 w-10 place-items-center rounded-full border border-rice-50/15 text-rice-100/80 transition-all duration-300 hover:border-harvest-500 hover:text-harvest-400"
    >
      <svg viewBox="0 0 24 24" className="h-[1.05rem] w-[1.05rem]" fill="currentColor" aria-hidden>
        <path d={path} />
      </svg>
    </a>
  );
}

export default async function Footer() {
  const [s, branches] = await Promise.all([
    getSettings(),
    prisma.branch.findMany({ orderBy: { position: "asc" } }),
  ]);

  const socials = [
    s.socialFacebook && { label: "Facebook", href: s.socialFacebook, path: SOCIAL_PATHS.facebook },
    s.socialInstagram && { label: "Instagram", href: s.socialInstagram, path: SOCIAL_PATHS.instagram },
    s.socialYoutube && { label: "YouTube", href: s.socialYoutube, path: SOCIAL_PATHS.youtube },
    s.socialTiktok && { label: "TikTok", href: s.socialTiktok, path: SOCIAL_PATHS.tiktok },
    s.contactWhatsapp && {
      label: "WhatsApp",
      href: `https://wa.me/${s.contactWhatsapp}`,
      path: SOCIAL_PATHS.whatsapp,
    },
  ].filter(Boolean) as { label: string; href: string; path: string }[];

  // Fallback to defaults if none are set yet
  const displaySocials = socials.length > 0 ? socials : [
    { label: "Facebook", href: "#", path: SOCIAL_PATHS.facebook },
    { label: "Instagram", href: "#", path: SOCIAL_PATHS.instagram },
    { label: "WhatsApp", href: `https://wa.me/${s.contactWhatsapp || "94770000000"}`, path: SOCIAL_PATHS.whatsapp },
    { label: "YouTube", href: "#", path: SOCIAL_PATHS.youtube },
  ];

  return (
    <footer className="bg-field relative z-10 overflow-hidden text-rice-100">

      <div className="mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* brand */}
          <div className="max-w-sm">
            <Logo className="text-rice-50" />
            <p className="mt-5 text-[0.95rem] leading-relaxed text-rice-100/70">
              {s.siteTagline || "Single-origin Sri Lankan rice, milled fresh from family paddy fields and carried to your kitchen."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {displaySocials.map((soc) => (
                <SocialIcon key={soc.label} label={soc.label} href={soc.href} path={soc.path} />
              ))}
            </div>
          </div>

          {/* link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-lg text-rice-50">{col.title}</h4>
              <ul className="mt-4 space-y-3 text-[0.92rem]">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-rice-100/70 transition-colors hover:text-harvest-400"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* contact strip */}
        <div className="mt-14 border-t border-rice-50/10 pt-8">
          {/* general contact line */}
          {(s.contactPhone || s.contactEmail) && (
            <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-rice-100/65">
              <span className="text-rice-50/80 font-medium">Talk to us</span>
              {s.contactPhone && <span>{s.contactPhone}</span>}
              {s.contactEmail && (
                <a href={`mailto:${s.contactEmail}`} className="hover:text-harvest-400 transition-colors">
                  {s.contactEmail}
                </a>
              )}
            </div>
          )}

          {/* branches grid — falls back to settings-based single location */}
          {branches.length > 0 ? (
            <div
              className="grid gap-6 text-sm text-rice-100/65"
              style={{ gridTemplateColumns: `repeat(${Math.min(branches.length, 3)}, minmax(0, 1fr))` }}
            >
              {branches.map((b) => (
                <div key={b.id}>
                  <span className="block text-[0.7rem] font-semibold uppercase tracking-widest text-rice-50/50 mb-1">
                    {b.name}
                  </span>
                  <p>{b.address}</p>
                  {b.city && <p>{b.city}</p>}
                  {b.phone && <p className="mt-1">{b.phone}</p>}
                  {b.hours && <p className="mt-1 text-rice-100/45">{b.hours}</p>}
                  {b.mapsUrl && (
                    <a
                      href={b.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-block text-harvest-400 hover:text-harvest-300 transition-colors"
                    >
                      View on map →
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* fallback single-location from settings */
            <div className="grid gap-6 text-sm text-rice-100/65 sm:grid-cols-2">
              <div>
                <span className="block text-[0.7rem] font-semibold uppercase tracking-widest text-rice-50/50 mb-1">
                  Visit / Mill
                </span>
                <p>{s.addressLine1}</p>
                {s.addressCity && <p>{s.addressCity}</p>}
                {s.addressGoogleMaps && (
                  <a
                    href={s.addressGoogleMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-block text-harvest-400 hover:text-harvest-300 transition-colors"
                  >
                    View on map →
                  </a>
                )}
              </div>
              <div>
                <span className="block text-[0.7rem] font-semibold uppercase tracking-widest text-rice-50/50 mb-1">
                  Hours
                </span>
                <p>{s.businessHours}</p>
              </div>
            </div>
          )}
        </div>

        {/* bottom bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-rice-50/10 pt-7 text-[0.82rem] text-rice-100/55 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} SamadhiRice.lk · Milled in Sri Lanka 🇱🇰</p>
          <div className="flex items-center gap-4">
            <span className="rounded-md border border-rice-50/15 px-2 py-1">PayHere</span>
            <span className="rounded-md border border-rice-50/15 px-2 py-1">Visa</span>
            <span className="rounded-md border border-rice-50/15 px-2 py-1">Mastercard</span>
            <span className="rounded-md border border-rice-50/15 px-2 py-1">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
