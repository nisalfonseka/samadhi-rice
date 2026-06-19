import { prisma } from "@/lib/db";

export const OFFER_TONES = ["gold", "paddy", "clay"] as const;
export const OFFER_SIZES = ["wide", "tall", "small"] as const;
export type OfferTone = (typeof OFFER_TONES)[number];
export type OfferSize = (typeof OFFER_SIZES)[number];

export async function getEnabledOffers() {
  return prisma.offer.findMany({
    where: { enabled: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
}

export async function getAllOffers() {
  return prisma.offer.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
}

export async function getOffer(id: string) {
  return prisma.offer.findUnique({ where: { id } });
}
