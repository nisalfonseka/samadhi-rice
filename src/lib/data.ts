/*
  Static content for the homepage. Once the database (Supabase/Prisma) is wired,
  these become queries — the component contracts below already mirror the schema.
*/

import { WEIGHTS, priceFor, formatLKR, type WeightKg } from "@/lib/pricing";

// Re-export so existing homepage imports from "@/lib/data" keep working.
export { WEIGHTS, priceFor, formatLKR };
export type { WeightKg };

export type Product = {
  slug: string;
  name: string;
  sinhala: string;
  variety: string;
  /** short tasting / use note */
  note: string;
  /** grain tones used to render the CSS pack art (swap for real photos later) */
  grain: { light: string; mid: string; dark: string };
  badge?: "Best Seller" | "New Harvest" | "Heirloom" | "Premium" | "Family Favourite";
  rating: number;
  reviews: number;
  pricePerKg: number; // LKR
  origin: string;
};

/* ----------------------------------------------------------- products ---- */

export const HOT_PRODUCTS: Product[] = [
  {
    slug: "suwandel-rice",
    name: "Suwandel Rice",
    sinhala: "සුවඳැල්",
    variety: "Aromatic heirloom · white",
    note: "Naturally fragrant heritage grain — the rice of festivals and almsgivings.",
    grain: { light: "#f3ead4", mid: "#e3d2a6", dark: "#c7ad70" },
    badge: "Best Seller",
    rating: 4.9,
    reviews: 412,
    pricePerKg: 420,
    origin: "Polonnaruwa terraces",
  },
  {
    slug: "kalu-heenati",
    name: "Kalu Heenati",
    sinhala: "කළු හීනටි",
    variety: "Traditional red · wholegrain",
    note: "Deep red, iron-rich and earthy. Loved for its nutrition and nutty bite.",
    grain: { light: "#b87a55", mid: "#8a4d33", dark: "#5d2f21" },
    badge: "New Harvest",
    rating: 4.8,
    reviews: 287,
    pricePerKg: 380,
    origin: "Kurunegala smallholdings",
  },
  {
    slug: "red-raw-rice",
    name: "Rathu Kekulu",
    sinhala: "රතු කැකුළු",
    variety: "Red raw rice · everyday",
    note: "The everyday red rice — hearty, filling and unbeatable with a good parippu.",
    grain: { light: "#c98f63", mid: "#a05f3c", dark: "#6e3d27" },
    badge: "Family Favourite",
    rating: 4.7,
    reviews: 531,
    pricePerKg: 260,
    origin: "Anuradhapura tanks",
  },
  {
    slug: "keeri-samba",
    name: "Keeri Samba",
    sinhala: "කීරි සම්බා",
    variety: "Fine short-grain · white",
    note: "Tiny, delicate grains that cook soft and pearly — for milk rice and special meals.",
    grain: { light: "#f6efe0", mid: "#e9ddc4", dark: "#cdbd96" },
    badge: "Premium",
    rating: 4.9,
    reviews: 198,
    pricePerKg: 340,
    origin: "Ampara wetlands",
  },
];

/* ------------------------------------------------------------- offers ---- */

export type Offer = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  cta: string;
  tone: "gold" | "paddy" | "clay";
  size: "wide" | "tall" | "small";
};

export const OFFERS: Offer[] = [
  {
    id: "bulk",
    eyebrow: "Pantry stock-up",
    title: "Save 12% on every 25kg bag",
    detail:
      "Buy the way Sri Lankan kitchens always have — by the bushel. Bulk pricing applied automatically at checkout.",
    cta: "Shop bulk bags",
    tone: "paddy",
    size: "wide",
  },
  {
    id: "first-order",
    eyebrow: "New here?",
    title: "Rs. 500 off your first order",
    detail: "Use code SAMADHI500 at checkout.",
    cta: "Claim offer",
    tone: "gold",
    size: "tall",
  },
  {
    id: "delivery",
    eyebrow: "Colombo & suburbs",
    title: "Free delivery over Rs. 7,500",
    detail: "Next-day, milled-to-order.",
    cta: "How it works",
    tone: "clay",
    size: "small",
  },
  {
    id: "season",
    eyebrow: "Maha season",
    title: "New harvest just milled",
    detail: "First pressing of the Maha paddy is in. Limited stock.",
    cta: "Taste the season",
    tone: "gold",
    size: "small",
  },
];

