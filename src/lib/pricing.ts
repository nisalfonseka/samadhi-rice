/* Weight-based pricing — single source of truth (homepage + shop + checkout). */

export type WeightKg = 1 | 5 | 10 | 25;

export const WEIGHTS: WeightKg[] = [1, 5, 10, 25];

/** Larger bags cost less per kg — rice is a bulk staple. */
const BULK_DISCOUNT: Record<WeightKg, number> = { 1: 0, 5: 0.03, 10: 0.07, 25: 0.12 };

export function priceFor(pricePerKg: number, weight: WeightKg): number {
  const gross = pricePerKg * weight;
  return Math.round((gross * (1 - BULK_DISCOUNT[weight])) / 5) * 5;
}

export const formatLKR = (n: number) =>
  "Rs. " + n.toLocaleString("en-LK", { maximumFractionDigits: 0 });
