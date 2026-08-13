// Revalidate the homepage every 5 minutes so new blog posts surface without a redeploy.
export const revalidate = 300;

import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import HotProducts from "@/components/home/HotProducts";
import Offers from "@/components/home/Offers";
import OriginStory from "@/components/home/OriginStory";
import TrustStats from "@/components/home/TrustStats";
import Testimonials from "@/components/home/Testimonials";
import type { HomepageReview } from "@/components/home/Testimonials";
import BlogPreview from "@/components/home/BlogPreview";
import Newsletter from "@/components/home/Newsletter";
import { getSettings } from "@/lib/services/settings.service";
import { prisma } from "@/lib/db";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [s, primaryBranch, catalogueFacts, homepageReviews] = await Promise.all([
    getSettings(),
    prisma.branch
      .findFirst({ orderBy: { position: "asc" } })
      .catch(() => null),
    Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.branch.count(),
    ])
      .then(([products, categories, branches]) => ({
        products,
        categories,
        branches,
      }))
      .catch(() => ({ products: 0, categories: 0, branches: 0 })),
    prisma.review
      .findMany({
        where: { approved: true, comment: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { product: { select: { name: true } } },
      })
      .then((reviews): HomepageReview[] =>
        reviews
          .filter((review) => Boolean(review.comment))
          .map((review) => ({
            id: review.id,
            name: review.authorName,
            place: review.place || "Sri Lanka",
            quote: review.comment || "",
            rating: review.rating,
            product: review.product.name,
          })),
      )
      .catch(() => []),
  ]);

  const deliveryAreaCount = s.deliveryZones
    .split(/\r?\n/)
    .map((zone) => zone.trim())
    .filter(Boolean).length;
  const trustStats = [
    { value: catalogueFacts.products, label: "Rice products currently listed" },
    { value: catalogueFacts.categories, label: "Rice categories to browse" },
    { value: catalogueFacts.branches, label: "Branch locations published" },
    { value: deliveryAreaCount, label: "Configured delivery areas" },
  ];

  const sameAs = [
    s.socialFacebook,
    s.socialInstagram,
    s.socialYoutube,
    s.socialTiktok,
  ].filter(Boolean);

  const organization = {
    "@type": "OnlineStore",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "Samadhi Rice",
    url: SITE_URL,
    logo: absoluteUrl("/samadhiricelogo.png"),
    image: absoluteUrl("/opengraph-image"),
    description: s.metaDescription || DEFAULT_DESCRIPTION,
    email: s.contactEmail || undefined,
    telephone: s.contactPhone || undefined,
    areaServed: { "@type": "Country", name: "Sri Lanka" },
    address: primaryBranch
      ? {
          "@type": "PostalAddress",
          streetAddress: primaryBranch.address,
          addressLocality: primaryBranch.city,
          addressCountry: "LK",
        }
      : undefined,
    contactPoint:
      s.contactPhone || s.contactEmail
        ? {
            "@type": "ContactPoint",
            telephone: s.contactPhone || undefined,
            email: s.contactEmail || undefined,
            contactType: "customer service",
            areaServed: "LK",
            availableLanguage: ["English", "Sinhala"],
          }
        : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "en-LK",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${absoluteUrl("/shop")}?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero />
      {s.sectionHotProducts && <HotProducts />}
      {s.sectionOffers && <Offers />}
      {s.sectionOriginStory && <OriginStory />}
      {s.sectionTrustStats && <TrustStats stats={trustStats} />}
      {s.sectionTestimonials && homepageReviews.length > 0 && (
        <Testimonials reviews={homepageReviews} />
      )}
      {s.sectionBlogPreview && <BlogPreview />}
      {s.sectionNewsletter && <Newsletter />}
    </>
  );
}
