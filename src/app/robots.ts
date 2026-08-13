import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/seo";

const PRIVATE_PATHS = [
  "/admin",
  "/api",
  "/account",
  "/checkout",
  "/order",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: ["OAI-SearchBot", "ChatGPT-User"],
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
