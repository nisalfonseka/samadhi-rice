import {
  getAdminOrders,
  ORDER_STATUSES,
  type OrderStatusValue,
} from "@/lib/services/admin.service";
import { getAdminSession } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

function csvCell(v: string | number) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return new Response("Unauthorized", { status: 403 });

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const paymentParam = searchParams.get("payment");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const orders = await getAdminOrders({
    status: ORDER_STATUSES.includes(statusParam as OrderStatusValue)
      ? (statusParam as OrderStatusValue)
      : undefined,
    payment: paymentParam === "COD" || paymentParam === "PAYHERE" ? paymentParam : undefined,
    q: searchParams.get("q")?.trim() || undefined,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to + "T23:59:59") : undefined,
  });

  const header = [
    "Order No",
    "Date",
    "Customer",
    "Phone",
    "Email",
    "City",
    "District",
    "Items",
    "Subtotal",
    "Delivery",
    "Total",
    "Payment",
    "Payment Status",
    "Status",
  ];

  const rows = orders.map((o) =>
    [
      o.orderNo,
      new Date(o.createdAt).toISOString().slice(0, 10),
      o.customerName,
      o.phone,
      o.email,
      o.city,
      o.district ?? "",
      o.items.map((it) => `${it.name} ${it.weightKg}kg x${it.quantity}`).join("; "),
      o.subtotal,
      o.deliveryFee,
      o.total,
      o.paymentMethod,
      o.paymentStatus,
      o.status,
    ]
      .map(csvCell)
      .join(","),
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="samadhirice-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
