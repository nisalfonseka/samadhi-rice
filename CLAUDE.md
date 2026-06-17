@AGENTS.md

# SamadhiRice.lk

Premium, culturally-rooted e-commerce site for a Sri Lankan heritage rice shop.
Goal: feel bespoke and traditional ("paddy field to plate"), never generic /
AI-generated, while staying focused on selling rice.

## Stack (as actually installed)

- **Next.js 16.2.9** (App Router, Turbopack) — note: newer than the roadmap's "15".
- **React 19**, **TypeScript**.
- **Tailwind CSS v4** — theme is defined in `src/app/globals.css` via `@theme`
  (no `tailwind.config`). Custom keyframes also live there.
- **GSAP + @gsap/react + Lenis** for animation / smooth scroll.
- Planned (not yet wired): Prisma + Supabase, NextAuth, PayHere, Cloudinary,
  Anthropic (RAG chatbot), Resend, Upstash. See `rice-shop-ecommerce-roadmap.md`
  (in user's Downloads) for the full 4-week plan.

## Design system

Palette (in `globals.css` `@theme`): `rice-*` (warm paper off-whites),
`paddy-*` (deep muddy greens), `harvest-*` (gold/straw), `clay-*` (earth brown),
`mist-*` (dawn blue), `husk` (warm near-black ink).
Fonts: **Fraunces** (display, `font-display`), **DM Sans** (body, `font-body`),
**Noto Serif Sinhala** (`--font-sinhala`, used for Sinhala text on packs/cards).
All imagery is hand-built CSS/SVG (no stock photos) with swap-in slots for real
photos later — this was a deliberate choice.

## Structure

- `src/app/page.tsx` — homepage. Order: Hero → HotProducts → Offers →
  OriginStory → TrustStats → Testimonials → Newsletter. Footer + FloatingActions
  + Header live in `layout.tsx`.
- `src/components/home/*` — homepage sections.
- `src/components/layout/*` — Header (unique sticky, transparent-over-hero →
  rice-paper on scroll, scroll-progress line, animated cart badge, mobile
  overlay), Footer, SmoothScroll (Lenis+GSAP+CartProvider), FloatingActions
  (WhatsApp + Rice Finder assistant placeholder).
- `src/components/ui/*` — Logo (SVG grain mark), Button, SectionHeading.
- `src/components/anim/Reveal.tsx` — scroll reveal. **Uses IntersectionObserver,
  not ScrollTrigger** (gsap.from + ScrollTrigger was unreliable under React
  StrictMode). Continuous/scrub effects (hero parallax, pinned OriginStory,
  TrustStats counter) do use GSAP ScrollTrigger.
- `src/lib/data.ts` — all homepage content (products, offers, testimonials,
  stats, story). Typed to mirror the future DB schema; swap for queries later.
- `src/providers/CartProvider.tsx` — lightweight localStorage cart (count +
  add). Drives the header badge.

## Animation gotcha

Lenis hijacks native scroll, so `window.scrollTo` is overridden. For
programmatic scrolling (tests/screenshots) dispatch `wheel` events instead.
Reveals are IntersectionObserver-based so they fire regardless.

## Env

Secrets in `.env.local` (gitignored). Currently set: Supabase (URL, anon key,
`DATABASE_URL` with percent-encoded password), Cloudinary. Still needed:
Anthropic, PayHere, NextAuth secret, Resend, Upstash, Pinecone.
NOTE: the live DB password and Cloudinary secret were pasted in chat — rotate
them before production.

## Run

`npm run dev` (port 3000). `npm run build` to type-check + verify production build.
