import { NextResponse } from "next/server";
import {
  getProducts,
  type ProductSort,
} from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

const SORTS: ProductSort[] = [
  "featured",
  "price-asc",
  "price-desc",
  "rating",
  "newest",
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sortParam = searchParams.get("sort");
  const min = searchParams.get("minPrice");
  const max = searchParams.get("maxPrice");

  try {
    const products = await getProducts({
      category: searchParams.get("category") || undefined,
      q: searchParams.get("q") || undefined,
      sort: SORTS.includes(sortParam as ProductSort)
        ? (sortParam as ProductSort)
        : "featured",
      minPrice: min ? Number(min) : undefined,
      maxPrice: max ? Number(max) : undefined,
    });
    const res = NextResponse.json({ products, count: products.length });
    // the underlying query is already unstable_cache'd (300s); let the CDN
    // edge absorb repeat requests for the same filter combo too
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res;
  } catch {
    return NextResponse.json(
      { error: "Database unavailable", products: [], count: 0 },
      { status: 503 },
    );
  }
}
