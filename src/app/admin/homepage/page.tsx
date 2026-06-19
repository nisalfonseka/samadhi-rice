import Link from "next/link";
import { prisma } from "@/lib/db";
import { getEnabledOffers, getAllOffers } from "@/lib/services/offer.service";
import { getSettings } from "@/lib/services/settings.service";
import ProductHomepageRow from "@/components/admin/ProductHomepageRow";
import SectionToggleRow from "@/components/admin/SectionToggleRow";

export const dynamic = "force-dynamic";

export default async function AdminHomepageEditor() {
  const [settings, allOffers, enabledOffers, products] = await Promise.all([
    getSettings(),
    getAllOffers(),
    getEnabledOffers(),
    prisma.product.findMany({
      orderBy: [{ featured: "desc" }, { hotDeal: "desc" }, { name: "asc" }],
    }),
  ]);

  const hotDealCount = products.filter((p) => p.hotDeal || p.discountPercent > 0).length;
  const featuredCount = products.filter((p) => p.featured).length;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-husk">Homepage</h1>
        <p className="mt-1 text-husk-soft">
          Control everything visitors see on the storefront homepage.
        </p>
      </header>

      {/* hero */}
      <section className="mb-8 rounded-2xl border border-husk/10 bg-rice-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-husk">Hero headline</h2>
            <p className="mt-1 text-husk-soft">{settings.heroHeadline}</p>
          </div>
          <Link
            href="/admin/settings"
            className="rounded-full border border-husk/15 px-4 py-2 text-sm font-medium text-husk hover:border-paddy-600"
          >
            Edit in Settings
          </Link>
        </div>
      </section>

      {/* products */}
      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-husk">Products on the homepage</h2>
            <p className="text-sm text-husk-soft">
              <strong className="text-husk">{featuredCount}</strong> featured ·{" "}
              <strong className="text-husk">{hotDealCount}</strong> in Hot Deals carousel
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="rounded-full bg-paddy-800 px-4 py-2 text-sm font-medium text-rice-50 hover:bg-paddy-900"
          >
            + New product
          </Link>
        </div>
        <ul className="space-y-2.5">
          {products.map((p) => (
            <ProductHomepageRow
              key={p.id}
              product={{
                id: p.id,
                slug: p.slug,
                name: p.name,
                pricePerKg: p.pricePerKg,
                featured: p.featured,
                hotDeal: p.hotDeal,
                grainMid: p.grainMid,
                stockKg: p.stockKg,
              }}
            />
          ))}
        </ul>
      </section>

      {/* sections */}
      <section className="mb-8">
        <div className="mb-3">
          <h2 className="font-display text-2xl text-husk">Page sections</h2>
          <p className="text-sm text-husk-soft">
            Toggle sections on or off. The Hero is always visible.
          </p>
        </div>
        <ul className="space-y-2">
          <SectionToggleRow
            settingKey="section_hot_products"
            label="Hot Products"
            description="Featured products grid below the hero."
            enabled={settings.sectionHotProducts}
          />
          <SectionToggleRow
            settingKey="section_offers"
            label="Offers & Hot Deals"
            description="Promotional offer cards + hot deals carousel."
            enabled={settings.sectionOffers}
          />
          <SectionToggleRow
            settingKey="section_origin_story"
            label="Origin Story"
            description="Pinned scroll section about the paddy field journey."
            enabled={settings.sectionOriginStory}
          />
          <SectionToggleRow
            settingKey="section_trust_stats"
            label="Trust Stats"
            description="Counters — kitchens served, years milling, varieties, etc."
            enabled={settings.sectionTrustStats}
          />
          <SectionToggleRow
            settingKey="section_testimonials"
            label="Testimonials"
            description="Customer review quotes carousel."
            enabled={settings.sectionTestimonials}
          />
          <SectionToggleRow
            settingKey="section_blog_preview"
            label="Blog Preview"
            description="Latest recipes and articles teaser."
            enabled={settings.sectionBlogPreview}
          />
          <SectionToggleRow
            settingKey="section_newsletter"
            label="Newsletter"
            description="Email sign-up banner at the bottom."
            enabled={settings.sectionNewsletter}
          />
        </ul>
      </section>

      {/* offers */}
      <section className="rounded-2xl border border-husk/10 bg-rice-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-husk">Offers</h2>
            <p className="mt-1 text-husk-soft">
              <strong className="text-husk">{enabledOffers.length}</strong> active out of{" "}
              {allOffers.length}.
            </p>
          </div>
          <Link
            href="/admin/offers"
            className="rounded-full bg-paddy-800 px-4 py-2 text-sm font-medium text-rice-50 hover:bg-paddy-900"
          >
            Manage offers →
          </Link>
        </div>
        {enabledOffers.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm text-husk-soft">
            {enabledOffers.slice(0, 4).map((o) => (
              <li key={o.id}>
                <span className="font-medium text-husk">{o.title}</span> · {o.eyebrow}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
