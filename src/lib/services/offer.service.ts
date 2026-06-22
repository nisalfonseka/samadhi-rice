import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export const OFFER_TONES = ["gold", "paddy", "clay"] as const;
export const OFFER_SIZES = ["wide", "tall", "small"] as const;
export type OfferTone = (typeof OFFER_TONES)[number];
export type OfferSize = (typeof OFFER_SIZES)[number];

export const getEnabledOffers = unstable_cache(
  async () => prisma.offer.findMany({
    where: { enabled: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  }),
  ["enabled-offers"],
  { revalidate: 300, tags: ["offers"] },
);

export async function getAllOffers() {
  return prisma.offer.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
}

export async function getOffer(id: string) {
  return prisma.offer.findUnique({ where: { id } });
}
