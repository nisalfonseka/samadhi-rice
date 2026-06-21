"use client";

import { useState } from "react";
import Link from "next/link";
import RiceBag from "@/components/shop/RiceBag";
import { useCart } from "@/providers/CartProvider";
import { priceFor, formatLKR } from "@/lib/pricing";
import type { ProductDTO } from "@/lib/services/product.service";
import { cn } from "@/lib/utils";

/** Compact product card rendered inline inside the chat. */
export default function ChatProductCard({ product }: { product: ProductDTO }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const price = priceFor(product.pricePerKg, 1, product.discountPercent);
  const soldOut = product.stockKg <= 0;

  const handleAdd = () => {
    if (soldOut) return;
    add({ slug: product.slug, name: product.name, weight: 1, price });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="my-1.5 flex items-center gap-3 rounded-2xl border border-husk/12 bg-rice-50 p-2.5 shadow-[0_8px_22px_-16px_rgba(34,31,23,0.5)]">
      <Link
        href={`/shop/${product.slug}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-rice-100">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
          ) : (
            <RiceBag
              id={`chat-${product.slug}`}
              light={product.grain.light}
              mid={product.grain.mid}
              dark={product.grain.dark}
              sinhala={product.sinhala}
              className="h-12 w-12"
            />
          )}
        </span>
        <span className="min-w-0">
          {product.variety && (
            <span className="block truncate text-[0.6rem] font-semibold uppercase tracking-wider text-clay-500">
              {product.variety}
            </span>
          )}
          <span className="block truncate font-display text-[0.95rem] leading-tight text-husk">
            {product.name}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-paddy-800">{formatLKR(price)}</span>
            <span className="text-husk-soft">/kg</span>
            {product.discountPercent > 0 && (
              <span className="rounded-full bg-clay-500/15 px-1.5 text-[0.6rem] font-semibold text-clay-600">
                −{product.discountPercent}%
              </span>
            )}
          </span>
        </span>
      </Link>

      <button
        onClick={handleAdd}
        disabled={soldOut}
        aria-label={`Add ${product.name} to cart`}
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full text-rice-50 transition-colors",
          soldOut ? "cursor-not-allowed bg-husk/25" : added ? "bg-paddy-600" : "bg-paddy-800 hover:bg-paddy-700",
        )}
      >
        {added ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path d="m5 12.5 4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
