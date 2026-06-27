"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type Product,
  priceFor,
  formatLKR,
} from "@/lib/data";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import WeightSlider from "@/components/shop/WeightSlider";
import { cn } from "@/lib/utils";

const BADGE_TONE: Record<NonNullable<Product["badge"]>, string> = {
  "Best Seller": "bg-harvest-500 text-paddy-950",
  "New Harvest": "bg-paddy-700 text-rice-50",
  Heirloom: "bg-clay-500 text-rice-50",
  Premium: "bg-husk text-rice-50",
  "Family Favourite": "bg-mist-400 text-paddy-950",
};

/** CSS/SVG rice-bag illustration coloured from the product's grain tones. */
function RiceBag({ product }: { product: Product }) {
  const { light, mid, dark } = product.grain;
  const id = `bag-${product.slug}`;
  return (
    <svg viewBox="0 0 200 220" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="100" cy="207" rx="62" ry="9" fill="rgba(34,31,23,0.18)" />
      {/* folded top */}
      <path d="M58 44c10-7 74-7 84 0l-6 12H64l-6-12Z" fill={dark} />
      <path d="M58 44c10-6 74-6 84 0-12 4-72 4-84 0Z" fill={light} opacity="0.5" />
      {/* body */}
      <path
        d="M64 56h72c6 28 9 92 4 132-2 14-12 18-40 18s-38-4-40-18c-5-40-2-104 4-132Z"
        fill={`url(#${id}-body)`}
      />
      {/* side seams */}
      <path d="M70 60c-5 40-6 96-2 130" stroke={light} strokeWidth="1.5" opacity="0.25" fill="none" />
      <path d="M130 60c5 40 6 96 2 130" stroke={dark} strokeWidth="2" opacity="0.4" fill="none" />
      {/* label */}
      <rect x="74" y="96" width="52" height="60" rx="8" fill={light} opacity="0.96" />
      <rect x="74" y="96" width="52" height="60" rx="8" fill="none" stroke={dark} strokeWidth="1" opacity="0.35" />
      <text x="100" y="118" textAnchor="middle" className="font-[var(--font-sinhala)]" fontSize="13" fill={dark}>
        {product.sinhala}
      </text>
      <line x1="84" y1="126" x2="116" y2="126" stroke={dark} strokeWidth="1" opacity="0.3" />
      <text x="100" y="140" textAnchor="middle" fontSize="6.5" letterSpacing="1.5" fill={dark} opacity="0.85">
        SAMADHI RICE
      </text>
      <text x="100" y="150" textAnchor="middle" fontSize="4.6" letterSpacing="1" fill={dark} opacity="0.55">
        MILLED TO ORDER
      </text>
      {/* a few loose grains */}
      <g fill={light} opacity="0.85">
        <ellipse cx="78" cy="182" rx="3" ry="1.4" transform="rotate(20 78 182)" />
        <ellipse cx="122" cy="186" rx="3" ry="1.4" transform="rotate(-25 122 186)" />
        <ellipse cx="100" cy="190" rx="3" ry="1.4" transform="rotate(8 100 190)" />
      </g>
    </svg>
  );
}

export default function ProductShowcaseCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const [weight, setWeight] = useState(5);
  const [added, setAdded] = useState(false);
  const wishlisted = has(product.slug);

  const price = priceFor(product.pricePerKg, weight);

  const handleAdd = () => {
    add({ slug: product.slug, name: product.name, weight, price });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-husk/10 bg-rice-50 shadow-[0_18px_44px_-32px_rgba(34,31,23,0.55)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-clay-400/40 hover:shadow-[0_36px_70px_-34px_rgba(34,31,23,0.55)]">
      {/* art panel */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-[5/4] overflow-hidden bg-[radial-gradient(120%_100%_at_50%_0%,var(--color-rice-100),var(--color-rice-200))]"
      >
        {product.badge && (
          <span
            className={cn(
              "absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider",
              BADGE_TONE[product.badge],
            )}
          >
            {product.badge}
          </span>
        )}
        <div className="absolute inset-0 flex items-end justify-center p-6 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
          <div className="h-full w-[58%] origin-bottom transition-transform duration-700 group-hover:-rotate-1">
            <RiceBag product={product} />
          </div>
        </div>
        {/* origin reveal on hover */}
        <span className="absolute bottom-4 left-4 translate-y-3 text-xs font-medium uppercase tracking-widest text-clay-600 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          ◍ {product.origin}
        </span>
      </Link>

      {/* wishlist heart */}
      <button
        onClick={() => toggle(product.slug)}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "absolute z-20 grid h-9 w-9 place-items-center rounded-full backdrop-blur-sm transition-all duration-300",
          wishlisted
            ? "bg-clay-500/90 text-rice-50 shadow-lg"
            : "bg-black/20 text-rice-50/80 hover:bg-clay-500/70 hover:text-rice-50",
          product.badge ? "right-4 top-[3.2rem]" : "right-4 top-4",
        )}
      >
        <svg viewBox="0 0 20 20" className={cn("h-4 w-4 transition-transform duration-300", wishlisted && "scale-110")} aria-hidden>
          <path
            d="M10 17.5s-7-4.5-7-9a3.5 3.5 0 0 1 7 0 3.5 3.5 0 0 1 7 0c0 4.5-7 9-7 9Z"
            fill={wishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* details */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-2">
          <Link href={`/shop/${product.slug}`}>
            <h3 className="font-display text-2xl text-husk transition-colors group-hover:text-paddy-800">
              {product.name}
            </h3>
          </Link>
          <span className="font-[var(--font-sinhala)] text-base text-clay-500">
            {product.sinhala}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-sm">
          <span className="text-harvest-500">★</span>
          <span className="font-semibold text-husk">{product.rating}</span>
          <span className="text-husk-soft">({product.reviews})</span>
        </div>

        {/* weight slider */}
        <div className="mt-3">
          <WeightSlider
            value={weight}
            onChange={setWeight}
            pricePerKg={product.pricePerKg}
            discountPercent={0}
          />
        </div>

        {/* price + add */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div>
            <span
              key={weight}
              className="block font-display text-2xl text-husk animate-[rise_0.35s_ease]"
            >
              {formatLKR(price)}
            </span>
            <span className="text-[0.68rem] text-husk-soft">
              {formatLKR(Math.round(price / weight))}/kg · {weight}kg
            </span>
          </div>
          <button
            onClick={handleAdd}
            aria-label={`Add ${product.name} ${weight}kg to cart`}
            className={cn(
              "relative grid h-12 w-12 shrink-0 place-items-center rounded-full text-rice-50 transition-all duration-300 hover:scale-105",
              added ? "bg-paddy-600" : "bg-paddy-800 hover:bg-paddy-900",
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
