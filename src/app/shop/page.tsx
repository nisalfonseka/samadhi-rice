import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/shop/ProductCard";
import ShopControls from "@/components/shop/ShopControls";
import {
  getProducts,
  getCategoriesWithCounts,
  type ProductDTO,
  type ProductSort,
} from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop heritage Sri Lankan rice",
  description:
    "Browse single-origin Sri Lankan rice — Suwandel, Kalu Heenati, red raw rice, Keeri Samba and more. Filter by variety, price and weight. Milled to order, delivered island-wide.",
  alternates: { canonical: "/shop" },
};

function priceTokenToRange(token?: string): { minPrice?: number; maxPrice?: number } {
  switch (token) {
    case "lt300":
      return { maxPrice: 299 };
    case "300-400":
      return { minPrice: 300, maxPrice: 400 };
    case "gt400":
      return { minPrice: 401 };
    default:
      return {};
  }
}

type SearchParams = Promise<{
  category?: string;
  q?: string;
  sort?: string;
  price?: string;
}>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  let products: ProductDTO[] = [];
  let categories: { name: string; slug: string; count: number }[] = [];
  let dbError = false;

  try {
    const [prods, cats] = await Promise.all([
      getProducts({
        category: sp.category,
        q: sp.q,
        sort: (sp.sort as ProductSort) || "featured",
        ...priceTokenToRange(sp.price),
      }),
      getCategoriesWithCounts(),
    ]);
    products = prods;
    categories = cats.map((c) => ({
      name: c.name,
      slug: c.slug,
      count: c._count.products,
    }));
  } catch {
    dbError = true;
  }

  return (
    <div className="bg-paper min-h-screen">
      {/* page header — padded to clear the fixed site header */}
      <header className="mx-auto max-w-7xl px-5 pb-10 pt-32 sm:px-8 sm:pt-36">
        <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-husk-soft">
          <Link href="/" className="hover:text-paddy-700">Home</Link>
          <span aria-hidden>/</span>
          <span className="text-husk">Shop</span>
        </nav>
        <p className="kicker mb-3 text-clay-500">The full harvest</p>
        <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-medium text-husk">
          Every grain we mill
        </h1>
        <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-husk-soft">
          Single-origin Sri Lankan rice, milled to order and sealed fresh. Pick a
          variety, choose your weight, and we&apos;ll carry it to your kitchen.
        </p>
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <Suspense fallback={<div className="h-32" />}>
          <ShopControls categories={categories} total={products.length} />
        </Suspense>

        {dbError ? (
          <EmptyState
            title="Catalogue is warming up"
            body="The shop isn't connected to the database yet. Once the Supabase pooler connection is added and the seed is run, every variety will appear here."
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="No rice matched that"
            body="Try clearing a filter or searching a different variety."
          />
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-16 flex flex-col items-center rounded-3xl border border-husk/10 bg-rice-50 px-6 py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-paddy-800 text-harvest-300">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
          <path d="M8 16c-2-2-2-6 1-9s7-3 9-1c1 1-1 5-4 8s-5 3-6 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </span>
      <h2 className="mt-5 font-display text-2xl text-husk">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-husk-soft">{body}</p>
    </div>
  );
}
