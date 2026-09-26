"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/services/activity.service";
import { saveSettings } from "@/lib/services/settings.service";
import {
  saveAssistantConfig,
  type AssistantDoc,
  type AssistantProvider,
} from "@/lib/services/assistant.service";
import { sendStatusUpdate } from "@/lib/services/email.service";
import { notifyOrderStatusSms, sendSMS, smsKey } from "@/lib/services/sms.service";
import { SMS_EVENTS, isValidSenderId, normalizeLkMobile, type SmsEvent } from "@/lib/sms";
import { ORDER_STATUSES, type OrderStatusValue } from "@/lib/services/admin.service";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function setOrderStatus(orderId: string, status: string) {
  const session = await assertAdmin();
  if (!ORDER_STATUSES.includes(status as OrderStatusValue)) throw new Error("Invalid status");

  const before = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (!before) throw new Error("Order not found");

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatusValue },
    include: { items: true },
  });

  // re-selecting the current status must not re-notify the customer
  if (before.status !== order.status) {
    await Promise.all([
      sendStatusUpdate({
        orderNo: order.orderNo,
        email: order.email,
        customerName: order.customerName,
        total: order.total,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        status: order.status,
        items: order.items,
      }),
      notifyOrderStatusSms(order),
    ]);
  }

  await logActivity(session.user, `Order ${order.orderNo} → ${status.toLowerCase()}`, {
    entity: order.orderNo,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  revalidatePath(`/order/${order.orderNo}`);
}

export async function bulkConfirmOrders(orderIds: string[]) {
  const session = await assertAdmin();

  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds }, status: "PENDING" },
    include: { items: true }
  });

  if (orders.length === 0) return;

  // one write for every row instead of N sequential updates
  await prisma.order.updateMany({
    where: { id: { in: orders.map((o) => o.id) } },
    data: { status: "CONFIRMED" },
  });

  // per-order notifications are independent I/O — fan them out concurrently
  await Promise.all(
    orders.map(async (order) => {
      await sendStatusUpdate({
        orderNo: order.orderNo,
        email: order.email,
        customerName: order.customerName,
        total: order.total,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        status: "CONFIRMED",
        items: order.items,
      });

      await notifyOrderStatusSms({ ...order, status: "CONFIRMED" });

      await logActivity(session.user, `Order ${order.orderNo} → confirmed (bulk)`, {
        entity: order.orderNo,
      });
    }),
  );

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

/* ----------------------------------------------------------- products --- */

const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and hyphens only"),
  categoryId: z.string().optional().or(z.literal("")),
  variety: z.string().trim().max(120).optional(),
  sinhala: z.string().trim().max(60).optional(),
  note: z.string().trim().max(300).optional(),
  description: z.string().trim().max(4000).optional(),
  cookingTips: z.string().trim().max(1000).optional(),
  origin: z.string().trim().max(120).optional(),
  pricePerKg: z.coerce.number().int().min(0).max(1_000_000),
  stockKg: z.coerce.number().int().min(0).max(1_000_000),
  badge: z.string().trim().max(40).optional().or(z.literal("")),
  featured: z.coerce.boolean(),
  hotDeal: z.coerce.boolean(),
  discountPercent: z.coerce.number().int().min(0).max(90).default(0),
  grainLight: z.string().trim().max(20).optional(),
  grainMid: z.string().trim().max(20).optional(),
  grainDark: z.string().trim().max(20).optional(),
  images: z.array(z.string().url()).max(8).default([]),
});

export type ProductFormState = { error?: string } | undefined;

function parseProduct(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  let images: string[] = [];
  try {
    images = JSON.parse((formData.get("images") as string) || "[]");
  } catch {
    /* ignore */
  }
  return productSchema.safeParse({
    ...raw,
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    hotDeal: formData.get("hotDeal") === "on" || formData.get("hotDeal") === "true",
    images,
  });
}

