import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/services/settings.service";
import { formatLKR } from "@/lib/pricing";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Rice Delivery in Sri Lanka",
  description:
    "Check SamadhiRice.lk delivery areas, charges, free-delivery threshold and payment options before ordering rice online.",
  alternates: { canonical: "/delivery" },
  openGraph: {
    type: "website",
    title: "Samadhi Rice delivery information",
    description:
      "Current delivery areas, charges and ordering information for SamadhiRice.lk customers.",
    url: "/delivery",
    locale: "en_LK",
    siteName: SITE_NAME,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function DeliveryPage() {
  const settings = await getSettings();
  const zones = settings.deliveryZones
    .split(/\r?\n/)
    .map((zone) => zone.trim())
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${absoluteUrl("/delivery")}#page`,
        url: absoluteUrl("/delivery"),
        name: "Samadhi Rice delivery information",
        description:
          "Current delivery areas, charges and payment information for SamadhiRice.lk orders.",
        inLanguage: "en-LK",
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Delivery", path: "/delivery" },
      ]),
    ],
  };

  return (
    <main className="min-h-screen bg-rice-50 pb-24 pt-32 sm:pt-40">
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-husk-soft">
          <Link href="/" className="hover:text-paddy-700">Home</Link>
          <span aria-hidden>/</span>
          <span className="text-husk">Delivery</span>
        </nav>

        <header className="max-w-3xl">
          <p className="kicker mb-3 text-clay-500">Before you order</p>
          <h1 className="font-display text-[clamp(2.3rem,6vw,4.5rem)] font-medium leading-tight text-husk">
            Rice delivery, clearly explained.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-husk-soft">
            Review the currently configured delivery areas and charges below.
            We confirm order and timing details using the contact information you
            provide at checkout.
          </p>
        </header>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <section className="rounded-3xl border border-husk/10 bg-white p-6 sm:p-8">
            <p className="kicker text-clay-500">Delivery charge</p>
            <h2 className="mt-3 font-display text-2xl text-husk">
              {formatLKR(settings.deliveryFeeFlat)} flat rate
            </h2>
            {settings.freeDeliveryEnabled ? (
              <p className="mt-3 leading-relaxed text-husk-soft">
                Delivery is free when your basket reaches {formatLKR(settings.freeDeliveryThreshold)}.
                The checkout calculates the applicable amount automatically.
              </p>
            ) : (
              <p className="mt-3 leading-relaxed text-husk-soft">
                The current flat delivery charge is shown in your order summary before you place the order.
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-husk/10 bg-white p-6 sm:p-8">
            <p className="kicker text-clay-500">Payment</p>
            <h2 className="mt-3 font-display text-2xl text-husk">Available at checkout</h2>
            <ul className="mt-3 space-y-2 text-husk-soft">
              {settings.codEnabled && <li>Cash on delivery</li>}
              {settings.payhereEnabled && <li>Online payment through PayHere</li>}
              {!settings.codEnabled && !settings.payhereEnabled && (
                <li>Please contact us to confirm the available payment method.</li>
              )}
            </ul>
          </section>
        </div>

        <section className="mt-5 rounded-3xl border border-husk/10 bg-rice-100 p-6 sm:p-8">
          <p className="kicker text-clay-500">Current delivery areas</p>
          <h2 className="mt-3 font-display text-2xl text-husk">Where we deliver</h2>
          {zones.length ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {zones.map((zone) => (
                <li
                  key={zone}
                  className="rounded-2xl border border-husk/10 bg-white px-4 py-3 text-husk"
                >
                  {zone}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-husk-soft">
              Contact the team with your town or district to confirm delivery availability.
            </p>
          )}
        </section>

        <section className="mt-12 rounded-3xl bg-paddy-950 px-6 py-10 text-center sm:px-10 sm:py-12">
          <h2 className="font-display text-3xl text-rice-50">Ready to choose your rice?</h2>
          <p className="mx-auto mt-3 max-w-xl text-rice-100/70">
            Browse the current range, or ask us about delivery to an area that is not listed.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-harvest-500 px-7 py-3 font-medium text-paddy-950 hover:bg-harvest-400"
            >
              Shop rice
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-rice-50/25 px-7 py-3 font-medium text-rice-50 hover:border-harvest-400"
            >
              Ask about delivery
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