/* --------------------------------------------------------- testimonials -- */

export type Testimonial = {
  id: string;
  name: string;
  place: string;
  quote: string;
  rating: number;
  product: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Nadeesha Perera",
    place: "Nugegoda",
    quote:
      "The Suwandel actually smells like my grandmother's kitchen. You can tell it was milled days ago, not months ago. We've stopped buying supermarket rice entirely.",
    rating: 5,
    product: "Suwandel Rice",
  },
  {
    id: "t2",
    name: "Dr. Ruwan Jayasuriya",
    place: "Kandy",
    quote:
      "I recommend Kalu Heenati to my diabetic patients and now I eat it myself. Consistent quality every single delivery, and the bags are always sealed fresh.",
    rating: 5,
    product: "Kalu Heenati",
  },
  {
    id: "t3",
    name: "Fathima Riyaz",
    place: "Dehiwala",
    quote:
      "Ordered 25kg for our restaurant and the bulk price was better than the wholesale market. Delivery was on time and the red rice is beautifully uniform.",
    rating: 5,
    product: "Rathu Kekulu",
  },
  {
    id: "t4",
    name: "Sanjeewa Bandara",
    place: "Malabe",
    quote:
      "The weight toggle on each product is such a small thing but so useful — I switch between 5kg for home and 25kg for the boutique. Whole experience feels premium.",
    rating: 5,
    product: "Keeri Samba",
  },
  {
    id: "t5",
    name: "Ishara Wickramasinghe",
    place: "Galle",
    quote:
      "Milk rice on Avurudu morning with their Keeri Samba was the softest I've ever made. The chat assistant even helped me pick the right variety. Genuinely impressed.",
    rating: 5,
    product: "Keeri Samba",
  },
];

/* ------------------------------------------------------------- stats ----- */

export type Stat = { value: number; suffix: string; label: string };

export const STATS: Stat[] = [
  { value: 27, suffix: "+", label: "Years milling for Sri Lankan kitchens" },
  { value: 18, suffix: "", label: "Partner farming villages" },
  { value: 240, suffix: "K", label: "Kilograms milled to order each year" },
  { value: 12, suffix: "K", label: "Families fed every month" },
];

/* --------------------------------------------------------- origin story -- */

export type StoryStep = {
  n: string;
  title: string;
  sinhala: string;
  body: string;
};

export const STORY: StoryStep[] = [
  {
    n: "01",
    title: "The Paddy Field",
    sinhala: "කුඹුර",
    body: "It begins ankle-deep in water, in family fields worked the same way for generations across the dry zone.",
  },
  {
    n: "02",
    title: "The Harvest",
    sinhala: "අස්වැන්න",
    body: "We harvest at full maturity, sun-dry on woven mats, and never rush the grain for the sake of a faster cycle.",
  },
  {
    n: "03",
    title: "The Mill",
    sinhala: "මෝල",
    body: "Small-batch milling keeps the bran and aroma intact. We mill to order — your rice is never sitting in a warehouse.",
  },
  {
    n: "04",
    title: "The Pack",
    sinhala: "ඇසුරුම",
    body: "Sealed fresh in breathable packaging the same day it is milled, with the harvest date printed on every bag.",
  },
  {
    n: "05",
    title: "Your Kitchen",
    sinhala: "ඔබේ මුළුතැන්ගෙය",
    body: "Delivered to your door across the island — from our paddy fields to your table, with nothing lost in between.",
  },
];

/* -------------------------------------------------------------- nav ------ */

export const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Our Rice", href: "/shop#varieties" },
  { label: "The Journey", href: "/about" },
  { label: "Recipes", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const WHATSAPP_NUMBER = "94770000000"; // TODO: replace with the shop's real number
