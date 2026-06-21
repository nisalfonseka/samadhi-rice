import { prisma } from "@/lib/db";

/**
 * "Rice Finder" AI assistant — configuration + prompt assembly.
 *
 * Kept deliberately simple: instead of a vector DB, the whole (small) rice
 * catalogue plus a handful of admin-written knowledge documents are stuffed
 * into the system prompt. For a single shop this is accurate, cheap and has
 * zero retrieval infrastructure to maintain. Config lives in SiteSetting rows
 * so there is no extra migration.
 */

export interface AssistantDoc {
  id: string;
  title: string;
  content: string;
}

export type AssistantProvider = "openai" | "gemini";

export interface AssistantConfig {
  enabled: boolean;
  provider: AssistantProvider;
  model: string;
  greeting: string;
  systemPrompt: string;
  suggestions: string[];
  docs: AssistantDoc[];
}

const KEY = {
  enabled: "assistant_enabled",
  provider: "assistant_provider",
  model: "assistant_model",
  greeting: "assistant_greeting",
  prompt: "assistant_system_prompt",
  suggestions: "assistant_suggestions",
  docs: "assistant_docs",
} as const;

export const DEFAULT_SYSTEM_PROMPT = `You are "Rice Finder", the friendly in-house assistant for SamadhiRice.lk, a Sri Lankan heritage rice shop that mills single-origin rice to order.

Your job: help shoppers choose the right rice for what they are cooking, their taste, their health needs and their budget — then point them to the exact product on the site.

How to behave:
- Be warm, concise and practical. Short paragraphs. Sri Lankan-friendly tone.
- Recommend ONLY rice varieties that appear in the CATALOGUE below. Never invent products, prices or claims.
- When you recommend a product, name it exactly as written and mention why it fits (texture, flavour, use, health note). Mention the per-kg price when helpful.
- Ask one short clarifying question if you genuinely need it (e.g. what they're cooking, how many people, any dietary needs) — but don't interrogate; give a recommendation as soon as you reasonably can.
- For health questions (e.g. diabetes), share general guidance from the knowledge notes and suggest suitable varieties, but add a brief reminder to consult a doctor for medical advice. Do not diagnose.
- If asked something outside rice/cooking/orders/delivery, gently steer back, or suggest they message the shop on WhatsApp for anything you can't answer.
- Keep answers focused on helping them buy the right rice. Use plain text (no markdown headings).`;

const DEFAULT_GREETING =
  "Hi! I'm Rice Finder 🌾 Tell me what you're cooking or what you're after, and I'll help you pick the perfect rice.";

const DEFAULT_SUGGESTIONS = [
  "Best rice for biryani?",
  "Something healthy for daily meals",
  "Diabetic-friendly options",
  "I want to buy in bulk",
];

function settingsToMap(rows: { key: string; value: string }[]) {
  return new Map(rows.map((r) => [r.key, r.value]));
}

export async function getAssistantConfig(): Promise<AssistantConfig> {
  let m = new Map<string, string>();
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: Object.values(KEY) } },
    });
    m = settingsToMap(rows);
  } catch {
    /* DB unavailable — fall back to defaults */
  }

  let docs: AssistantDoc[] = [];
  try {
    docs = JSON.parse(m.get(KEY.docs) || "[]");
    if (!Array.isArray(docs)) docs = [];
  } catch {
    docs = [];
  }

  let suggestions: string[] = DEFAULT_SUGGESTIONS;
  try {
    const parsed = JSON.parse(m.get(KEY.suggestions) || "null");
    if (Array.isArray(parsed) && parsed.length) suggestions = parsed;
  } catch {
    /* keep defaults */
  }

  const provider = (m.get(KEY.provider) || "openai") as AssistantProvider;
  const defaultModel = provider === "gemini" ? "gemini-2.5-flash" : "gpt-5-mini";

  return {
    enabled: (m.get(KEY.enabled) ?? "true") === "true",
    provider,
    model: m.get(KEY.model) || defaultModel,
    greeting: m.get(KEY.greeting) || DEFAULT_GREETING,
    systemPrompt: m.get(KEY.prompt) || DEFAULT_SYSTEM_PROMPT,
    suggestions,
    docs,
  };
}

