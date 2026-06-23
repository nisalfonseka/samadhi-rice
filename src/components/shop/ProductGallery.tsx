"use client";

import { useState } from "react";
import RiceBag from "@/components/shop/RiceBag";
import { useWishlist } from "@/providers/WishlistProvider";
import { cn, cloudinaryLoader } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
  badge: string | null;
  origin: string | null;
  grain: { light: string; mid: string; dark: string };
  sinhala: string | null;
  slug: string;
}

const BADGE_TONE: Record<string, string> = {
  "Best Seller": "bg-harvest-500 text-paddy-950",
  "New Harvest": "bg-paddy-700 text-rice-50",
  Heirloom: "bg-clay-500 text-rice-50",
  Premium: "bg-husk text-rice-50",
  "Family Favourite": "bg-mist-400 text-paddy-950",
};

export default function ProductGallery({
  images,
  name,
  badge,
  origin,
  grain,
  sinhala,
  slug,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { has, toggle } = useWishlist();
  const wishlisted = has(slug);

  const hasImages = images.length > 0;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Main Image Viewport */}
      <div className="relative flex h-[22rem] sm:h-[28rem] md:h-[30rem] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-husk/10 bg-[radial-gradient(120%_100%_at_50%_0%,var(--color-rice-100),var(--color-rice-200))] transition-all duration-300">
        {badge && (
          <span
            className={cn(
              "absolute left-6 top-6 z-20 rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider shadow-sm",
              BADGE_TONE[badge] ?? "bg-harvest-500 text-paddy-950",
            )}
          >
            {badge}
          </span>
        )}

        {/* Wishlist Heart Overlay */}
        <button
          type="button"
          onClick={() => toggle(slug)}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute right-6 top-6 z-20 grid h-10 w-10 place-items-center rounded-full backdrop-blur-md transition-all duration-300 shadow-sm",
            wishlisted
              ? "bg-clay-500/95 text-rice-50 shadow-md scale-105"
              : "bg-black/10 text-rice-50/80 hover:bg-clay-500/80 hover:text-rice-50 hover:scale-105"
          )}
        >
          <svg
            viewBox="0 0 20 20"
            className={cn("h-5 w-5 transition-transform duration-300", wishlisted && "scale-110")}
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

        {hasImages ? (
          <div className="absolute inset-0 h-full w-full">
            {images.map((imgUrl, idx) => {
              const optimizedUrl = cloudinaryLoader({
                src: imgUrl,
                width: 800,
                quality: 85,
              });
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={imgUrl}
                  src={optimizedUrl}
                  alt={`${name} - image ${idx + 1}`}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out",
                    idx === activeIndex ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                  )}
                  fetchPriority={idx === 0 ? "high" : "low"}
                />
              );
            })}
          </div>
        ) : (
          <div className="h-full w-auto flex items-center justify-center p-10 sm:p-14">
            <RiceBag
              id={`detail-${slug}`}
              light={grain.light}
              mid={grain.mid}
              dark={grain.dark}
              sinhala={sinhala}
              className="h-full w-auto"
            />
          </div>
        )}

        {origin && (
          <span className="absolute bottom-6 left-6 z-20 text-xs font-medium uppercase tracking-widest text-clay-600 drop-shadow-sm">
            ◍ {origin}
          </span>
        )}
      </div>

      {/* Gallery Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-3 px-2">
          {images.map((imgUrl, idx) => {
            const thumbUrl = cloudinaryLoader({
              src: imgUrl,
              width: 120,
              quality: 75,
            });
            return (
              <button
                key={imgUrl}
                type="button"
                onClick={() => setActiveIndex(idx)}
                onMouseEnter={() => setActiveIndex(idx)}
                aria-label={`View image ${idx + 1}`}
                className={cn(
                  "relative h-16 w-16 overflow-hidden rounded-2xl border-2 bg-rice-100 transition-all duration-300 hover:scale-105",
                  idx === activeIndex
                    ? "border-paddy-800 shadow-md scale-105 opacity-100"
                    : "border-husk/10 opacity-70 hover:opacity-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbUrl}
                  alt={`${name} thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
