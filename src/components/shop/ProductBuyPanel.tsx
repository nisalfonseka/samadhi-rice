"use client";

import { useState } from "react";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import WeightSlider from "@/components/shop/WeightSlider";
import { priceFor, basePriceFor, formatLKR } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export default function ProductBuyPanel({
  slug,
  name,
  pricePerKg,
  stockKg,
  discountPercent = 0,
}: {
  slug: string;
  name: string;
  pricePerKg: number;
  stockKg: number;
  discountPercent?: number;
}) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const [weight, setWeight] = useState(1);
  const qty = 1;
  const [added, setAdded] = useState(false);

  const unit = priceFor(pricePerKg, weight, discountPercent);
  const baseUnit = basePriceFor(pricePerKg, weight);
  const total = unit * qty;
  const baseTotal = baseUnit * qty;
  const hasDiscount = discountPercent > 0 && total < baseTotal;
  const soldOut = stockKg <= 0;
  const wishlisted = has(slug);

  const handleAdd = () => {
    if (soldOut) return;
    add({ slug, name, weight, price: unit, qty });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1700);
  };

  return (
    <div className="rounded-3xl border border-husk/10 bg-rice-50 p-6 shadow-[0_18px_44px_-32px_rgba(34,31,23,0.5)]">
      {/* weight slider */}
      <p className="text-xs font-semibold uppercase tracking-widest text-husk-soft">
        Choose weight
      </p>
      <div className="mt-3">
        <WeightSlider
          value={weight}
          onChange={setWeight}
          pricePerKg={pricePerKg}
          discountPercent={discountPercent}
          large={true}
          hideCustom={true}
        />
      </div>

      {/* qty + price */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="custom-weight-input" className="text-[10px] font-bold uppercase tracking-wider text-husk-soft">
            Custom weight
          </label>
          <div className="flex items-center rounded-full border border-husk/15 bg-white px-4 h-10 w-36 shadow-inner focus-within:border-paddy-700/50 focus-within:ring-1 focus-within:ring-paddy-700/20 transition-all">
            <input
              id="custom-weight-input"
              type="number"
              min={1}
              max={100}
              step="any"
              value={weight === 0 ? "" : weight}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setWeight(0);
                  return;
                }
                const num = parseFloat(val);
                if (!isNaN(num)) {
                  setWeight(num);
                }
              }}
              placeholder="0.0"
              className="w-full bg-transparent text-center font-semibold text-husk outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="text-sm font-semibold text-husk-soft ml-1">kg</span>
          </div>
        </div>
        <div className="text-right">
          <span className="block font-display text-3xl text-husk animate-[rise_0.3s_ease]" key={total}>
            {formatLKR(total)}
          </span>
          {hasDiscount && (
            <span className="block text-xs">
              <span className="text-husk-soft line-through">{formatLKR(baseTotal)}</span>{" "}
              <span className="font-semibold text-clay-600">−{discountPercent}%</span>
            </span>
          )}
          <span className="text-xs text-husk-soft">
            {weight > 0 ? formatLKR(Math.round(unit / weight)) : formatLKR(pricePerKg)}/kg · incl. taxes
          </span>
        </div>
      </div>

      {/* add + wishlist */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleAdd}
          disabled={soldOut || weight <= 0}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full py-4 font-medium text-rice-50 transition-all duration-300",
            (soldOut || weight <= 0)
              ? "cursor-not-allowed bg-husk/30 text-rice-50/50"
              : added
                ? "bg-paddy-600"
                : "bg-paddy-800 hover:bg-paddy-900 hover:-translate-y-0.5",
          )}
        >
          {soldOut ? (
            "Sold out"
          ) : weight <= 0 ? (
            "Enter weight"
          ) : added ? (
            <>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <path d="m5 12.5 4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Added to cart
            </>
          ) : (
            <>Add {weight}kg to cart · {formatLKR(total)}</>
          )}
        </button>

        <button
          onClick={() => toggle(slug)}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border-2 transition-all duration-300",
            wishlisted
              ? "border-clay-500 bg-clay-500 text-rice-50"
              : "border-husk/15 text-husk/40 hover:border-clay-400 hover:text-clay-500",
          )}
        >
          <svg viewBox="0 0 20 20" className={cn("h-5 w-5 transition-transform duration-300", wishlisted && "scale-110")} aria-hidden>
            <path
              d="M10 17.5s-7-4.5-7-9a3.5 3.5 0 0 1 7 0 3.5 3.5 0 0 1 7 0c0 4.5-7 9-7 9Z"
              fill={wishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-husk-soft">
        <span className={cn("inline-block h-2 w-2 rounded-full", soldOut ? "bg-clay-500" : "bg-paddy-500")} />
        {soldOut ? "Currently out of stock" : "In stock · milled to order · ships next day"}
      </div>
    </div>
  );
}
