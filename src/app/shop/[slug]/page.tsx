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
import { priceFor } from "@/lib/pricing";
import JsonLd from "@/components/seo/JsonLd";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  cleanPageTitle,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

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
  if (!product) return { title: "Rice not found", robots: { index: false } };
  const title = cleanPageTitle(product.metaTitle ?? product.name);
  const description =
    product.metaDescription ??
    product.note ??
    `Shop ${product.name} from SamadhiRice.lk, with delivery across Sri Lanka.`;
  return {
    title,
    description,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/shop/${slug}`,
      images: product.images.length ? product.images : ["/opengraph-image"],
    },
    twitter: {
      card: product.images.length ? "summary_large_image" : "summary",
      title,
      description,
      images: product.images.length ? product.images : ["/opengraph-image"],
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

  const productUrl = absoluteUrl(`/shop/${product.slug}`);
  const publishedReviewCount = product.reviews.length;
  const publishedRating = publishedReviewCount
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      publishedReviewCount
    : 0;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        url: productUrl,
        name: product.name,
        alternateName: product.sinhala || undefined,
        image: product.images.length ? product.images : undefined,
        description:
          product.description ??
          product.note ??
          `Buy ${product.name} online from ${SITE_NAME}.`,
        category: product.category?.name,
        brand: { "@type": "Brand", name: SITE_NAME },
        additionalProperty: [
          product.variety
            ? {
                "@type": "PropertyValue",
                name: "Rice variety",
                value: product.variety,
              }
            : undefined,
          product.origin
            ? {
                "@type": "PropertyValue",
                name: "Origin",
                value: product.origin,
              }
            : undefined,
        ].filter(Boolean),
        offers: {
          "@type": "Offer",
          priceCurrency: "LKR",
          price: priceFor(product.pricePerKg, 1, product.discountPercent ?? 0),
          availability:
            product.stockKg > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          url: productUrl,
          seller: { "@id": `${SITE_URL}/#organization` },
        },
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        { name: product.name, path: `/shop/${product.slug}` },
      ]),
    ],
  };

  return (
    <div className="bg-paper min-h-screen">
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-[6.75rem] sm:px-8 sm:pb-24 sm:pt-36">
        {/* breadcrumb */}
        <nav className="mb-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.62rem] uppercase tracking-[0.18em] text-husk-soft sm:mb-8 sm:gap-2 sm:text-xs sm:tracking-widest">
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

        <div className="grid gap-6 sm:gap-10 lg:grid-cols-2 lg:gap-16">
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
              <p className="text-[0.8rem] font-semibold text-clay-500 sm:text-[0.98rem]">
                {product.variety}
              </p>
            )}
            <div className="mt-1 flex items-start justify-between gap-3 sm:mt-2 sm:gap-4">
              <h1 className="font-display text-[1.7rem] font-medium leading-tight text-husk sm:text-[clamp(2.2rem,4vw,3.2rem)]">
                {product.name}
              </h1>
              {product.sinhala && (
                <span className="mt-1 shrink-0 font-[var(--font-sinhala)] text-lg text-clay-500 sm:mt-2 sm:text-2xl">
                  {product.sinhala}
                </span>
              )}
            </div>

            {publishedReviewCount > 0 && (
              <div className="mt-2 flex items-center gap-2 text-[0.8rem] sm:mt-3 sm:gap-3 sm:text-sm">
                <span
                  className="flex items-center gap-1 text-harvest-500"
                  aria-label={`${publishedRating.toFixed(1)} out of 5`}
                >
                  {"★★★★★".slice(0, Math.round(publishedRating))}
                  <span className="font-semibold text-husk">
                    {publishedRating.toFixed(1)}
                  </span>
                </span>
                <span className="text-husk-soft">
                  · {publishedReviewCount} {publishedReviewCount === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}

            {product.description && (
              <p className="mt-4 text-[0.9rem] leading-relaxed text-husk-soft sm:mt-6 sm:text-[1.02rem]">
                {product.description}
              </p>
            )}

            <div className="mt-6 sm:mt-8">
              <ProductBuyPanel
                slug={product.slug}
                name={product.name}
                pricePerKg={product.pricePerKg}
                stockKg={product.stockKg}
                discountPercent={product.discountPercent ?? 0}
              />
            </div>

            {product.cookingTips && (
              <div className="mt-6 rounded-2xl border border-clay-400/30 bg-rice-100/60 p-4 sm:mt-8 sm:p-5">
                <h3 className="font-display text-base text-husk sm:text-lg">How to cook it</h3>
                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-husk-soft sm:mt-2 sm:text-sm">
                  {product.cookingTips}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* reviews */}
        {product.reviews.length > 0 && (
          <section className="mt-12 sm:mt-20">
            <h2 className="font-display text-xl text-husk sm:text-2xl">What buyers say</h2>
            <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {product.reviews.slice(0, 6).map((r) => (
                <figure key={r.id} className="rounded-3xl border border-husk/10 bg-rice-50 p-4 sm:p-6">
                  <div className="flex items-center gap-1 text-harvest-500" aria-label={`${r.rating} out of 5`}>
                    {"★★★★★".slice(0, r.rating)}
                  </div>
                  {r.comment && (
                    <blockquote className="mt-2 text-[0.86rem] leading-relaxed text-husk sm:mt-3 sm:text-[0.98rem]">
                      “{r.comment}”
                    </blockquote>
                  )}
                  <figcaption className="mt-3 text-[0.78rem] text-husk-soft sm:mt-4 sm:text-sm">
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
          <section className="mt-12 sm:mt-20">
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-display text-xl text-husk sm:text-2xl">You might also like</h2>
              <Link href="/shop" className="shrink-0 text-[0.7rem] font-semibold uppercase tracking-widest text-paddy-700 hover:text-paddy-900 sm:text-sm">
                All rice →
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 min-[560px]:grid-cols-3 sm:mt-6 sm:gap-6 xl:grid-cols-4">
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
