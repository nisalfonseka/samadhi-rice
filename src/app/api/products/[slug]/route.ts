import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
