import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductGallery from "@/components/shop/ProductGallery";
import ProductBuyPanel from "@/components/shop/ProductBuyPanel";
import ProductCard from "@/components/shop/ProductCard";
import { cache } from "react";
import {
  getProductBySlug as _getProductBySlug,
  getRelatedProducts,
} from "@/lib/services/product.service";
import { priceFor, formatLKR } from "@/lib/pricing";

export const revalidate = 60;

// Deduplicate within a single render — generateMetadata + page both call this
const getProductBySlug = cache(_getProductBySlug);

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: "Rice not found" };
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.note ?? undefined,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: {
      title: product.name,
      description: product.note ?? undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;

  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) notFound();

  const related = await getRelatedProducts(
    product.slug,
    product.categoryId,
  ).catch(() => []);

  const grain = {
    light: product.grainLight ?? "#f3ead4",
    mid: product.grainMid ?? "#e3d2a6",
    dark: product.grainDark ?? "#c7ad70",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.note ?? undefined,
    category: product.category?.name,
    brand: { "@type": "Brand", name: "SamadhiRice.lk" },
    aggregateRating:
      product.reviewsCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewsCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "LKR",
      price: priceFor(product.pricePerKg, 1, product.discountPercent ?? 0),
      availability:
        product.stockKg > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `https://samadhirice.lk/shop/${product.slug}`,
    },
  };

  return (
    <div className="bg-paper min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-36">
        {/* breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-husk-soft">
          <Link href="/" className="hover:text-paddy-700">Home</Link>
          <span aria-hidden>/</span>
          <Link href="/shop" className="hover:text-paddy-700">Shop</Link>
          {product.category && (
            <>
              <span aria-hidden>/</span>
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-paddy-700">
                {product.category.name}
              </Link>
            </>
          )}
          <span aria-hidden>/</span>
          <span className="text-husk">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* art */}
          <ProductGallery
            images={product.images}
            name={product.name}
            badge={product.badge}
            origin={product.origin}
            grain={grain}
            sinhala={product.sinhala}
            slug={product.slug}
          />

          {/* details */}
          <div className="flex flex-col">
            {product.variety && (
              <p className="text-[0.98rem] font-semibold text-clay-500">
                {product.variety}
              </p>
            )}
            <div className="mt-2 flex items-start justify-between gap-4">
              <h1 className="font-display text-[clamp(2.2rem,4vw,3.2rem)] font-medium leading-tight text-husk">
                {product.name}
              </h1>
              {product.sinhala && (
                <span className="mt-2 shrink-0 font-[var(--font-sinhala)] text-2xl text-clay-500">
                  {product.sinhala}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-harvest-500" aria-label={`${product.rating} out of 5`}>
                {"★★★★★".slice(0, Math.round(product.rating))}
                <span className="font-semibold text-husk">{product.rating}</span>
              </span>
              <span className="text-husk-soft">· {product.reviewsCount} reviews</span>
            </div>

            {product.description && (
              <p className="mt-6 text-[1.02rem] leading-relaxed text-husk-soft">
                {product.description}
              </p>
            )}

            <div className="mt-8">
              <ProductBuyPanel
                slug={product.slug}
                name={product.name}
                pricePerKg={product.pricePerKg}
                stockKg={product.stockKg}
                discountPercent={product.discountPercent ?? 0}
              />
            </div>

            {product.cookingTips && (
              <div className="mt-8 rounded-2xl border border-clay-400/30 bg-rice-100/60 p-5">
                <h3 className="font-display text-lg text-husk">How to cook it</h3>
                <p className="mt-2 text-sm leading-relaxed text-husk-soft">
                  {product.cookingTips}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* reviews */}
        {product.reviews.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl text-husk">What buyers say</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {product.reviews.slice(0, 6).map((r) => (
                <figure key={r.id} className="rounded-3xl border border-husk/10 bg-rice-50 p-6">
                  <div className="flex items-center gap-1 text-harvest-500" aria-label={`${r.rating} out of 5`}>
                    {"★★★★★".slice(0, r.rating)}
                  </div>
                  {r.comment && (
                    <blockquote className="mt-3 text-[0.98rem] leading-relaxed text-husk">
                      “{r.comment}”
                    </blockquote>
                  )}
                  <figcaption className="mt-4 text-sm text-husk-soft">
                    {r.authorName}
                    {r.place ? ` · ${r.place}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* related */}
        {related.length > 0 && (
          <section className="mt-20">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl text-husk">You might also like</h2>
              <Link href="/shop" className="text-sm font-semibold uppercase tracking-widest text-paddy-700 hover:text-paddy-900">
                All rice →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 min-[450px]:grid-cols-3 sm:gap-6 xl:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
