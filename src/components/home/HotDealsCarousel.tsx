"use client";

import { useEffect, useRef, useState } from "react";
import ProductCard from "@/components/shop/ProductCard";
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
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <div className="relative">
      {/* controls */}
      <div className="mb-5 flex items-center justify-between">
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

      {/* deal cards — same default ProductCard used across the shop.
          items-stretch keeps every card equal height; the vertical padding
          gives the hover-lift room so the scroll container can't clip it. */}
      <div
        ref={rail}
        className="no-scrollbar -mx-2 flex snap-x snap-mandatory items-stretch overflow-x-auto scroll-smooth px-0 pb-7 pt-4"
      >
        {products.map((p) => (
          <div
            key={p.slug}
            className="flex w-[17rem] shrink-0 snap-start px-2 sm:w-[18.5rem]"
          >
            <ProductCard product={p} className="h-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
