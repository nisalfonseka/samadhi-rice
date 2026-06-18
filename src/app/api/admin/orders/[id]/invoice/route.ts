import { getAdminSession } from "@/lib/admin-guard";
import { getAdminOrder } from "@/lib/services/admin.service";
import { InvoiceDocument, type InvoiceData } from "@/lib/pdf/Invoice";
import { renderPdf, safeFilename } from "@/lib/pdf/render";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return new Response("Unauthorized", { status: 403 });

  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) return new Response("Not found", { status: 404 });

  const data: InvoiceData = {
    orderNo: order.orderNo,
    createdAt: order.createdAt,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    addressLine: order.addressLine,
    city: order.city,
    district: order.district,
    notes: order.notes,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    items: order.items.map((it) => ({
      name: it.name,
      weightKg: it.weightKg,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    })),
  };

  const buffer = await renderPdf(InvoiceDocument({ data }));
  const filename = `SamadhiRice-${safeFilename(order.orderNo)}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
