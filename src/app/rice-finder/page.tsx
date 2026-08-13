import type { Metadata } from "next";
import { getAssistantConfig } from "@/lib/services/assistant.service";
import { getProducts } from "@/lib/services/product.service";
import RiceFinderChat from "@/components/chat/RiceFinderChat";

export const metadata: Metadata = {
  title: "Sri Lankan Rice Finder",
  description:
    "Chat with our AI assistant to find the perfect Sri Lankan rice for your cooking style, health needs, and budget.",
  alternates: { canonical: "/rice-finder" },
  openGraph: {
    title: "Find the right Sri Lankan rice for your meal",
    description:
      "Compare rice varieties by dish, texture, preference and budget with the Samadhi Rice Finder.",
    url: "/rice-finder",
    images: ["/opengraph-image"],
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
