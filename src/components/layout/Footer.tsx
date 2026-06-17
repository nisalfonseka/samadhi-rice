import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { WHATSAPP_NUMBER } from "@/lib/data";

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

const Social = ({ d, label, href }: { d: string; label: string; href: string }) => (
  <a
    href={href}
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
    className="grid h-10 w-10 place-items-center rounded-full border border-rice-50/15 text-rice-100/80 transition-all duration-300 hover:border-harvest-500 hover:text-harvest-400"
  >
    <svg viewBox="0 0 24 24" className="h-[1.05rem] w-[1.05rem]" fill="currentColor" aria-hidden>
      <path d={d} />
    </svg>
  </a>
);

export default function Footer() {
  return (
    <footer className="bg-field relative z-10 overflow-hidden text-rice-100">
      {/* paddy silhouette divider */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 opacity-[0.18]">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
          <path
            d="M0 80V46c60-8 90 14 150 14s90-26 150-26 90 22 150 22 90-24 150-24 90 24 150 24 90-26 150-26 90 22 150 22 90-22 150-22 90 18 150 18v32Z"
            fill="var(--color-paddy-700)"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* brand */}
          <div className="max-w-sm">
            <Logo className="text-rice-50" />
            <p className="mt-5 text-[0.95rem] leading-relaxed text-rice-100/70">
              Single-origin Sri Lankan rice, milled fresh from family paddy fields
              and carried to your kitchen. From the field to your table — with
              nothing lost in between.
            </p>
            <div className="mt-6 flex gap-3">
              <Social label="Facebook" href="#" d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.6V4q-.9-.1-2.1-.1c-2.4 0-4 1.4-4 4v2H8v3h2.6v8z" />
              <Social label="Instagram" href="#" d="M12 7.6A4.4 4.4 0 1 0 12 16.4 4.4 4.4 0 0 0 12 7.6m0 7.2A2.8 2.8 0 1 1 12 9.2a2.8 2.8 0 0 1 0 5.6M16.9 6a1 1 0 1 0 0 2.1 1 1 0 0 0 0-2.1M20.4 8.3a5.4 5.4 0 0 0-1.5-3.7 5.4 5.4 0 0 0-3.7-1.5C13.9 3 10.1 3 8.8 3.1A5.4 5.4 0 0 0 5.1 4.6 5.4 5.4 0 0 0 3.6 8.3C3.5 9.6 3.5 13.4 3.6 14.7a5.4 5.4 0 0 0 1.5 3.7 5.4 5.4 0 0 0 3.7 1.5c1.3.1 5.1.1 6.4 0a5.4 5.4 0 0 0 3.7-1.5 5.4 5.4 0 0 0 1.5-3.7c.1-1.3.1-5.1 0-6.4m-1.9 7.8a2.8 2.8 0 0 1-1.6 1.6c-1.1.4-3.7.3-4.9.3s-3.8.1-4.9-.3a2.8 2.8 0 0 1-1.6-1.6c-.4-1.1-.3-3.7-.3-4.9s-.1-3.8.3-4.9A2.8 2.8 0 0 1 7.1 5q1.65-.45 4.9-.3c1.2 0 3.8-.1 4.9.3a2.8 2.8 0 0 1 1.6 1.6c.4 1.1.3 3.7.3 4.9s.1 3.8-.3 4.6" />
              <Social label="WhatsApp" href={`https://wa.me/${WHATSAPP_NUMBER}`} d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3m0 1.8a7.2 7.2 0 0 1 6 11.1l.3.5-.7 2.5-2.6-.7-.5.3A7.2 7.2 0 1 1 12 4.8m4.1 9c-.2-.1-1.3-.7-1.5-.7s-.4-.1-.5.1-.6.7-.7.9-.3.2-.5.1a5.9 5.9 0 0 1-1.7-1 6.5 6.5 0 0 1-1.2-1.5c-.1-.2 0-.4.1-.5l.4-.4q.15-.3 0-.5l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11 11 0 0 0 4.2 3.7c2 .8 2 .5 2.4.5a2.5 2.5 0 0 0 1.7-1.2 2 2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3" />
              <Social label="YouTube" href="#" d="M21.6 8.2a2.5 2.5 0 0 0-1.7-1.8C18.3 6 12 6 12 6s-6.3 0-7.9.4A2.5 2.5 0 0 0 2.4 8.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 3.8 2.5 2.5 0 0 0 1.7 1.8C5.7 18 12 18 12 18s6.3 0 7.9-.4a2.5 2.5 0 0 0 1.7-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-3.8M10 15V9l5.2 3z" />
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
        <div className="mt-14 grid gap-6 border-t border-rice-50/10 pt-8 text-sm text-rice-100/65 sm:grid-cols-3">
          <p>
            <span className="block text-rice-50/90">Visit / Mill</span>
            No. 42, Negombo Road, Wattala, Sri Lanka
          </p>
          <p>
            <span className="block text-rice-50/90">Talk to us</span>
            +94 77 000 0000 · hello@samadhirice.lk
          </p>
          <p>
            <span className="block text-rice-50/90">Hours</span>
            Mon–Sat · 8.00am – 6.00pm
          </p>
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
