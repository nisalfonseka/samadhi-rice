"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useWishlist } from "@/providers/WishlistProvider";
import { useCart } from "@/providers/CartProvider";
import { formatLKR, priceFor } from "@/lib/pricing";
import { cn, cloudinaryLoader } from "@/lib/utils";
import type { ProductDTO } from "@/lib/services/product.service";

function HeartBrokenGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-clay-400" fill="none" aria-hidden>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3c3.08 0 5.5 2.42 5.5 5.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 6v6m0 4v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function WishlistDrawer({ products }: { products: ProductDTO[] }) {
  const { items, isOpen, closeWishlist, toggle } = useWishlist();
  const { add } = useCart();

  const wishlistedProducts = products.filter((p) => items.includes(p.slug));

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeWishlist();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeWishlist]);

  const handleAddToCart = (product: ProductDTO) => {
    const price = priceFor(product.pricePerKg, 1, product.discountPercent);
    add({ slug: product.slug, name: product.name, weight: 1, price });
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60]",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!isOpen}
    >
      {/* overlay */}
      <button
        aria-label="Close wishlist"
        onClick={closeWishlist}
        className={cn(
          "absolute inset-0 bg-husk/45 backdrop-blur-[2px] transition-opacity duration-400",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      {/* panel */}
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-[min(27rem,100vw)] flex-col bg-rice-50 shadow-[-24px_0_60px_-30px_rgba(34,31,23,0.6)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-label="Wishlist"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-husk/10 px-6 py-5">
          <h2 className="font-display text-2xl text-husk flex items-center gap-2">
            Your Wishlist{" "}
            {wishlistedProducts.length > 0 && (
              <span className="text-clay-500">({wishlistedProducts.length})</span>
            )}
          </h2>
          <button
            onClick={closeWishlist}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full text-husk transition-colors hover:bg-husk/5"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-rice-100">
              <HeartBrokenGlyph />
            </span>
            <div>
              <p className="font-display text-xl text-husk">Your wishlist is empty</p>
              <p className="mt-1 text-sm text-husk-soft max-w-[18rem] mx-auto">
                Save your favourite traditional grains here while browsing the shop.
              </p>
            </div>
            <Link
              href="/shop"
              onClick={closeWishlist}
              className="mt-2 rounded-full bg-paddy-800 px-6 py-2.5 text-sm font-medium text-rice-50 transition-colors hover:bg-paddy-900"
            >
              Explore products
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-husk/8">
            {wishlistedProducts.map((p) => {
              const price = priceFor(p.pricePerKg, 1, p.discountPercent);
              const thumbUrl = p.images[0]
                ? cloudinaryLoader({ src: p.images[0], width: 100, quality: 75 })
                : null;
              
              return (
                <div key={p.slug} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  {/* Image */}
                  <Link
                    href={`/shop/${p.slug}`}
                    onClick={closeWishlist}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-husk/10 bg-rice-100"
                  >
                    {thumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumbUrl} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-xs font-semibold text-husk/30 bg-rice-200">
                        No Photo
                      </span>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        href={`/shop/${p.slug}`}
                        onClick={closeWishlist}
                        className="truncate font-display text-[1.05rem] text-husk hover:text-paddy-800 transition-colors"
                      >
                        {p.name}
                      </Link>
                      <button
                        onClick={() => toggle(p.slug)}
                        aria-label="Remove item"
                        className="text-husk-soft hover:text-clay-600 transition-colors text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>

                    {p.variety && (
                      <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-clay-500 truncate">
                        {p.variety}
                      </p>
                    )}

                    <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                      <div>
                        <span className="font-semibold text-husk">{formatLKR(price)}</span>
                        <span className="text-xs text-husk-soft"> / kg</span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={p.stockKg <= 0}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300",
                          p.stockKg <= 0
                            ? "bg-husk/10 text-husk-soft cursor-not-allowed"
                            : "bg-paddy-800 text-rice-50 hover:bg-paddy-900 hover:-translate-y-0.5"
                        )}
                      >
                        {p.stockKg <= 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}
