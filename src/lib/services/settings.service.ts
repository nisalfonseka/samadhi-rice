import { prisma } from "@/lib/db";
import { FREE_DELIVERY_THRESHOLD, FLAT_DELIVERY_FEE } from "@/lib/delivery";

export type ShopSettings = {
  deliveryFeeFlat: number;
  freeDeliveryThreshold: number;
  codEnabled: boolean;
  payhereEnabled: boolean;
  heroHeadline: string;
};

const DEFAULTS: ShopSettings = {
  deliveryFeeFlat: FLAT_DELIVERY_FEE,
  freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
  codEnabled: true,
  payhereEnabled: false,
  heroHeadline: "From the paddy field to your plate.",
};

const toNum = (v: string | undefined, d: number) => {
  const n = v != null ? Number(v) : NaN;
  return Number.isFinite(n) ? n : d;
};
const toBool = (v: string | undefined, d: boolean) => (v == null ? d : v === "true");

export async function getSettings(): Promise<ShopSettings> {
  const rows = await prisma.siteSetting.findMany();
  const m = new Map(rows.map((r) => [r.key, r.value]));
  return {
    deliveryFeeFlat: toNum(m.get("delivery_fee_flat"), DEFAULTS.deliveryFeeFlat),
    freeDeliveryThreshold: toNum(
      m.get("free_delivery_threshold"),
      DEFAULTS.freeDeliveryThreshold,
    ),
    codEnabled: toBool(m.get("cod_enabled"), DEFAULTS.codEnabled),
    payhereEnabled: toBool(m.get("payhere_enabled"), DEFAULTS.payhereEnabled),
    heroHeadline: m.get("hero_headline") || DEFAULTS.heroHeadline,
  };
}

export async function saveSettings(values: Record<string, string>) {
  await Promise.all(
    Object.entries(values).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      }),
    ),
  );
}

/** Authoritative delivery fee used when creating orders. */
export function deliveryFeeFrom(settings: ShopSettings, subtotal: number) {
  return subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFeeFlat;
}
