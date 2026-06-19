/* Weight-based pricing — single source of truth (homepage + shop + checkout). */

export type WeightKg = 1 | 5 | 10 | 25;

export const WEIGHTS: WeightKg[] = [1, 5, 10, 25];

/** Larger bags cost less per kg — rice is a bulk staple. */
const BULK_DISCOUNT: Record<WeightKg, number> = { 1: 0, 5: 0.03, 10: 0.07, 25: 0.12 };

/** Base price for a given weight, BEFORE any promotional discount. */
export function basePriceFor(pricePerKg: number, weight: WeightKg): number {
  const gross = pricePerKg * weight;
  return Math.round((gross * (1 - BULK_DISCOUNT[weight])) / 5) * 5;
}

/** Apply a 0-99% promotional discount to a base price, rounded to nearest 5. */
export function applyDiscount(base: number, discountPercent: number): number {
  const pct = Math.max(0, Math.min(99, Math.round(discountPercent || 0)));
  if (pct === 0) return base;
  return Math.round((base * (1 - pct / 100)) / 5) * 5;
}

/** Net price (with discount applied). Use this everywhere the customer pays. */
export function priceFor(
  pricePerKg: number,
  weight: WeightKg,
  discountPercent = 0,
): number {
  return applyDiscount(basePriceFor(pricePerKg, weight), discountPercent);
}

export const formatLKR = (n: number) =>
  "Rs. " + n.toLocaleString("en-LK", { maximumFractionDigits: 0 });
