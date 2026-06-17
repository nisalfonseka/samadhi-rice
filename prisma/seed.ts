import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    slug: "aromatic",
    name: "Aromatic & Heirloom",
    description:
      "Naturally fragrant heritage grains — the rice of festivals, almsgivings and special meals.",
  },
  {
    slug: "red-rice",
    name: "Red Rice",
    description:
      "Wholegrain red rice — hearty, high in fibre and iron, and central to the everyday Sri Lankan plate.",
  },
  {
    slug: "white-rice",
    name: "White Rice",
    description:
      "Soft, clean white rice for daily cooking, milk rice and fine-dining plates.",
  },
];

type SeedProduct = {
  slug: string;
  name: string;
  sinhala: string;
  variety: string;
  note: string;
  description: string;
  cookingTips: string;
  origin: string;
  pricePerKg: number;
  stockKg: number;
  badge?: string;
  rating: number;
  reviewsCount: number;
  grain: { light: string; mid: string; dark: string };
  featured: boolean;
  category: string;
};

const products: SeedProduct[] = [
  {
    slug: "suwandel-rice",
    name: "Suwandel Rice",
    sinhala: "සුවඳැල්",
    variety: "Aromatic heirloom · white",
    note: "Naturally fragrant heritage grain — the rice of festivals and almsgivings.",
    description:
      "Suwandel is one of Sri Lanka's most treasured traditional rice varieties — a soft, aromatic white grain whose name literally means 'fragrant'. Grown in small heritage plots and milled gently to keep its natural perfume intact, it cooks into a fluffy, lightly sweet rice that has graced temple almsgivings and celebration tables for generations.",
    cookingTips:
      "Rinse once, use 1 : 2 rice-to-water, and let it rest covered for 5 minutes off the heat. Beautiful as plain rice, kiribath or for festive yellow rice.",
    origin: "Polonnaruwa terraces",
    pricePerKg: 420,
    stockKg: 600,
    badge: "Best Seller",
    rating: 4.9,
    reviewsCount: 412,
    grain: { light: "#f3ead4", mid: "#e3d2a6", dark: "#c7ad70" },
    featured: true,
    category: "aromatic",
  },
  {
    slug: "kalu-heenati",
    name: "Kalu Heenati",
    sinhala: "කළු හීනටි",
    variety: "Traditional red · wholegrain",
    note: "Deep red, iron-rich and earthy. Loved for its nutrition and nutty bite.",
    description:
      "Kalu Heenati is a prized traditional red rice celebrated for its deep colour, nutty flavour and exceptional nutrition. Rich in iron and fibre with a low glycaemic response, it is the variety many Sri Lankan families and doctors return to for everyday wellbeing without sacrificing taste.",
    cookingTips:
      "Soak 20–30 minutes for the best texture, then cook 1 : 2.5 rice-to-water until tender. Pairs perfectly with parippu and a fiery pol sambol.",
    origin: "Kurunegala smallholdings",
    pricePerKg: 380,
    stockKg: 450,
    badge: "New Harvest",
    rating: 4.8,
    reviewsCount: 287,
    grain: { light: "#b87a55", mid: "#8a4d33", dark: "#5d2f21" },
    featured: true,
    category: "red-rice",
  },
  {
    slug: "red-raw-rice",
    name: "Rathu Kekulu",
    sinhala: "රතු කැකුළු",
    variety: "Red raw rice · everyday",
    note: "The everyday red rice — hearty, filling and unbeatable with a good parippu.",
    description:
      "Rathu Kekulu is the dependable red raw rice at the heart of the daily Sri Lankan meal. Hearty and filling with a satisfying chew, it holds up to curries and gravies and keeps you full through a long day. Uniformly milled and sealed fresh, batch after batch.",
    cookingTips:
      "Rinse twice and cook 1 : 2.5 rice-to-water. Excellent for rice and curry, fried rice, or a simple parippu-and-rice lunch.",
    origin: "Anuradhapura tanks",
    pricePerKg: 260,
    stockKg: 900,
    badge: "Family Favourite",
    rating: 4.7,
    reviewsCount: 531,
    grain: { light: "#c98f63", mid: "#a05f3c", dark: "#6e3d27" },
    featured: true,
    category: "red-rice",
  },
  {
    slug: "keeri-samba",
    name: "Keeri Samba",
    sinhala: "කීරි සම්බා",
    variety: "Fine short-grain · white",
    note: "Tiny, delicate grains that cook soft and pearly — for milk rice and special meals.",
    description:
      "Keeri Samba is the fine, short-grained white rice reserved for special occasions. Its tiny pearly grains cook to a soft, slightly sticky texture that makes the creamiest kiribath and the most elegant plain rice. A little goes a long way — a true premium grain.",
    cookingTips:
      "Use slightly less water (1 : 1.75) as the grains are small. Ideal for kiribath, milk rice and celebration plates.",
    origin: "Ampara wetlands",
    pricePerKg: 340,
    stockKg: 380,
    badge: "Premium",
    rating: 4.9,
    reviewsCount: 198,
    grain: { light: "#f6efe0", mid: "#e9ddc4", dark: "#cdbd96" },
    featured: true,
    category: "white-rice",
  },
  {
    slug: "nadu-rice",
    name: "Nadu Rice",
    sinhala: "නාඩු",
    variety: "Parboiled · everyday white",
    note: "The all-rounder parboiled white rice — separate, fluffy grains every time.",
    description:
      "Nadu is the everyday parboiled white rice Sri Lankan kitchens rely on. Parboiling firms the grain so it cooks up separate and fluffy, never mushy — making it the most versatile choice for daily rice and curry, biriyani and fried rice alike.",
    cookingTips:
      "Rinse once and cook 1 : 2 rice-to-water. Forgiving and consistent — great for large family meals.",
    origin: "Hambantota fields",
    pricePerKg: 230,
    stockKg: 1100,
    rating: 4.6,
    reviewsCount: 142,
    grain: { light: "#efe6d0", mid: "#ddcba0", dark: "#c2ab78" },
    featured: false,
    category: "white-rice",
  },
  {
    slug: "basmati-rice",
    name: "Basmati Rice",
    sinhala: "බාස්මතී",
    variety: "Long-grain aromatic · white",
    note: "Long, slender aromatic grains that stay separate — the classic for biryani.",
    description:
      "Long, slender and intensely fragrant, Basmati is the world's favourite aromatic rice and the gold standard for biryani and pilau. The grains elongate as they cook and stay beautifully separate, carrying spices and ghee without ever turning sticky.",
    cookingTips:
      "Soak 30 minutes, drain, then cook 1 : 1.5 rice-to-water. Finish with a knob of ghee and whole spices for biryani.",
    origin: "Selected import",
    pricePerKg: 520,
    stockKg: 300,
    badge: "Premium",
    rating: 4.8,
    reviewsCount: 176,
    grain: { light: "#f5eedc", mid: "#e7dab8", dark: "#cdbb8c" },
    featured: false,
    category: "aromatic",
  },
  {
    slug: "suduru-samba",
    name: "Suduru Samba",
    sinhala: "සුදුරු සම්බා",
    variety: "Fine white · everyday premium",
    note: "Fine, soft white samba for an everyday meal that feels special.",
    description:
      "Suduru Samba is a fine white samba rice that brings a touch of the special to the everyday plate. Softer and more delicate than long grain, it cooks to a tender, comforting texture that's a favourite for both daily meals and quiet celebrations.",
    cookingTips:
      "Rinse gently and cook 1 : 2 rice-to-water. Lovely with seafood curries and mild vegetable dishes.",
    origin: "Ampara wetlands",
    pricePerKg: 300,
    stockKg: 520,
    rating: 4.7,
    reviewsCount: 121,
    grain: { light: "#f6efe2", mid: "#eaddc6", dark: "#cfbf99" },
    featured: false,
    category: "white-rice",
  },
];

