"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import RiceBag from "@/components/shop/RiceBag";
import PriceBlock from "@/components/shop/PriceBlock";
import WeightSlider from "@/components/shop/WeightSlider";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { priceFor, basePriceFor, formatLKR } from "@/lib/pricing";
import type { ProductDTO } from "@/lib/services/product.service";
import { cn, cloudinaryLoader } from "@/lib/utils";

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const price = priceFor(product.pricePerKg, weight, product.discountPercent);
  const basePrice = basePriceFor(product.pricePerKg, weight);
  const hasDiscount = product.discountPercent > 0 && price < basePrice;
  const soldOut = product.stockKg <= 0;
  const wishlisted = has(product.slug);

  useEffect(() => {
    if (!isHovered || product.images.length <= 1) {
      setActiveImageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isHovered, product.images.length]);

  const handleAdd = () => {
    if (soldOut) return;
    add({ slug: product.slug, name: product.name, weight, price });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  const goToImage = (e: React.MouseEvent, dir: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();
    const len = product.images.length;
    setActiveImageIndex((prev) => (prev + dir + len) % len);
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative block aspect-[5/4] overflow-hidden bg-[radial-gradient(120%_100%_at_50%_0%,var(--color-rice-100),var(--color-rice-200))]"
      >
        {product.badge && (
          <span
            className={cn(
              "absolute left-4 top-4 z-10 hidden rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider xl:inline-flex",
              BADGE_TONE[product.badge] ?? "bg-paddy-800 text-rice-50",
            )}
          >
            {product.badge}
          </span>
        )}
        {soldOut ? (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-husk/80 px-2 py-0.5 text-[0.56rem] font-semibold uppercase tracking-wider text-rice-50 sm:right-4 sm:top-4 sm:px-3 sm:py-1 sm:text-[0.68rem]">
            Sold out
          </span>
        ) : product.discountPercent > 0 ? (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-clay-500 px-2 py-0.5 text-[0.56rem] font-semibold uppercase tracking-wider text-rice-50 sm:right-4 sm:top-4 sm:px-3 sm:py-1 sm:text-[0.68rem]">
            −{product.discountPercent}% off
          </span>
        ) : null}
        {product.images.length > 0 ? (
          <>
            {product.images.map((imgUrl, idx) => (
              <Image
                key={imgUrl}
                loader={cloudinaryLoader}
                src={imgUrl}
                alt=""
                fill
                sizes="(max-width: 449px) 50vw, (max-width: 1279px) 33vw, 25vw"
                className={cn(
                  "object-cover transition-all duration-700 ease-in-out group-hover:scale-105",
                  idx === activeImageIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                priority={idx === 0}
              />
            ))}

            {product.images.length > 1 && (
              <>
                {/* Gradient overlay for indicators legibility */}
                <div className="absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                {/* Prev / next arrows */}
                <button
                  type="button"
                  onClick={(e) => goToImage(e, -1)}
                  aria-label="Previous image"
                  className="absolute left-1.5 top-1/2 z-30 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full bg-black/30 text-rice-50 backdrop-blur-sm transition-colors hover:bg-black/55 sm:left-2.5 sm:h-8 sm:w-8"
                >
                  <svg viewBox="0 0 24 24" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" aria-hidden>
                    <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => goToImage(e, 1)}
                  aria-label="Next image"
                  className="absolute right-1.5 top-1/2 z-30 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full bg-black/30 text-rice-50 backdrop-blur-sm transition-colors hover:bg-black/55 sm:right-2.5 sm:h-8 sm:w-8"
                >
                  <svg viewBox="0 0 24 24" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" aria-hidden>
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Horizontal dash indicators */}
                <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 pointer-events-none">
                  {product.images.map((_, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "h-1 rounded-full bg-rice-50/40 backdrop-blur-sm transition-all duration-300",
                        idx === activeImageIndex ? "w-4 bg-rice-50" : "w-1"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </>
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
          "absolute left-2 top-2 z-20 grid h-7 w-7 place-items-center rounded-full backdrop-blur-sm transition-all duration-300 sm:h-9 sm:w-9 xl:left-auto xl:right-4",
          wishlisted
            ? "bg-clay-500/90 text-rice-50 shadow-lg"
            : "bg-black/20 text-rice-50/80 hover:bg-clay-500/70 hover:text-rice-50",
          soldOut || product.discountPercent > 0 ? "xl:top-[3.2rem]" : "xl:top-4",
        )}
      >
        <svg
          viewBox="0 0 20 20"
          className={cn("h-3.5 w-3.5 transition-transform duration-300 sm:h-4 sm:w-4", wishlisted && "scale-110")}
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

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="flex items-baseline justify-between gap-2">
          <Link href={`/shop/${product.slug}`}>
            <h3 className="font-display text-base text-husk transition-colors group-hover:text-paddy-800 sm:text-2xl">
              {product.name}
            </h3>
          </Link>
          {product.sinhala && (
            <span className="hidden font-[var(--font-sinhala)] text-base text-clay-500 sm:inline">
              {product.sinhala}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-1 text-xs sm:mt-2 sm:gap-1.5 sm:text-sm">
          <span className="text-harvest-500">★</span>
          <span className="font-semibold text-husk">{product.rating}</span>
          <span className="text-husk-soft">({product.reviewsCount})</span>
        </div>

        {/* weight slider — desktop only; mobile/tablet keeps the default weight */}
        <div className="mt-2 hidden sm:mt-3 xl:block">
          <WeightSlider
            value={weight}
            onChange={setWeight}
            pricePerKg={product.pricePerKg}
            discountPercent={product.discountPercent}
          />
        </div>

        {/* price + add to cart */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2 sm:gap-3 sm:pt-3">
          <div>
            <PriceBlock
              pricePerKg={product.pricePerKg}
              weight={weight}
              discountPercent={product.discountPercent}
              size="md"
            />
            <span className="mt-0.5 block text-[0.62rem] text-husk-soft sm:text-[0.68rem]">
              {formatLKR(Math.round(price / weight))}/kg · {weight}kg
            </span>
            {hasDiscount && (
              <span className="mt-0.5 block text-[0.62rem] text-husk-soft/70 line-through sm:text-[0.68rem]">
                {formatLKR(Math.round(basePrice / weight))}/kg
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={soldOut}
            aria-label={`Add ${product.name} ${weight}kg to cart`}
            className={cn(
              "relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-rice-50 transition-all duration-300 sm:h-12 sm:w-12",
              soldOut
                ? "cursor-not-allowed bg-husk/30"
                : added
                  ? "bg-paddy-600 hover:scale-105"
                  : "bg-paddy-800 hover:scale-105 hover:bg-paddy-900",
            )}
          >
            {added ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4 animate-[rise_0.3s_ease] sm:h-5 sm:w-5" fill="none" aria-hidden>
                <path d="m5 12.5 4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" aria-hidden>
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
