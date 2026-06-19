import { prisma } from "@/lib/db";
import { FREE_DELIVERY_THRESHOLD, FLAT_DELIVERY_FEE } from "@/lib/delivery";

export type ShopSettings = {
  /* shop operations */
  deliveryFeeFlat: number;
  freeDeliveryEnabled: boolean;
  freeDeliveryThreshold: number;
  codEnabled: boolean;
  payhereEnabled: boolean;
  /* homepage sections */
  sectionHotProducts: boolean;
  sectionOffers: boolean;
  sectionOriginStory: boolean;
  sectionTrustStats: boolean;
  sectionTestimonials: boolean;
  sectionBlogPreview: boolean;
  sectionNewsletter: boolean;
  /* storefront copy */
  heroHeadline: string;
  siteTagline: string;
  metaDescription: string;
  /* contact */
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  /* location */
  addressLine1: string;
  addressCity: string;
  addressGoogleMaps: string;
  businessHours: string;
  deliveryZones: string;
  /* social */
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  socialTiktok: string;
};

const DEFAULTS: ShopSettings = {
  deliveryFeeFlat: FLAT_DELIVERY_FEE,
  freeDeliveryEnabled: true,
  freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
  codEnabled: true,
  payhereEnabled: false,
  sectionHotProducts: true,
  sectionOffers: true,
  sectionOriginStory: true,
  sectionTrustStats: true,
  sectionTestimonials: true,
  sectionBlogPreview: true,
  sectionNewsletter: true,
  heroHeadline: "From the paddy field to your plate.",
  siteTagline: "Single-origin Sri Lankan rice, milled fresh from family paddy fields.",
  metaDescription: "",
  contactPhone: "+94 77 000 0000",
  contactWhatsapp: "94770000000",
  contactEmail: "hello@samadhirice.lk",
  addressLine1: "No. 42, Negombo Road, Wattala",
  addressCity: "Wattala, Western Province, Sri Lanka",
  addressGoogleMaps: "",
  businessHours: "Mon–Sat · 8.00am – 6.00pm",
  deliveryZones: "Colombo\nGampaha\nKalutara",
  socialFacebook: "",
  socialInstagram: "",
  socialYoutube: "",
  socialTiktok: "",
};

const toNum = (v: string | undefined, d: number) => {
  const n = v != null ? Number(v) : NaN;
  return Number.isFinite(n) ? n : d;
};
const toBool = (v: string | undefined, d: boolean) => (v == null ? d : v === "true");
const toStr = (v: string | undefined, d: string) => (v != null ? v : d);

export async function getSettings(): Promise<ShopSettings> {
  const rows = await prisma.siteSetting.findMany();
  const m = new Map(rows.map((r) => [r.key, r.value]));
  return {
    deliveryFeeFlat: toNum(m.get("delivery_fee_flat"), DEFAULTS.deliveryFeeFlat),
    freeDeliveryEnabled: toBool(m.get("free_delivery_enabled"), DEFAULTS.freeDeliveryEnabled),
    freeDeliveryThreshold: toNum(m.get("free_delivery_threshold"), DEFAULTS.freeDeliveryThreshold),
    codEnabled: toBool(m.get("cod_enabled"), DEFAULTS.codEnabled),
    payhereEnabled: toBool(m.get("payhere_enabled"), DEFAULTS.payhereEnabled),
    sectionHotProducts: toBool(m.get("section_hot_products"), DEFAULTS.sectionHotProducts),
    sectionOffers: toBool(m.get("section_offers"), DEFAULTS.sectionOffers),
    sectionOriginStory: toBool(m.get("section_origin_story"), DEFAULTS.sectionOriginStory),
    sectionTrustStats: toBool(m.get("section_trust_stats"), DEFAULTS.sectionTrustStats),
    sectionTestimonials: toBool(m.get("section_testimonials"), DEFAULTS.sectionTestimonials),
    sectionBlogPreview: toBool(m.get("section_blog_preview"), DEFAULTS.sectionBlogPreview),
    sectionNewsletter: toBool(m.get("section_newsletter"), DEFAULTS.sectionNewsletter),
    heroHeadline: toStr(m.get("hero_headline"), DEFAULTS.heroHeadline),
    siteTagline: toStr(m.get("site_tagline"), DEFAULTS.siteTagline),
    metaDescription: toStr(m.get("meta_description"), DEFAULTS.metaDescription),
    contactPhone: toStr(m.get("contact_phone"), DEFAULTS.contactPhone),
    contactWhatsapp: toStr(m.get("contact_whatsapp"), DEFAULTS.contactWhatsapp),
    contactEmail: toStr(m.get("contact_email"), DEFAULTS.contactEmail),
    addressLine1: toStr(m.get("address_line1"), DEFAULTS.addressLine1),
    addressCity: toStr(m.get("address_city"), DEFAULTS.addressCity),
    addressGoogleMaps: toStr(m.get("address_google_maps"), DEFAULTS.addressGoogleMaps),
    businessHours: toStr(m.get("business_hours"), DEFAULTS.businessHours),
    deliveryZones: toStr(m.get("delivery_zones"), DEFAULTS.deliveryZones),
    socialFacebook: toStr(m.get("social_facebook"), DEFAULTS.socialFacebook),
    socialInstagram: toStr(m.get("social_instagram"), DEFAULTS.socialInstagram),
    socialYoutube: toStr(m.get("social_youtube"), DEFAULTS.socialYoutube),
    socialTiktok: toStr(m.get("social_tiktok"), DEFAULTS.socialTiktok),
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
  if (settings.freeDeliveryEnabled && subtotal >= settings.freeDeliveryThreshold) return 0;
  return settings.deliveryFeeFlat;
}
