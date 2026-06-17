import { NextResponse } from "next/server";
import { getCategoriesWithCounts } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getCategoriesWithCounts();
    return NextResponse.json({
      categories: categories.map((c) => ({
        name: c.name,
        slug: c.slug,
        description: c.description,
        count: c._count.products,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Database unavailable", categories: [] },
      { status: 503 },
    );
  }
}
