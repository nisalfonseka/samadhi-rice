import type { Metadata } from "next";
import { getAssistantConfig } from "@/lib/services/assistant.service";
import { getProducts } from "@/lib/services/product.service";
import RiceFinderChat from "@/components/chat/RiceFinderChat";

export const metadata: Metadata = {
  title: "Rice Finder",
  description:
    "Chat with our AI assistant to find the perfect Sri Lankan rice for your cooking style, health needs, and budget.",
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
