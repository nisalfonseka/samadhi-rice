import { NextResponse } from "next/server";
import { getCategoriesWithCounts } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getCategoriesWithCounts();
    const res = NextResponse.json({
      categories: categories.map((c) => ({
        name: c.name,
        slug: c.slug,
        description: c.description,
        count: c._count.products,
      })),
    });
    // categories change rarely — safe to let the CDN hold this longer
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res;
  } catch {
    return NextResponse.json(
      { error: "Database unavailable", categories: [] },
      { status: 503 },
    );
  }
}
