import { getProducts } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return Response.json({ products: [] });

  try {
    const all = await getProducts({ q, sort: "featured" });
    return Response.json({ products: all.slice(0, 7) });
  } catch {
    return Response.json({ products: [] });
  }
}