function productData(data: z.infer<typeof productSchema>) {
  return {
    name: data.name,
    slug: data.slug,
    categoryId: data.categoryId || null,
    variety: data.variety || null,
    sinhala: data.sinhala || null,
    note: data.note || null,
    description: data.description || null,
    cookingTips: data.cookingTips || null,
    origin: data.origin || null,
    pricePerKg: data.pricePerKg,
    stockKg: data.stockKg,
    badge: data.badge || null,
    featured: data.featured,
    hotDeal: data.hotDeal,
    discountPercent: data.discountPercent,
    grainLight: data.grainLight || null,
    grainMid: data.grainMid || null,
    grainDark: data.grainDark || null,
    images: data.images,
  };
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const session = await assertAdmin();
  const parsed = parseProduct(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const clash = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (clash) return { error: `A product with slug "${parsed.data.slug}" already exists` };

  await prisma.product.create({
    data: { ...productData(parsed.data), weights: [1, 5, 10, 25] },
  });
  await logActivity(session.user, "Created product", { entity: parsed.data.slug });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const session = await assertAdmin();
  const parsed = parseProduct(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const clash = await prisma.product.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (clash) return { error: `Another product already uses slug "${parsed.data.slug}"` };

  await prisma.product.update({ where: { id }, data: productData(parsed.data) });
  await logActivity(session.user, "Updated product", { entity: parsed.data.slug });

  revalidatePath("/admin/products");
  revalidatePath(`/shop/${parsed.data.slug}`);
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const session = await assertAdmin();
  const p = await prisma.product.delete({ where: { id } });
  await logActivity(session.user, "Deleted product", { entity: p.slug });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function toggleFeatured(id: string) {
  const session = await assertAdmin();
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return;
  await prisma.product.update({ where: { id }, data: { featured: !p.featured } });
  await logActivity(session.user, p.featured ? "Unfeatured product" : "Featured product", {
    entity: p.slug,
  });
  revalidatePath("/admin/products");
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export async function toggleHotDeal(id: string) {
  const session = await assertAdmin();
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return;
  await prisma.product.update({ where: { id }, data: { hotDeal: !p.hotDeal } });
  await logActivity(
    session.user,
    p.hotDeal ? "Removed from hot deals" : "Marked as hot deal",
    { entity: p.slug },
  );
  revalidatePath("/admin/products");
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export async function setDiscount(id: string, discountPercent: number) {
  const session = await assertAdmin();
  const pct = Math.max(0, Math.min(90, Math.floor(discountPercent || 0)));
  const p = await prisma.product.update({
    where: { id },
    data: { discountPercent: pct },
  });
  await logActivity(session.user, "Set discount", { entity: p.slug, detail: `${pct}%` });
  revalidatePath("/admin/products");
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  revalidatePath(`/shop/${p.slug}`);
}

export async function updateStock(id: string, stockKg: number) {
  const session = await assertAdmin();
  const value = Math.max(0, Math.min(1_000_000, Math.floor(stockKg)));
  const p = await prisma.product.update({ where: { id }, data: { stockKg: value } });
  await logActivity(session.user, "Updated stock", { entity: p.slug, detail: `${value}kg` });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

/* ----------------------------------------------------------- categories -- */

export async function createCategory(formData: FormData) {
  const session = await assertAdmin();
  const name = String(formData.get("name") || "").trim();
  if (name.length < 2) return;
  const slug = slugify(String(formData.get("slug") || "") || name);
  const description = String(formData.get("description") || "").trim() || null;
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) return;
  await prisma.category.create({ data: { name, slug, description } });
  await logActivity(session.user, "Created category", { entity: slug });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function updateCategory(formData: FormData) {
  const session = await assertAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  if (!id || name.length < 2) return;
  await prisma.category.update({ where: { id }, data: { name, description } });
  await logActivity(session.user, "Updated category", { entity: id });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function deleteCategory(id: string) {
  const session = await assertAdmin();
  await prisma.category.delete({ where: { id } });
  await logActivity(session.user, "Deleted category", { entity: id });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

/* -------------------------------------------------------------- reviews -- */

export async function approveReview(id: string) {
  const session = await assertAdmin();
  await prisma.review.update({ where: { id }, data: { approved: true } });
  await logActivity(session.user, "Approved review", { entity: id });
  revalidatePath("/admin/reviews");
}

export async function deleteReview(id: string) {
  const session = await assertAdmin();
  await prisma.review.delete({ where: { id } });
  await logActivity(session.user, "Deleted review", { entity: id });
  revalidatePath("/admin/reviews");
}

export async function replyReview(id: string, reply: string) {
  const session = await assertAdmin();
  await prisma.review.update({
    where: { id },
    data: { adminReply: reply.trim() || null },
  });
  await logActivity(session.user, "Replied to review", { entity: id });
  revalidatePath("/admin/reviews");
}

/* ------------------------------------------------------------ customers -- */

export async function toggleUserDisabled(id: string) {
  const session = await assertAdmin();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role === "ADMIN") return; // never disable admins here
  await prisma.user.update({ where: { id }, data: { disabled: !user.disabled } });
  await logActivity(session.user, user.disabled ? "Enabled account" : "Disabled account", {
    entity: user.email,
  });
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath("/admin/customers");
}

/* ------------------------------------------------------------- settings -- */

export async function saveShopSettings(formData: FormData) {
  const session = await assertAdmin();

  const str = (key: string) => String(formData.get(key) || "").trim();
  const posInt = (key: string) => String(Math.max(0, Number(formData.get(key)) || 0));
  const bool = (key: string) => (formData.get(key) === "on" ? "true" : "false");

  await saveSettings({
    /* delivery */
    delivery_fee_flat: posInt("delivery_fee_flat"),
    free_delivery_enabled: bool("free_delivery_enabled"),
    free_delivery_threshold: posInt("free_delivery_threshold"),
    /* payment */
    cod_enabled: bool("cod_enabled"),
    payhere_enabled: bool("payhere_enabled"),
    /* storefront copy */
    hero_headline: str("hero_headline"),
    site_tagline: str("site_tagline"),
    meta_description: str("meta_description"),
    /* contact */
    contact_phone: str("contact_phone"),
    contact_whatsapp: str("contact_whatsapp"),
    contact_email: str("contact_email"),
    /* location */
    address_line1: str("address_line1"),
    address_city: str("address_city"),
    address_google_maps: str("address_google_maps"),
    business_hours: str("business_hours"),
    delivery_zones: str("delivery_zones"),
    /* social */
    social_facebook: str("social_facebook"),
    social_instagram: str("social_instagram"),
    social_youtube: str("social_youtube"),
    social_tiktok: str("social_tiktok"),
  });

  await logActivity(session.user, "Updated shop settings");
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/shop");
}

/* ------------------------------------------------------------- AI assistant -- */

export async function saveAssistant(formData: FormData) {
  const session = await assertAdmin();

  const str = (key: string) => String(formData.get(key) || "").trim();

  let docs: AssistantDoc[] = [];
  try {
    const parsed = JSON.parse(str("assistant_docs") || "[]");
    if (Array.isArray(parsed)) {
      docs = parsed
        .map((d, i) => ({
          id: String(d.id || `doc-${i}`),
          title: String(d.title || "").slice(0, 160),
          content: String(d.content || "").slice(0, 8000),
        }))
        .filter((d) => d.title.trim() || d.content.trim());
    }
  } catch {
    /* ignore malformed docs */
  }

  const suggestions = str("assistant_suggestions")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  const provider = (str("assistant_provider") || "openai") as AssistantProvider;

  await saveAssistantConfig({
    enabled: formData.get("assistant_enabled") === "on",
    provider,
    model: str("assistant_model") || (provider === "gemini" ? "gemini-2.5-flash" : "gpt-5-mini"),
    greeting: str("assistant_greeting"),
    systemPrompt: str("assistant_system_prompt"),
    suggestions,
    docs,
  });

  await logActivity(session.user, "Updated AI assistant");
  revalidatePath("/admin/assistant");
  revalidatePath("/", "layout");
}

/* ---------------------------------------------------------- homepage sections -- */

export async function toggleSection(key: string, enabled: boolean) {
  await assertAdmin();
  const allowed = [
    "section_hot_products",
    "section_offers",
    "section_origin_story",
    "section_trust_stats",
    "section_testimonials",
    "section_blog_preview",
    "section_newsletter",
  ];
  if (!allowed.includes(key)) throw new Error("Invalid section key");
  await saveSettings({ [key]: enabled ? "true" : "false" });
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

/* ------------------------------------------------------------ branches -- */

function parseBranchImages(formData: FormData): string[] {
  try {
    return JSON.parse((formData.get("images") as string) || "[]").filter(Boolean);
  } catch {
    return [];
  }
}

export async function createBranch(formData: FormData) {
  const session = await assertAdmin();
  const name = String(formData.get("name") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  if (!name || !address) return;
  const maxPos = await prisma.branch.findFirst({ orderBy: { position: "desc" }, select: { position: true } });
  await prisma.branch.create({
    data: {
      name,
      address,
      city,
      phone: String(formData.get("phone") || "").trim() || null,
      hours: String(formData.get("hours") || "").trim() || null,
      description: String(formData.get("description") || "").trim() || null,
      mapsUrl: String(formData.get("mapsUrl") || "").trim() || null,
      images: parseBranchImages(formData),
      position: (maxPos?.position ?? -1) + 1,
    },
  });
  await logActivity(session.user, "Added branch", { entity: name });
  revalidatePath("/admin/settings");
  revalidatePath("/branches");
  revalidatePath("/");
}

export async function updateBranch(id: string, formData: FormData) {
  const session = await assertAdmin();
  const name = String(formData.get("name") || "").trim();
  const address = String(formData.get("address") || "").trim();
  if (!name || !address) return;
  await prisma.branch.update({
    where: { id },
    data: {
      name,
      address,
      city: String(formData.get("city") || "").trim(),
      phone: String(formData.get("phone") || "").trim() || null,
      hours: String(formData.get("hours") || "").trim() || null,
      description: String(formData.get("description") || "").trim() || null,
      mapsUrl: String(formData.get("mapsUrl") || "").trim() || null,
      images: parseBranchImages(formData),
    },
  });
  await logActivity(session.user, "Updated branch", { entity: name });
  revalidatePath("/admin/settings");
  revalidatePath("/branches");
  revalidatePath("/");
}

export async function deleteBranch(id: string) {
  const session = await assertAdmin();
  const b = await prisma.branch.delete({ where: { id } });
  await logActivity(session.user, "Deleted branch", { entity: b.name });
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

/* Offer mutations live in app/admin/offers/actions.ts */

/* ------------------------------------------------------------------ sms -- */

export type SmsActionResult = { ok: boolean; message: string };

const SMS_MAX_CHARS = 480; // 3 GSM segments — long enough, stops runaway costs

function revalidateSms() {
  revalidatePath("/admin/sms");
}

/** Master switch ("enabled") or one event's on/off switch. */
export async function setSmsSwitch(target: "enabled" | SmsEvent, enabled: boolean) {
  const session = await assertAdmin();
  if (target !== "enabled" && !SMS_EVENTS.includes(target)) throw new Error("Invalid SMS event");
  const key = target === "enabled" ? smsKey.enabled : smsKey.eventEnabled(target);
  await saveSettings({ [key]: enabled ? "true" : "false" });
  await logActivity(
    session.user,
    `SMS ${target === "enabled" ? "notifications" : target.toLowerCase().replace(/_/g, " ")} ${enabled ? "on" : "off"}`,
  );
  revalidateSms();
}

/** Saves an event's template; an empty template resets it to the default. */
export async function saveSmsTemplate(event: SmsEvent, template: string): Promise<SmsActionResult> {
  const session = await assertAdmin();
  if (!SMS_EVENTS.includes(event)) return { ok: false, message: "Unknown event" };
  const t = template.trim();
  if (t.length > SMS_MAX_CHARS) return { ok: false, message: `Keep it under ${SMS_MAX_CHARS} characters` };

  const key = smsKey.eventTemplate(event);
  if (!t) await prisma.siteSetting.deleteMany({ where: { key } });
  else await saveSettings({ [key]: t });

  await logActivity(session.user, `SMS template ${t ? "updated" : "reset"}`, { entity: event });
  revalidateSms();
  return { ok: true, message: t ? "Template saved" : "Reset to default" };
}

export async function saveSmsGateway(senderId: string, adminPhone: string): Promise<SmsActionResult> {
  const session = await assertAdmin();
  const sender = senderId.trim();
  const phone = adminPhone.trim();
  if (!isValidSenderId(sender)) {
    return { ok: false, message: "Sender ID: up to 11 letters/numbers, or a phone number" };
  }
  if (phone && !normalizeLkMobile(phone)) {
    return { ok: false, message: "Shop phone must be a Sri Lankan mobile (07X…)" };
  }
  await saveSettings({ [smsKey.senderId]: sender, [smsKey.adminPhone]: phone });
  await logActivity(session.user, "SMS gateway settings updated", { entity: sender });
  revalidateSms();
  return { ok: true, message: "Saved" };
}

function resultMessage(r: Awaited<ReturnType<typeof sendSMS>>, okText: string): SmsActionResult {
  return r.ok ? { ok: true, message: okText } : { ok: false, message: r.error };
}

export async function sendTestSms(phone: string, message: string): Promise<SmsActionResult> {
  const session = await assertAdmin();
  const text = message.trim();
  if (!text) return { ok: false, message: "Write a message first" };
  if (text.length > SMS_MAX_CHARS) return { ok: false, message: "Message is too long" };
  if (!normalizeLkMobile(phone)) return { ok: false, message: "Enter a Sri Lankan mobile number (07X…)" };

  const r = await sendSMS(phone, text, { event: "TEST" });
  await logActivity(session.user, `Test SMS ${r.ok ? "sent" : "failed"}`, { entity: phone });
  revalidateSms();
  return resultMessage(r, "Test SMS sent — check the phone");
}

/** Re-sends a failed/skipped message exactly as it was logged. */
export async function retrySms(logId: string): Promise<SmsActionResult> {
  const session = await assertAdmin();
  const entry = await prisma.smsLog.findUnique({ where: { id: logId } });
  if (!entry) return { ok: false, message: "Log entry not found" };
  if (entry.status === "SENT") return { ok: false, message: "Already delivered" };

  const r = await sendSMS(entry.to, entry.message, {
    event: entry.event,
    orderNo: entry.orderNo,
    logId: entry.id,
  });
  await logActivity(session.user, `SMS retry ${r.ok ? "sent" : "failed"}`, { entity: entry.orderNo ?? entry.to });
  revalidateSms();
  if (entry.orderNo) revalidatePath("/admin/orders");
  return resultMessage(r, "Sent");
}

/** A one-off message to an order's customer, from the order page. */
export async function sendOrderSms(orderId: string, message: string): Promise<SmsActionResult> {
  const session = await assertAdmin();
  const text = message.trim();
  if (!text) return { ok: false, message: "Write a message first" };
  if (text.length > SMS_MAX_CHARS) return { ok: false, message: "Message is too long" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { orderNo: true, phone: true },
  });
  if (!order) return { ok: false, message: "Order not found" };

  const r = await sendSMS(order.phone, text, { event: "MANUAL", orderNo: order.orderNo });
  await logActivity(session.user, `SMS to customer ${r.ok ? "sent" : "failed"}`, { entity: order.orderNo });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidateSms();
  return resultMessage(r, "Message sent");
}
