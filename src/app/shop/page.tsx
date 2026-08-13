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

export const revalidate = 60;

const SHOP_DESCRIPTION =
  "Browse Sri Lankan rice including Suwandel, Kalu Heenati, red raw rice, Keeri Samba and more, with island-wide delivery.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const isSearch = Boolean(sp.q?.trim());

  return {
    title: "Shop heritage Sri Lankan rice",
    description: SHOP_DESCRIPTION,
    alternates: { canonical: "/shop" },
    robots: isSearch ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      title: "Buy Sri Lankan rice online",
      description: SHOP_DESCRIPTION,
      url: "/shop",
      images: ["/opengraph-image"],
    },
  };
}

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
      <header className="mx-auto max-w-7xl px-4 pb-4 pt-[6.75rem] sm:px-8 sm:pb-10 sm:pt-36">
        <nav className="mb-2 flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-husk-soft sm:mb-6 sm:gap-2 sm:text-xs sm:tracking-widest">
          <Link href="/" className="hover:text-paddy-700">Home</Link>
          <span aria-hidden>/</span>
          <span className="text-husk">Shop</span>
        </nav>
        <h1 className="font-display text-[1.6rem] font-medium leading-[1.12] text-husk sm:text-[clamp(2.2rem,5vw,3.6rem)] sm:leading-[1.04]">
          Buy heritage Sri Lankan rice
        </h1>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-8 sm:pb-24">
        <Suspense fallback={<div className="h-28 sm:h-32" />}>
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
          <div className="mt-5 grid grid-cols-2 gap-3 min-[560px]:grid-cols-3 sm:mt-12 sm:gap-6 xl:grid-cols-4">
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
    <div className="mt-6 flex flex-col items-center rounded-3xl border border-husk/10 bg-rice-50 px-5 py-12 text-center sm:mt-16 sm:px-6 sm:py-20">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-paddy-800 text-harvest-300 sm:h-14 sm:w-14">
        <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-7 sm:w-7" fill="none" aria-hidden>
          <path d="M8 16c-2-2-2-6 1-9s7-3 9-1c1 1-1 5-4 8s-5 3-6 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </span>
      <h2 className="mt-4 font-display text-lg text-husk sm:mt-5 sm:text-2xl">{title}</h2>
      <p className="mt-1.5 max-w-md text-[0.82rem] text-husk-soft sm:mt-2 sm:text-sm">{body}</p>
    </div>
  );
}
