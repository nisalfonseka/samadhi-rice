"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RiceBag from "@/components/shop/RiceBag";
import PriceBlock from "@/components/shop/PriceBlock";
import WeightSlider from "@/components/shop/WeightSlider";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { priceFor, formatLKR } from "@/lib/pricing";
import type { ProductDTO } from "@/lib/services/product.service";
import { cn } from "@/lib/utils";

const BADGE_TONE: Record<string, string> = {
  "Best Seller": "bg-harvest-500 text-paddy-950",
  "New Harvest": "bg-paddy-700 text-rice-50",
  Heirloom: "bg-clay-500 text-rice-50",
  Premium: "bg-husk text-rice-50",
  "Family Favourite": "bg-mist-400 text-paddy-950",
};

export default function ProductCard({
  product,
  className,
}: {
  product: ProductDTO;
  className?: string;
}) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const [weight, setWeight] = useState(1);
  const [added, setAdded] = useState(false);

  const price = priceFor(product.pricePerKg, weight, product.discountPercent);
  const soldOut = product.stockKg <= 0;
  const wishlisted = has(product.slug);

  const handleAdd = () => {
    if (soldOut) return;
    add({ slug: product.slug, name: product.name, weight, price });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-husk/10 bg-rice-50 shadow-[0_18px_44px_-32px_rgba(34,31,23,0.55)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-clay-400/40 hover:shadow-[0_36px_70px_-34px_rgba(34,31,23,0.55)]",
        className,
      )}
    >
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-[5/4] overflow-hidden bg-[radial-gradient(120%_100%_at_50%_0%,var(--color-rice-100),var(--color-rice-200))]"
      >
        {product.badge && (
          <span
            className={cn(
              "absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider",
              BADGE_TONE[product.badge] ?? "bg-paddy-800 text-rice-50",
            )}
          >
            {product.badge}
          </span>
        )}
        {soldOut ? (
          <span className="absolute right-4 top-4 z-10 rounded-full bg-husk/80 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-rice-50">
            Sold out
          </span>
        ) : product.discountPercent > 0 ? (
          <span className="absolute right-4 top-4 z-10 rounded-full bg-clay-500 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-rice-50">
            −{product.discountPercent}% off
          </span>
        ) : null}
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-end justify-center p-6 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
            <div className="h-full w-[58%] origin-bottom transition-transform duration-700 group-hover:-rotate-1">
              <RiceBag
                id={product.slug}
                light={product.grain.light}
                mid={product.grain.mid}
                dark={product.grain.dark}
                sinhala={product.sinhala}
                className="h-full w-full"
              />
            </div>
          </div>
        )}
        {product.origin && (
          <span className="absolute bottom-4 left-4 translate-y-3 text-xs font-medium uppercase tracking-widest text-clay-600 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            ◍ {product.origin}
          </span>
        )}
      </Link>

      {/* wishlist heart */}
      <button
        onClick={() => toggle(product.slug)}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "absolute right-4 z-20 grid h-9 w-9 place-items-center rounded-full backdrop-blur-sm transition-all duration-300",
          wishlisted
            ? "bg-clay-500/90 text-rice-50 top-4 shadow-lg"
            : "bg-black/20 text-rice-50/80 top-4 hover:bg-clay-500/70 hover:text-rice-50",
          product.badge || soldOut || product.discountPercent > 0
            ? "top-[3.2rem]"
            : "top-4",
        )}
      >
        <svg
          viewBox="0 0 20 20"
          className={cn("h-4 w-4 transition-transform duration-300", wishlisted && "scale-110")}
          aria-hidden
        >
          <path
            d="M10 17.5s-7-4.5-7-9a3.5 3.5 0 0 1 7 0 3.5 3.5 0 0 1 7 0c0 4.5-7 9-7 9Z"
            fill={wishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="flex flex-1 flex-col p-5">
        {product.variety && (
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-clay-500">
            {product.variety}
          </p>
        )}
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <Link href={`/shop/${product.slug}`}>
            <h3 className="font-display text-2xl text-husk transition-colors group-hover:text-paddy-800">
              {product.name}
            </h3>
          </Link>
          {product.sinhala && (
            <span className="font-[var(--font-sinhala)] text-base text-clay-500">
              {product.sinhala}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-sm">
          <span className="text-harvest-500">★</span>
          <span className="font-semibold text-husk">{product.rating}</span>
          <span className="text-husk-soft">({product.reviewsCount})</span>
        </div>

        {/* weight slider */}
        <div className="mt-3">
          <WeightSlider
            value={weight}
            onChange={setWeight}
            pricePerKg={product.pricePerKg}
            discountPercent={product.discountPercent}
          />
        </div>

        {/* price + add to cart */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div>
            <PriceBlock
              pricePerKg={product.pricePerKg}
              weight={weight}
              discountPercent={product.discountPercent}
              size="md"
            />
            <span className="mt-0.5 block text-[0.68rem] text-husk-soft">
              {formatLKR(Math.round(price / weight))}/kg · {weight}kg
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={soldOut}
            aria-label={`Add ${product.name} ${weight}kg to cart`}
            className={cn(
              "relative grid h-12 w-12 shrink-0 place-items-center rounded-full text-rice-50 transition-all duration-300",
              soldOut
                ? "cursor-not-allowed bg-husk/30"
                : added
                  ? "bg-paddy-600 hover:scale-105"
                  : "bg-paddy-800 hover:scale-105 hover:bg-paddy-900",
            )}
          >
            {added ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5 animate-[rise_0.3s_ease]" fill="none" aria-hidden>
                <path d="m5 12.5 4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <path d="M5 8h14l-1 10.5a1.5 1.5 0 0 1-1.5 1.4H7.5A1.5 1.5 0 0 1 6 18.5L5 8Z" stroke="currentColor" strokeWidth="1.6" />
                <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M12 11.5v4M10 13.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
