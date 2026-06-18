/*
  Delivery pricing — shared by the cart drawer (client) and order service
  (server) so the fee shown always matches the fee charged.
  Mirrors the seeded `site_settings` rows; admin-editable values can override
  these once the admin dashboard lands.
*/

export const FREE_DELIVERY_THRESHOLD = 7500; // LKR
export const FLAT_DELIVERY_FEE = 350; // LKR

export function deliveryFeeFor(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_FEE;
}

export function amountToFreeDelivery(subtotal: number): number {
  return Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
}