export async function saveAssistantConfig(input: {
  enabled: boolean;
  provider: AssistantProvider;
  model: string;
  greeting: string;
  systemPrompt: string;
  suggestions: string[];
  docs: AssistantDoc[];
}) {
  const entries: Record<string, string> = {
    [KEY.enabled]: String(input.enabled),
    [KEY.provider]: input.provider,
    [KEY.model]: input.model,
    [KEY.greeting]: input.greeting,
    [KEY.prompt]: input.systemPrompt,
    [KEY.suggestions]: JSON.stringify(input.suggestions),
    [KEY.docs]: JSON.stringify(input.docs),
  };
  await Promise.all(
    Object.entries(entries).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );
}

/** Compact, model-friendly rendering of the live catalogue. */
async function catalogueText(): Promise<string> {
  let products: {
    name: string;
    variety: string | null;
    sinhala: string | null;
    note: string | null;
    description: string | null;
    origin: string | null;
    pricePerKg: number;
    stockKg: number;
    discountPercent: number;
    badge: string | null;
    cookingTips: string | null;
    slug: string;
  }[] = [];
  try {
    products = await prisma.product.findMany({
      orderBy: { featured: "desc" },
      select: {
        name: true,
        variety: true,
        sinhala: true,
        note: true,
        description: true,
        origin: true,
        pricePerKg: true,
        stockKg: true,
        discountPercent: true,
        badge: true,
        cookingTips: true,
        slug: true,
      },
    });
  } catch {
    return "(Catalogue temporarily unavailable.)";
  }

  if (products.length === 0) return "(No products are currently listed.)";

  return products
    .map((p) => {
      const bits = [
        `• ${p.name}${p.variety ? ` (${p.variety})` : ""}${p.sinhala ? ` [${p.sinhala}]` : ""}`,
        `  Price: Rs.${p.pricePerKg}/kg${p.discountPercent > 0 ? ` (−${p.discountPercent}% off)` : ""}`,
        p.origin ? `  Origin: ${p.origin}` : "",
        p.note ? `  Note: ${p.note}` : "",
        p.description ? `  About: ${p.description.slice(0, 280)}` : "",
        p.cookingTips ? `  Cooking: ${p.cookingTips.slice(0, 200)}` : "",
        p.stockKg <= 0 ? "  (Currently out of stock)" : "",
        `  Slug: ${p.slug}`,
      ].filter(Boolean);
      return bits.join("\n");
    })
    .join("\n\n");
}

/** Published blog articles, stripped + truncated, used as extra knowledge. */
async function blogKnowledge(): Promise<string> {
  let posts: { title: string; slug: string; excerpt: string | null; content: string }[] = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 12,
      select: { title: true, slug: true, excerpt: true, content: true },
    });
  } catch {
    return "";
  }
  if (posts.length === 0) return "";
  return posts
    .map((p) => {
      const body = p.content
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 1400);
      return `### ${p.title} (article: /blog/${p.slug})\n${p.excerpt ? p.excerpt + "\n" : ""}${body}`;
    })
    .join("\n\n");
}

/** Full system prompt = behaviour + live catalogue + admin notes + blog guides. */
export async function buildSystemPrompt(config: AssistantConfig): Promise<string> {
  const [catalogue, blog] = await Promise.all([catalogueText(), blogKnowledge()]);

  const adminNotes = config.docs
    .filter((d) => d.title.trim() || d.content.trim())
    .map((d) => `### ${d.title}\n${d.content}`)
    .join("\n\n");
  const notes = [adminNotes, blog].filter(Boolean).join("\n\n");

  return [
    config.systemPrompt,
    "\n\n=== CATALOGUE (the only products you may recommend) ===\n" + catalogue,
    notes ? "\n\n=== KNOWLEDGE NOTES (rice guides & published articles) ===\n" + notes : "",
    "\n\n=== SHOWING PRODUCT CARDS & ARTICLES ===\n" +
      "When you recommend a specific rice, show a product card for it by writing this exact marker on its own line: [[product:SLUG]] — replace SLUG with that product's Slug from the catalogue. Write one short sentence about why it fits, then the marker. Recommend at most 3 products and never invent a slug. " +
      "When a published article (a /blog/... link above) is genuinely relevant, you may point the shopper to it by mentioning its /blog/... path in your reply.",
  ].join("");
}
