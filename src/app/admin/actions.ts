"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/services/activity.service";
import { saveSettings } from "@/lib/services/settings.service";
import { sendStatusUpdate } from "@/lib/services/email.service";
import { ORDER_STATUSES, type OrderStatusValue } from "@/lib/services/admin.service";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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

/* --------------------------------------------------------------- orders -- */

export async function setOrderStatus(orderId: string, status: string) {
  const session = await assertAdmin();
  if (!ORDER_STATUSES.includes(status as OrderStatusValue)) throw new Error("Invalid status");

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatusValue },
    include: { items: true },
  });

  await sendStatusUpdate({
    orderNo: order.orderNo,
    email: order.email,
    customerName: order.customerName,
    total: order.total,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    status: order.status,
    items: order.items,
  });
  await logActivity(session.user, `Order ${order.orderNo} → ${status.toLowerCase()}`, {
    entity: order.orderNo,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  revalidatePath(`/order/${order.orderNo}`);
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
