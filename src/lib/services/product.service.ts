import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

export type ProductSort =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "newest";

export type ProductFilters = {
  category?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
};

/** Plain, serializable shape passed from server components into client cards. */
export type ProductDTO = {
  slug: string;
  name: string;
  sinhala: string | null;
  variety: string | null;
  note: string | null;
  origin: string | null;
  badge: string | null;
  rating: number;
  reviewsCount: number;
  pricePerKg: number;
  stockKg: number;
  weights: number[];
  discountPercent: number;
  hotDeal: boolean;
  grain: { light: string; mid: string; dark: string };
  images: string[];
  category: { name: string; slug: string } | null;
};

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

const DEFAULT_GRAIN = { light: "#f3ead4", mid: "#e3d2a6", dark: "#c7ad70" };

export function toProductDTO(p: ProductWithCategory): ProductDTO {
  return {
    slug: p.slug,
    name: p.name,
    sinhala: p.sinhala,
    variety: p.variety,
    note: p.note,
    origin: p.origin,
    badge: p.badge,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    pricePerKg: p.pricePerKg,
    stockKg: p.stockKg,
    weights: p.weights.length ? p.weights : [1, 5, 10, 25],
    discountPercent: p.discountPercent ?? 0,
    hotDeal: p.hotDeal ?? false,
    grain: {
      light: p.grainLight ?? DEFAULT_GRAIN.light,
      mid: p.grainMid ?? DEFAULT_GRAIN.mid,
      dark: p.grainDark ?? DEFAULT_GRAIN.dark,
    },
    images: p.images ?? [],
    category: p.category
      ? { name: p.category.name, slug: p.category.slug }
      : null,
  };
}

const ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> = {
  featured: [{ featured: "desc" }, { reviewsCount: "desc" }],
  "price-asc": [{ pricePerKg: "asc" }],
  "price-desc": [{ pricePerKg: "desc" }],
  rating: [{ rating: "desc" }],
  newest: [{ createdAt: "desc" }],
};

export const getProducts = unstable_cache(
  async (filters: ProductFilters = {}): Promise<ProductDTO[]> => {
    const where: Prisma.ProductWhereInput = {};

    if (filters.category) where.category = { slug: filters.category };

    if (filters.q) {
      const q = filters.q.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { variety: { contains: q, mode: "insensitive" } },
        { note: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { sinhala: { contains: q } },
      ];
    }

    if (filters.minPrice != null || filters.maxPrice != null) {
      where.pricePerKg = {
        gte: filters.minPrice ?? undefined,
        lte: filters.maxPrice ?? undefined,
      };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: ORDER_BY[filters.sort ?? "featured"],
      include: { category: true },
    });

    return products.map(toProductDTO);
  },
  ["products"],
  { revalidate: 300, tags: ["products"] },
);

export const getFeaturedProducts = unstable_cache(
  async (limit = 4): Promise<ProductDTO[]> => {
    const products = await prisma.product.findMany({
      where: { featured: true },
      orderBy: { reviewsCount: "desc" },
      take: limit,
      include: { category: true },
    });
    return products.map(toProductDTO);
  },
  ["featured-products"],
  { revalidate: 300, tags: ["products"] },
);

export const getHotDealProducts = unstable_cache(
  async (limit = 8): Promise<ProductDTO[]> => {
    const products = await prisma.product.findMany({
      where: {
        OR: [{ hotDeal: true }, { discountPercent: { gt: 0 } }],
      },
      orderBy: [{ discountPercent: "desc" }, { reviewsCount: "desc" }],
      take: limit,
      include: { category: true },
    });
    return products.map(toProductDTO);
  },
  ["hot-deal-products"],
  { revalidate: 300, tags: ["products"] },
);

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getRelatedProducts(
  slug: string,
  categoryId: string | null,
  limit = 4,
): Promise<ProductDTO[]> {
  const products = await prisma.product.findMany({
    where: { slug: { not: slug }, ...(categoryId ? { categoryId } : {}) },
    orderBy: [{ featured: "desc" }, { reviewsCount: "desc" }],
    take: limit,
    include: { category: true },
  });
  return products.map(toProductDTO);
}

export async function getCategoriesWithCounts() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export function getPriceBounds() {
  return prisma.product.aggregate({
    _min: { pricePerKg: true },
    _max: { pricePerKg: true },
  });
}
