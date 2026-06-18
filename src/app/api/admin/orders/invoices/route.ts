import { getAdminSession } from "@/lib/admin-guard";
import {
  getAdminOrders,
  ORDER_STATUSES,
  type OrderStatusValue,
} from "@/lib/services/admin.service";
import { InvoiceBatchDocument, type InvoiceData } from "@/lib/pdf/Invoice";
import { renderPdf } from "@/lib/pdf/render";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
    payment:
      paymentParam === "COD" || paymentParam === "PAYHERE" ? paymentParam : undefined,
    q: searchParams.get("q")?.trim() || undefined,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to + "T23:59:59") : undefined,
  });

  if (orders.length === 0) {
    return new Response("No orders match these filters.", { status: 404 });
  }

  const data: InvoiceData[] = orders.map((o) => ({
    orderNo: o.orderNo,
    createdAt: o.createdAt,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    customerName: o.customerName,
    email: o.email,
    phone: o.phone,
    addressLine: o.addressLine,
    city: o.city,
    district: o.district,
    notes: o.notes,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    total: o.total,
    items: o.items.map((it) => ({
      name: it.name,
      weightKg: it.weightKg,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    })),
  }));

  const buffer = await renderPdf(InvoiceBatchDocument({ orders: data }));
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `SamadhiRice-invoices-${stamp}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
