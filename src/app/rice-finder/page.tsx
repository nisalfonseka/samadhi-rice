import type { Metadata } from "next";
import { getAssistantConfig } from "@/lib/services/assistant.service";
import { getProducts } from "@/lib/services/product.service";
import RiceFinderChat from "@/components/chat/RiceFinderChat";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sri Lankan Rice Finder",
  description:
    "Chat with our AI assistant to find the perfect Sri Lankan rice for your cooking style, health needs, and budget.",
  alternates: { canonical: "/rice-finder" },
  openGraph: {
    type: "website",
    title: "Find the right Sri Lankan rice for your meal",
    description:
      "Compare rice varieties by dish, texture, preference and budget with the Samadhi Rice Finder.",
    url: "/rice-finder",
    locale: "en_LK",
    siteName: SITE_NAME,
    images: [DEFAULT_OG_IMAGE],
  },
};

export const dynamic = "force-dynamic";

export default async function RiceFinderPage() {
  const [config, products] = await Promise.all([
    getAssistantConfig(),
    getProducts({}).catch(() => []),
  ]);

  return (
    <RiceFinderChat
      greeting={config.greeting}
      suggestions={config.suggestions}
      products={products}
      enabled={config.enabled}
    />
  );
}
