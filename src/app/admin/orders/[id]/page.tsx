import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrder } from "@/lib/services/admin.service";
import { formatLKR } from "@/lib/pricing";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const o = await getAdminOrder(id);
  if (!o) notFound();

  return (
    <div className="max-w-4xl">
      <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-husk-soft">
        <Link href="/admin/orders" className="hover:text-paddy-700">Orders</Link>
        <span aria-hidden>/</span>
        <span className="text-husk">{o.orderNo}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-husk">{o.orderNo}</h1>
          <p className="mt-1 text-husk-soft">
            Placed {new Date(o.createdAt).toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusSelect orderId={o.id} status={o.status} />
          <a
            href={`/api/admin/orders/${o.id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-harvest-500 px-4 py-2 text-sm font-medium text-paddy-950 transition-colors hover:bg-harvest-400"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5" />
              <path d="M9 14h6M9 18h4" />
            </svg>
            Invoice PDF
          </a>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* items */}
        <section className="rounded-2xl border border-husk/10 bg-rice-50 p-6">
          <h2 className="mb-4 font-display text-xl text-husk">Items</h2>
          <ul className="divide-y divide-husk/10">
            {o.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-husk">{it.name}</p>
                  <p className="text-xs text-husk-soft">{it.weightKg}kg × {it.quantity} @ {formatLKR(it.unitPrice)}</p>
                </div>
                <span className="font-semibold text-husk">{formatLKR(it.unitPrice * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-husk/10 pt-4 text-sm">
            <div className="flex justify-between text-husk-soft"><dt>Subtotal</dt><dd>{formatLKR(o.subtotal)}</dd></div>
            <div className="flex justify-between text-husk-soft"><dt>Delivery</dt><dd>{o.deliveryFee === 0 ? "Free" : formatLKR(o.deliveryFee)}</dd></div>
            <div className="flex justify-between pt-2 font-display text-xl text-husk"><dt>Total</dt><dd>{formatLKR(o.total)}</dd></div>
          </dl>
        </section>

        {/* customer */}
        <section className="space-y-6">
          <div className="rounded-2xl border border-husk/10 bg-rice-50 p-6">
            <h2 className="mb-3 font-display text-lg text-husk">Customer</h2>
            <p className="text-sm text-husk">{o.customerName}</p>
            <p className="text-sm text-husk-soft">{o.phone}</p>
            {o.email && <p className="text-sm text-husk-soft">{o.email}</p>}
            {o.user && (
              <Link href={`/admin/customers/${o.user.id}`} className="mt-2 inline-block text-xs font-semibold text-paddy-700 hover:text-paddy-900">
                View customer →
              </Link>
            )}
          </div>
          <div className="rounded-2xl border border-husk/10 bg-rice-50 p-6">
            <h2 className="mb-3 font-display text-lg text-husk">Delivery</h2>
            <address className="text-sm not-italic leading-relaxed text-husk-soft">
              {o.addressLine}<br />
              {o.city}{o.district ? `, ${o.district}` : ""}
            </address>
            {o.notes && <p className="mt-2 text-sm text-husk-soft">“{o.notes}”</p>}
            <p className="mt-3 text-xs uppercase tracking-wide text-husk-soft">
              {o.paymentMethod} · {o.paymentStatus.toLowerCase()}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
