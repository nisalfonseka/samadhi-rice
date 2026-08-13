// Production permanently redirects the apex domain to `www`, so every
// canonical, sitemap entry and entity ID must use this single public origin.
export const SITE_URL = "https://www.samadhirice.lk";

export const SITE_NAME = "SamadhiRice.lk";
export const DEFAULT_DESCRIPTION =
  "Shop Sri Lankan rice including Suwandel, Kalu Heenati, red raw rice and Keeri Samba, with current prices, pack sizes and delivery information.";

export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "SamadhiRice.lk heritage and everyday Sri Lankan rice",
};

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function cleanPageTitle(title: string) {
  return title
    .replace(/\s*[|·—-]\s*SamadhiRice\.lk\s*$/i, "")
    .trim();
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
