import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export const LOW_STOCK_KG = 100;

export async function getDashboardStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    todayOrders,
    todayAgg,
    totalAgg,
    totalOrders,
    pendingOrders,
    productCount,
    lowStock,
    recentOrders,
  ] = await prisma.$transaction([
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: startOfDay } },
    }),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count(),
    prisma.product.findMany({
      where: { stockKg: { lt: LOW_STOCK_KG } },
      orderBy: { stockKg: "asc" },
      take: 6,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 7,
      include: { items: true },
    }),
  ]);

  return {
    todayOrders,
    todayRevenue: todayAgg._sum.total ?? 0,
    totalRevenue: totalAgg._sum.total ?? 0,
    totalOrders,
    pendingOrders,
    productCount,
    lowStock,
    recentOrders,
  };
}

export async function getAdminProducts() {
  return prisma.product.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      pricePerKg: true,
      stockKg: true,
      featured: true,
      badge: true,
      grainMid: true,
      category: { select: { name: true } },
    },
  });
}

export async function getAdminProduct(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export type OrderFilters = {
  status?: OrderStatusValue;
  q?: string;
  payment?: "COD" | "PAYHERE";
  from?: Date;
  to?: Date;
};

export async function getAdminOrders(f: OrderFilters = {}) {
  const where: Prisma.OrderWhereInput = {};
  if (f.status) where.status = f.status;
  if (f.payment) where.paymentMethod = f.payment;
  if (f.q) {
    where.OR = [
      { orderNo: { contains: f.q, mode: "insensitive" } },
      { customerName: { contains: f.q, mode: "insensitive" } },
      { email: { contains: f.q, mode: "insensitive" } },
      { phone: { contains: f.q } },
    ];
  }
  if (f.from || f.to) where.createdAt = { gte: f.from, lte: f.to };
  return prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNo: true,
      customerName: true,
      phone: true,
      email: true,
      addressLine: true,
      city: true,
      district: true,
      notes: true,
      createdAt: true,
      subtotal: true,
      deliveryFee: true,
      total: true,
      paymentMethod: true,
      paymentStatus: true,
      status: true,
      items: {
        select: { name: true, quantity: true, weightKg: true, unitPrice: true },
      },
    },
    take: 200,
  });
}

export async function getAdminOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, user: true },
  });
}

export async function getCategoriesSimple() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getCategoriesWithProductCounts() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

/* ---------------------------------------------------------- analytics --- */

export async function getAnalytics(days = 14) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const [orders, statusGroups, items, customers] = await prisma.$transaction([
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { total: true, createdAt: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true }, orderBy: { status: "asc" } }),
    prisma.orderItem.findMany({ select: { name: true, quantity: true, unitPrice: true } }),
    prisma.user.findMany({
      where: { role: "CUSTOMER", createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const dayKeys: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    dayKeys.push(d.toISOString().slice(0, 10));
  }
  const revenueByDay = new Map(dayKeys.map((k) => [k, 0]));
  const ordersByDay = new Map(dayKeys.map((k) => [k, 0]));
  const newCustomersByDay = new Map(dayKeys.map((k) => [k, 0]));

  for (const o of orders) {
    const k = o.createdAt.toISOString().slice(0, 10);
    if (revenueByDay.has(k)) {
      revenueByDay.set(k, revenueByDay.get(k)! + o.total);
      ordersByDay.set(k, ordersByDay.get(k)! + 1);
    }
  }
  for (const c of customers) {
    const k = c.createdAt.toISOString().slice(0, 10);
    if (newCustomersByDay.has(k)) newCustomersByDay.set(k, newCustomersByDay.get(k)! + 1);
  }

  const topMap = new Map<string, { qty: number; revenue: number }>();
  for (const it of items) {
    const cur = topMap.get(it.name) ?? { qty: 0, revenue: 0 };
    cur.qty += it.quantity;
    cur.revenue += it.unitPrice * it.quantity;
    topMap.set(it.name, cur);
  }
  const topProducts = [...topMap.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return {
    days: dayKeys,
    revenue: dayKeys.map((k) => revenueByDay.get(k)!),
    orders: dayKeys.map((k) => ordersByDay.get(k)!),
    newCustomers: dayKeys.map((k) => newCustomersByDay.get(k)!),
    statusBreakdown: statusGroups.map((g) => ({ status: g.status, count: (g._count as { _all?: number })._all ?? 0 })),
    topProducts,
    periodRevenue: orders.reduce((s, o) => s + o.total, 0),
    periodOrders: orders.length,
    periodCustomers: customers.length,
  };
}

/* ---------------------------------------------------------- customers --- */

export async function getCustomers(q?: string) {
  const where: Prisma.UserWhereInput = { role: "CUSTOMER" };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  const sums = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { in: users.map((u) => u.id) } },
    _sum: { total: true },
    orderBy: { userId: "asc" },
  });
  const spent = new Map(sums.map((s) => [s.userId, s._sum.total ?? 0]));
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    disabled: u.disabled,
    createdAt: u.createdAt,
    orderCount: u._count.orders,
    totalSpent: spent.get(u.id) ?? 0,
  }));
}

export async function getCustomer(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, include: { items: true } },
      addresses: true,
    },
  });
}

/* ------------------------------------------------------------ reviews --- */

export async function getReviews(filter?: "pending" | "approved") {
  const where =
    filter === "pending"
      ? { approved: false }
      : filter === "approved"
        ? { approved: true }
        : {};
  return prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true, slug: true } } },
    take: 200,
  });
}

export async function getPendingReviewCount() {
  return prisma.review.count({ where: { approved: false } });
}
