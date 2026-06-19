import { prisma } from "@/lib/db";
import { priceFor, type WeightKg } from "@/lib/pricing";
import { getSettings, deliveryFeeFrom } from "@/lib/services/settings.service";
import { sendOrderConfirmation } from "@/lib/services/email.service";

export class OrderError extends Error {}

const ALLOWED_WEIGHTS = [1, 5, 10, 25];

export type CreateOrderInput = {
  customerName: string;
  email?: string;
  phone: string;
  addressLine: string;
  city: string;
  district?: string;
  notes?: string;
  paymentMethod: "COD";
  items: { slug: string; weight: number; qty: number }[];
  /** set when the order is placed by a logged-in customer */
  userId?: string;
};

function generateOrderNo(): string {
  const t = Date.now().toString(36).toUpperCase().slice(-6);
  const r = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `SR-${t}${r}`;
}

/**
 * Creates an order. Prices, weights and totals are ALWAYS recomputed from the
 * database — the client's prices are never trusted.
 */
export async function createOrder(input: CreateOrderInput) {
  const slugs = [...new Set(input.items.map((i) => i.slug))];
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs } },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const items: {
    productId: string;
    name: string;
    weightKg: number;
    unitPrice: number;
    quantity: number;
  }[] = [];
  let subtotal = 0;

  for (const i of input.items) {
    const product = bySlug.get(i.slug);
    if (!product) throw new OrderError(`Product not found: ${i.slug}`);
    if (!ALLOWED_WEIGHTS.includes(i.weight))
      throw new OrderError(`Unsupported weight: ${i.weight}kg`);
    if (product.stockKg <= 0)
      throw new OrderError(`${product.name} is out of stock`);

    const qty = Math.max(1, Math.min(99, Math.floor(i.qty)));
    const unitPrice = priceFor(
      product.pricePerKg,
      i.weight as WeightKg,
      product.discountPercent ?? 0,
    );
    subtotal += unitPrice * qty;
    items.push({
      productId: product.id,
      name: product.name,
      weightKg: i.weight,
      unitPrice,
      quantity: qty,
    });
  }

  if (items.length === 0) throw new OrderError("Your cart is empty");

  const settings = await getSettings();
  const deliveryFee = deliveryFeeFrom(settings, subtotal);
  const total = subtotal + deliveryFee;

  // ensure a unique order number
  let orderNo = generateOrderNo();
  for (let attempt = 0; attempt < 4; attempt++) {
    const clash = await prisma.order.findUnique({ where: { orderNo } });
    if (!clash) break;
    orderNo = generateOrderNo();
  }

  const order = await prisma.order.create({
    data: {
      orderNo,
      userId: input.userId ?? null,
      customerName: input.customerName,
      email: input.email ?? "",
      phone: input.phone,
      addressLine: input.addressLine,
      city: input.city,
      district: input.district || null,
      notes: input.notes || null,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      status: "PENDING",
      subtotal,
      deliveryFee,
      total,
      items: { create: items },
    },
    include: { items: true },
  });

  await sendOrderConfirmation({
    orderNo: order.orderNo,
    email: order.email,
    customerName: order.customerName,
    total: order.total,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    status: order.status,
    items: order.items,
  });

  return order;
}

export async function getOrderByNo(orderNo: string) {
  return prisma.order.findUnique({
    where: { orderNo },
    include: { items: true },
  });
}
