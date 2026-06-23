import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

export const POSTS_PER_PAGE = 9;

export function readingTimeMin(html: string) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function excerptFrom(html: string, max = 180) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export const getPublishedPosts = unstable_cache(
  async ({ page = 1, q }: { page?: number; q?: string } = {}) => {
    const where: Prisma.BlogPostWhereInput = { published: true };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }
    const [total, posts] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * POSTS_PER_PAGE,
        take: POSTS_PER_PAGE,
      }),
    ]);
    return {
      posts,
      total,
      pages: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)),
      page,
    };
  },
  ["published-posts"],
  { revalidate: 300, tags: ["blog"] },
);

export const getLatestPosts = unstable_cache(
  async (take = 3) => prisma.blogPost.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take,
  }),
  ["latest-posts"],
  { revalidate: 300, tags: ["blog"] },
);

export const getPostBySlug = unstable_cache(
  async (slug: string) => prisma.blogPost.findUnique({ where: { slug } }),
  ["post-by-slug"],
  { revalidate: 300, tags: ["blog"] },
);

export const getRelatedPosts = unstable_cache(
  async (slug: string, take = 3) => prisma.blogPost.findMany({
    where: { published: true, slug: { not: slug } },
    orderBy: [{ publishedAt: "desc" }],
    take,
  }),
  ["related-posts"],
  { revalidate: 300, tags: ["blog"] },
);

/* ---- admin ---- */

export async function getAdminPosts() {
  return prisma.blogPost.findMany({
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getAdminPost(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}
