// Revalidate the homepage every 5 minutes so new blog posts surface without a redeploy.
export const revalidate = 300;

import Hero from "@/components/home/Hero";
import HotProducts from "@/components/home/HotProducts";
import Offers from "@/components/home/Offers";
import OriginStory from "@/components/home/OriginStory";
import TrustStats from "@/components/home/TrustStats";
import Testimonials from "@/components/home/Testimonials";
import BlogPreview from "@/components/home/BlogPreview";
import Newsletter from "@/components/home/Newsletter";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://samadhirice.lk/#organization",
      name: "SamadhiRice.lk",
      url: "https://samadhirice.lk",
      description:
        "Single-origin Sri Lankan rice — Suwandel, Kalu Heenati, red raw rice and Keeri Samba — milled fresh from family paddy fields and delivered island-wide.",
      areaServed: "LK",
      address: {
        "@type": "PostalAddress",
        streetAddress: "No. 42, Negombo Road",
        addressLocality: "Wattala",
        addressCountry: "LK",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://samadhirice.lk/#website",
      url: "https://samadhirice.lk",
      name: "SamadhiRice.lk",
      publisher: { "@id": "https://samadhirice.lk/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://samadhirice.lk/shop?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <HotProducts />
      <Offers />
      <OriginStory />
      <TrustStats />
      <Testimonials />
      <BlogPreview />
      <Newsletter />
    </>
  );
}
