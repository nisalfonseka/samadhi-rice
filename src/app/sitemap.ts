import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 300;

const staticRoutes: MetadataRoute.Sitemap = [
  { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
  { url: absoluteUrl("/shop"), changeFrequency: "daily", priority: 0.9 },
  { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.7 },
  { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.8 },
  { url: absoluteUrl("/branches"), changeFrequency: "weekly", priority: 0.7 },
  { url: absoluteUrl("/delivery"), changeFrequency: "weekly", priority: 0.7 },
  { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.6 },
  { url: absoluteUrl("/rice-finder"), changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    prisma.product
      .findMany({
        select: { slug: true, updatedAt: true, images: true },
        orderBy: { updatedAt: "desc" },
      })
      .catch(() => []),
    prisma.blogPost
      .findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true, coverImage: true },
        orderBy: { updatedAt: "desc" },
      })
      .catch(() => []),
  ]);

  return [
    ...staticRoutes,
    ...products.map((product) => ({
      url: absoluteUrl(`/shop/${product.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: product.images,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: post.coverImage ? [post.coverImage] : undefined,
    })),
  ];
}
