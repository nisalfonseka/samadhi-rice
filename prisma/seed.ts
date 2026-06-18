import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

const blogPosts = [
  {
    slug: "the-quiet-power-of-kalu-heenati",
    title: "The quiet power of Kalu Heenati",
    excerpt:
      "Sri Lanka's iron-rich heirloom red rice has been feeding families for generations. Here's why doctors quietly recommend it, and how to cook it perfectly.",
    publishedAt: new Date("2026-04-12T08:00:00Z"),
    content: `<p>Walk into any Sri Lankan grandmother's kitchen and you'll find a sack of red rice in the corner. Often, that rice is <strong>Kalu Heenati</strong> — a traditional, fine red-grained variety with a deep mahogany colour and a faintly nutty taste.</p><p>For generations Kalu Heenati was the everyday rice of villages in the dry zone. Then supermarket-sterile white rice arrived, and red rice became something of a memory. But it never quite left. And now — quietly, persuasively — it's coming back.</p><h2>Why it matters nutritionally</h2><p>Kalu Heenati is unpolished, which means the bran is still intact. That bran is where most of the iron, fibre and B-vitamins live. It has a lower glycaemic response than refined white rice, which is why physicians often recommend it to patients managing blood sugar.</p><blockquote>"It's the rice I serve my own family. Same kind that fed three generations before us."</blockquote><h2>How to cook it</h2><p>Don't be intimidated. Kalu Heenati is a touch more demanding than white rice but rewards a little attention.</p><ol><li>Rinse the rice twice in cold water.</li><li>Soak for 20–30 minutes. This softens the bran and shortens the cook time.</li><li>Use a ratio of <strong>1 cup rice : 2½ cups water</strong>.</li><li>Bring to a boil, then lower the heat and cook covered for about 30–35 minutes.</li><li>Rest, covered, off the heat for 5 minutes before fluffing with a fork.</li></ol><h2>What to eat it with</h2><p>A spoonful of warm <em>parippu</em>, a fierce <em>pol sambol</em>, a fried egg with the yolk just running, and a wedge of lime. That, frankly, is everything.</p><p>It's not exotic. It's just very, very good.</p>`,
    metaTitle: "Kalu Heenati: Sri Lanka's iron-rich heirloom red rice",
    metaDescription:
      "Why doctors recommend Kalu Heenati and how to cook this traditional Sri Lankan red rice perfectly — a practical guide.",
  },
  {
    slug: "choosing-rice-for-biryani",
    title: "Choosing the right rice for biryani (and the case for samba)",
    excerpt:
      "Long, slender Basmati gets all the credit — but the right Sri Lankan samba can stand right alongside it. A simple guide to picking and cooking the perfect biryani grain.",
    publishedAt: new Date("2026-04-26T08:00:00Z"),
    content: `<p>The grain you choose for biryani is half the dish. Get it right and every kernel stays whole, fragrant and just barely sticking to its neighbour. Get it wrong and you have a mushy yellow porridge — well-spiced, but a porridge.</p><h2>What you're looking for</h2><ul><li><strong>Long, slender grains</strong> that elongate when cooked.</li><li>A grain that <strong>stays separate</strong> after steaming.</li><li>Enough character to carry whole spices, ghee and saffron without disappearing.</li></ul><h2>The Basmati case</h2><p>Aged Basmati is the world's biryani gold standard for a reason. The grains can almost double in length, the aroma is unmistakable, and the texture is dry and fluffy.</p><h2>The samba case</h2><p>For a Sri Lankan-leaning biryani — softer, gentler — a fine <strong>Suduru Samba</strong> is wonderful. The grains are shorter but cook to a delicate, slightly chewy texture that absorbs masala beautifully without falling apart.</p><h2>The practical method</h2><ol><li>Soak the rice for at least 30 minutes — non-negotiable for long-grain rice.</li><li>Parboil with whole spices in salted water until the grain is <em>just</em> tender (about 70% done).</li><li>Drain. Layer over the masala. Seal with a lid (or a dough rim, if you're being properly fancy).</li><li>Steam for 20–25 minutes on the lowest possible heat.</li><li>Rest for 10 minutes before lifting the lid. Don't cheat.</li></ol><p>Whichever rice you pick, the rule is the same: don't crowd it, don't rush it, and let the grain do its work.</p>`,
    metaTitle: "Best rice for biryani — Basmati vs Sri Lankan samba",
    metaDescription:
      "A practical guide to picking the right rice for biryani and the case for a Sri Lankan samba alongside Basmati.",
  },
  {
    slug: "milk-rice-the-soul-of-the-sri-lankan-table",
    title: "Kiribath — the soul of the Sri Lankan table",
    excerpt:
      "A bowl of milk rice marks every important moment in a Sri Lankan home. Here is how to make it the way the grandmothers do, and why Keeri Samba is the rice for it.",
    publishedAt: new Date("2026-05-08T08:00:00Z"),
    content: `<p>Birthdays, new year's mornings, blessings, full-moon days — every important moment in a Sri Lankan home is marked with a tray of kiribath. It is rice, coconut milk and salt. That's it. And it is also somehow more than that.</p><h2>Why Keeri Samba</h2><p>Kiribath wants a soft, slightly sticky grain that binds when cool. <strong>Keeri Samba</strong>, with its tiny pearly grains and high starch, is the traditional choice. It cooks down to a creamy, silky texture that holds its shape when sliced into diamonds.</p><h2>The method</h2><ol><li>Rinse 2 cups of Keeri Samba once, gently.</li><li>Cook in <strong>3½ cups of water</strong> with a pinch of salt until tender — about 12–15 minutes covered.</li><li>Pour in <strong>1½ cups of thick coconut milk</strong> and stir gently. Don't be afraid of it; coconut milk wants to be folded in confidently.</li><li>Cook on the lowest heat for another 5–7 minutes, stirring once or twice, until the rice is glossy and pulls away from the sides.</li><li>Press into a flat tray — about an inch deep — smoothed with the back of a banana leaf if you have one, or a spoon dipped in water if you don't.</li><li>Let it cool. Slice into diamonds. Serve with lunu miris, treacle, banana, and a strong cup of tea.</li></ol><h2>A few small rules</h2><ul><li>Use freshly squeezed coconut milk if you can — cartoned will do, but the difference is real.</li><li>Don't skip the salt. Without it the coconut tastes flat.</li><li>If the surface looks oily after sitting, that's the coconut cream rising. Press gently with a clean cloth. Don't pour it off — that's the point.</li></ul><p>Kiribath is one of those dishes that is impossible to overstate the importance of. It's the dish you cook for your daughter on the morning she gets her first job. The one you make for a friend who's lost someone. The dish that says, without saying, <em>welcome</em>.</p>`,
    metaTitle: "How to make perfect kiribath (milk rice) — a Sri Lankan classic",
    metaDescription:
      "The traditional way to make kiribath with Keeri Samba — soft, creamy and perfect for celebrations.",
  },
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

  // blog posts
  for (const p of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        published: true,
        publishedAt: p.publishedAt,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
      },
      create: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        published: true,
        publishedAt: p.publishedAt,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
      },
    });
  }
  console.log(`  ✓ ${blogPosts.length} blog posts`);

  // admin user
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@samadhirice.lk").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "ADMIN", name: "Shop Admin" },
    create: { email: adminEmail, passwordHash, role: "ADMIN", name: "Shop Admin" },
  });
  console.log(`  ✓ admin user (${adminEmail})`);

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