const reviews = [
  { product: "suwandel-rice", name: "Nadeesha Perera", place: "Nugegoda", rating: 5, comment: "Smells exactly like my grandmother's kitchen. You can tell it was milled days ago, not months ago." },
  { product: "suwandel-rice", name: "Ishara W.", place: "Galle", rating: 5, comment: "Made the softest kiribath I've ever managed on Avurudu morning." },
  { product: "kalu-heenati", name: "Dr. Ruwan Jayasuriya", place: "Kandy", rating: 5, comment: "I recommend this to my diabetic patients and now eat it myself. Consistent quality every delivery." },
  { product: "red-raw-rice", name: "Fathima Riyaz", place: "Dehiwala", rating: 5, comment: "Ordered 25kg for our restaurant — bulk price beat the wholesale market and the rice is beautifully uniform." },
  { product: "keeri-samba", name: "Sanjeewa Bandara", place: "Malabe", rating: 5, comment: "The weight toggle is so useful. The whole experience feels premium." },
];

const settings = [
  { key: "delivery_fee_flat", value: "350" },
  { key: "free_delivery_threshold", value: "7500" },
  { key: "cod_enabled", value: "true" },
  { key: "payhere_enabled", value: "false" },
  { key: "hero_headline", value: "From the paddy field to your plate." },
];

async function main() {
  console.log("🌾 Seeding SamadhiRice database…");

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
  }
  console.log(`  ✓ ${categories.length} categories`);

  for (const p of products) {
    const category = await prisma.category.findUnique({ where: { slug: p.category } });
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        sinhala: p.sinhala,
        variety: p.variety,
        note: p.note,
        description: p.description,
        cookingTips: p.cookingTips,
        origin: p.origin,
        pricePerKg: p.pricePerKg,
        stockKg: p.stockKg,
        badge: p.badge ?? null,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        grainLight: p.grain.light,
        grainMid: p.grain.mid,
        grainDark: p.grain.dark,
        featured: p.featured,
        categoryId: category?.id ?? null,
        metaTitle: `${p.name} — buy fresh Sri Lankan rice online | SamadhiRice.lk`,
        metaDescription: p.note,
      },
      create: {
        slug: p.slug,
        name: p.name,
        sinhala: p.sinhala,
        variety: p.variety,
        note: p.note,
        description: p.description,
        cookingTips: p.cookingTips,
        origin: p.origin,
        pricePerKg: p.pricePerKg,
        stockKg: p.stockKg,
        badge: p.badge ?? null,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        grainLight: p.grain.light,
        grainMid: p.grain.mid,
        grainDark: p.grain.dark,
        weights: [1, 5, 10, 25],
        featured: p.featured,
        categoryId: category?.id ?? null,
        metaTitle: `${p.name} — buy fresh Sri Lankan rice online | SamadhiRice.lk`,
        metaDescription: p.note,
      },
    });
  }
  console.log(`  ✓ ${products.length} products`);

  // reviews — clear and reseed (approved) for the featured products
  for (const r of reviews) {
    const product = await prisma.product.findUnique({ where: { slug: r.product } });
    if (!product) continue;
    const exists = await prisma.review.findFirst({
      where: { productId: product.id, authorName: r.name },
    });
    if (!exists) {
      await prisma.review.create({
        data: {
          productId: product.id,
          authorName: r.name,
          place: r.place,
          rating: r.rating,
          comment: r.comment,
          approved: true,
        },
      });
    }
  }
  console.log(`  ✓ ${reviews.length} reviews`);

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`  ✓ ${settings.length} site settings`);

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
