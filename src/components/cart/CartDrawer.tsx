"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/providers/CartProvider";
import { formatLKR } from "@/lib/pricing";
import {
  deliveryFeeFor,
  amountToFreeDelivery,
} from "@/lib/delivery";
import { cn } from "@/lib/utils";

function GrainGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-harvest-500" fill="none" aria-hidden>
      <path d="M8 16c-2-2-2-6 1-9s7-3 9-1c1 1-1 5-4 8s-5 3-6 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 13.5 14.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export default function CartDrawer({
  freeDeliveryEnabled = false,
  freeDeliveryThreshold = 7500,
}: {
  freeDeliveryEnabled?: boolean;
  freeDeliveryThreshold?: number;
}) {
  const { lines, count, subtotal, setQty, remove, isOpen, closeCart } = useCart();

  const fee = deliveryFeeFor(subtotal);
  const toFree = amountToFreeDelivery(subtotal);
  const progress = freeDeliveryThreshold > 0
    ? Math.min(100, (subtotal / freeDeliveryThreshold) * 100)
    : 0;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

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
        aria-label="Close cart"
        onClick={closeCart}
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
        aria-label="Shopping cart"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-husk/10 px-6 py-5">
          <h2 className="font-display text-2xl text-husk">
            Your basket{" "}
            {count > 0 && <span className="text-clay-500">({count})</span>}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full text-husk transition-colors hover:bg-husk/5"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-rice-100">
              <GrainGlyph />
            </span>
            <p className="font-display text-xl text-husk">Your basket is empty</p>
            <p className="text-sm text-husk-soft">
              Fresh rice is just a few clicks away.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="mt-2 rounded-full bg-paddy-800 px-6 py-3 text-sm font-medium text-rice-50 transition-colors hover:bg-paddy-900"
            >
              Browse the harvest
            </Link>
          </div>
        ) : (
          <>
            {/* free delivery progress — only shown when enabled in admin settings */}
            {freeDeliveryEnabled && (
              <div className="border-b border-husk/10 px-6 py-4">
                <p className="text-sm text-husk-soft">
                  {subtotal >= freeDeliveryThreshold ? (
                    <span className="font-medium text-paddy-700">
                      ✺ You&apos;ve unlocked free delivery
                    </span>
                  ) : (
                    <>
                      Add{" "}
                      <span className="font-semibold text-husk">
                        {formatLKR(toFree)}
                      </span>{" "}
                      more for free delivery
                    </>
                  )}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rice-200">
                  <div
                    className="h-full rounded-full bg-harvest-500 transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* lines */}
            <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-4">
              <ul className="divide-y divide-husk/10">
                {lines.map((l) => (
                  <li key={`${l.slug}-${l.weight}`} className="flex gap-4 py-4">
                    <Link
                      href={`/shop/${l.slug}`}
                      onClick={closeCart}
                      className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-rice-100"
                    >
                      <GrainGlyph />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/shop/${l.slug}`}
                          onClick={closeCart}
                          className="font-display text-lg leading-tight text-husk hover:text-paddy-800"
                        >
                          {l.name}
                        </Link>
                        <button
                          onClick={() => remove(l.slug, l.weight)}
                          aria-label={`Remove ${l.name}`}
                          className="text-husk-soft transition-colors hover:text-clay-600"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-husk-soft">{l.weight}kg pack</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-husk/15">
                          <button
                            onClick={() => setQty(l.slug, l.weight, l.qty - 1)}
                            aria-label="Decrease"
                            className="grid h-8 w-8 place-items-center text-husk hover:text-paddy-800"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-sm font-semibold text-husk">
                            {l.qty}
                          </span>
                          <button
                            onClick={() => setQty(l.slug, l.weight, l.qty + 1)}
                            aria-label="Increase"
                            className="grid h-8 w-8 place-items-center text-husk hover:text-paddy-800"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-semibold text-husk">
                          {formatLKR(l.price * l.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* footer */}
            <div className="border-t border-husk/10 px-6 py-5">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-husk-soft">
                  <dt>Subtotal</dt>
                  <dd>{formatLKR(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-husk-soft">
                  <dt>Delivery</dt>
                  <dd>{fee === 0 ? "Free" : formatLKR(fee)}</dd>
                </div>
                <div className="flex justify-between pt-2 font-display text-xl text-husk">
                  <dt>Total</dt>
                  <dd>{formatLKR(subtotal + fee)}</dd>
                </div>
              </dl>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-paddy-800 py-4 font-medium text-rice-50 transition-all duration-300 hover:bg-paddy-900 hover:-translate-y-0.5"
              >
                Checkout · {formatLKR(subtotal + fee)}
              </Link>
              <button
                onClick={closeCart}
                className="mt-3 w-full text-center text-sm text-husk-soft underline-offset-4 hover:underline"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
