/* Weight-based pricing — single source of truth (homepage + shop + checkout). */

export type WeightKg = number;

export const PRESET_WEIGHTS = [1, 2, 3, 4, 5, 10] as const;
export type PresetWeight = (typeof PRESET_WEIGHTS)[number];

/** Backwards-compatible alias for components that still reference WEIGHTS. */
export const WEIGHTS = PRESET_WEIGHTS;

/** Graduated bulk discount — interpolates for in-between values. */
function bulkDiscount(kg: number): number {
  if (kg <= 1) return 0;
  if (kg <= 5) return ((kg - 1) / 4) * 0.03;
  if (kg <= 10) return 0.03 + ((kg - 5) / 5) * 0.04;
  if (kg <= 25) return 0.07 + ((kg - 10) / 15) * 0.05;
  return 0.12;
}

/** Base price for a given weight, BEFORE any promotional discount. */
export function basePriceFor(pricePerKg: number, weight: number): number {
  const w = Math.max(1, weight);
  const gross = pricePerKg * w;
  return Math.round((gross * (1 - bulkDiscount(w))) / 5) * 5;
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
  weight: number,
  discountPercent = 0,
): number {
  return applyDiscount(basePriceFor(pricePerKg, weight), discountPercent);
}

export const formatLKR = (n: number) =>
  "Rs. " + n.toLocaleString("en-LK", { maximumFractionDigits: 0 });
