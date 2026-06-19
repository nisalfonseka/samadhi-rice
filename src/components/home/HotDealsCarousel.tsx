"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import RiceBag from "@/components/shop/RiceBag";
import PriceBlock from "@/components/shop/PriceBlock";
import { useCart } from "@/providers/CartProvider";
import { priceFor, type WeightKg } from "@/lib/pricing";
import type { ProductDTO } from "@/lib/services/product.service";
import { cn } from "@/lib/utils";

export default function HotDealsCarousel({ products }: { products: ProductDTO[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = () => {
    const el = rail.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  useEffect(() => {
    updateEdges();
    const el = rail.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      ro.disconnect();
    };
  }, []);

  const nudge = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <div className="relative">
      {/* controls */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-rice-100/70">
          Limited time · {products.length} {products.length === 1 ? "deal" : "deals"}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => nudge(-1)}
            disabled={atStart}
            aria-label="Previous deals"
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full border border-rice-50/30 text-rice-100 transition-all duration-300",
              atStart ? "opacity-30" : "hover:border-harvest-400 hover:bg-harvest-500 hover:text-paddy-950",
            )}
          >
            ←
          </button>
          <button
            onClick={() => nudge(1)}
            disabled={atEnd}
            aria-label="Next deals"
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full border border-rice-50/30 text-rice-100 transition-all duration-300",
              atEnd ? "opacity-30" : "hover:border-harvest-400 hover:bg-harvest-500 hover:text-paddy-950",
            )}
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={rail}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {products.map((p) => (
          <DealCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}

function DealCard({ product }: { product: ProductDTO }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const weight: WeightKg = 5;
  const price = priceFor(product.pricePerKg, weight, product.discountPercent);

  const handleAdd = () => {
    add({ slug: product.slug, name: product.name, weight, price });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="w-[19rem] shrink-0 snap-start px-1 sm:w-[20rem]">
      <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-rice-50/15 bg-rice-50/[0.06] transition-all duration-500 hover:-translate-y-0.5 hover:border-harvest-400/60">
        <Link
          href={`/shop/${product.slug}`}
          className="relative flex aspect-[4/3] items-end justify-center bg-[radial-gradient(120%_100%_at_50%_0%,rgba(243,222,160,0.18),rgba(29,41,22,0.0))] p-4"
        >
          {product.discountPercent > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-clay-500 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-rice-50">
              −{product.discountPercent}% off
            </span>
          )}
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} className="h-full w-full rounded-2xl object-cover" />
          ) : (
            <div className="h-full w-[58%]">
              <RiceBag
                id={`deal-${product.slug}`}
                light={product.grain.light}
                mid={product.grain.mid}
                dark={product.grain.dark}
                sinhala={product.sinhala}
                className="h-full w-full"
              />
            </div>
          )}
        </Link>
        <div className="flex flex-1 flex-col p-5">
          <Link href={`/shop/${product.slug}`}>
            <h3 className="font-display text-xl text-rice-50 transition-colors hover:text-harvest-300">
              {product.name}
            </h3>
          </Link>
          {product.note && (
            <p className="mt-1 line-clamp-2 text-sm text-rice-100/65">{product.note}</p>
          )}
          <div className="mt-3 flex items-end justify-between">
            <div>
              <PriceBlock
                pricePerKg={product.pricePerKg}
                weight={weight}
                discountPercent={product.discountPercent}
                size="sm"
                tone="light"
              />
              <p className="mt-1 text-[0.65rem] uppercase tracking-widest text-rice-100/60">
                for a {weight}kg bag
              </p>
            </div>
            <button
              onClick={handleAdd}
              aria-label={`Add ${product.name} ${weight}kg to cart`}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full transition-all duration-300 hover:scale-105",
                added ? "bg-paddy-600 text-rice-50" : "bg-harvest-500 text-paddy-950 hover:bg-harvest-400",
              )}
            >
              {added ? "✓" : "+"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
