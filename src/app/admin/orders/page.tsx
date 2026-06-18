import Link from "next/link";
import {
  getAdminOrders,
  ORDER_STATUSES,
  type OrderStatusValue,
} from "@/lib/services/admin.service";
import { formatLKR } from "@/lib/pricing";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export const dynamic = "force-dynamic";

type SP = {
  status?: string;
  q?: string;
  payment?: string;
  from?: string;
  to?: string;
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const status = ORDER_STATUSES.includes(sp.status as OrderStatusValue)
    ? (sp.status as OrderStatusValue)
    : undefined;
  const payment = sp.payment === "COD" || sp.payment === "PAYHERE" ? sp.payment : undefined;

  const orders = await getAdminOrders({
    status,
    payment,
    q: sp.q?.trim() || undefined,
    from: sp.from ? new Date(sp.from) : undefined,
    to: sp.to ? new Date(sp.to + "T23:59:59") : undefined,
  });

  const filterQs = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v) as [string, string][],
  ).toString();
  const exportCsvHref = `/api/admin/orders/export${filterQs ? `?${filterQs}` : ""}`;
  const printAllHref = `/api/admin/orders/invoices${filterQs ? `?${filterQs}` : ""}`;

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-husk">Orders</h1>
          <p className="mt-1 text-husk-soft">{orders.length} shown.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={exportCsvHref}
            className="rounded-full border border-husk/15 px-5 py-2.5 text-sm font-medium text-husk transition-colors hover:border-paddy-600"
          >
            Export CSV ↓
          </a>
          <a
            href={printAllHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={orders.length === 0}
            className={`inline-flex items-center gap-2 rounded-full bg-paddy-800 px-5 py-2.5 text-sm font-medium text-rice-50 transition-colors hover:bg-paddy-900 ${
              orders.length === 0 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <PdfIcon /> Print all filtered (PDF)
          </a>
        </div>
      </header>

      {/* filters */}
      <form method="get" action="/admin/orders" className="mb-6 grid gap-3 rounded-2xl border border-husk/10 bg-rice-50 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] lg:items-end">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-husk-soft">Search</span>
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Order no, name, phone…" className="ctrl !py-2" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-husk-soft">Status</span>
          <select name="status" defaultValue={status ?? ""} className="ctrl !py-2">
            <option value="">Any</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-husk-soft">Payment</span>
          <select name="payment" defaultValue={payment ?? ""} className="ctrl !py-2">
            <option value="">Any</option>
            <option value="COD">COD</option>
            <option value="PAYHERE">PayHere</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-husk-soft">From</span>
          <input type="date" name="from" defaultValue={sp.from ?? ""} className="ctrl !py-2" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-husk-soft">To</span>
          <input type="date" name="to" defaultValue={sp.to ?? ""} className="ctrl !py-2" />
        </label>
        <button className="rounded-full bg-paddy-800 px-5 py-2.5 text-sm font-medium text-rice-50 hover:bg-paddy-900">
          Filter
        </button>
      </form>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-husk/10 bg-rice-50 px-6 py-16 text-center text-husk-soft">
          No orders match these filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-husk/10 bg-rice-50">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-husk/10 text-xs uppercase tracking-wider text-husk-soft">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Pay</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-husk/10">
              {orders.map((o) => (
                <tr key={o.id} className="align-top hover:bg-husk/[0.02]">
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-husk hover:text-paddy-800">
                      {o.orderNo}
                    </Link>
                    <p className="mt-0.5 max-w-[16rem] truncate text-xs text-husk-soft">
                      {o.items.map((it) => `${it.name} ×${it.quantity}`).join(", ")}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-husk">{o.customerName}</p>
                    <p className="text-xs text-husk-soft">{o.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-husk-soft">
                    {new Date(o.createdAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4 font-semibold text-husk">{formatLKR(o.total)}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-husk/5 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-husk-soft">
                      {o.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <OrderStatusSelect orderId={o.id} status={o.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-husk/15 px-3 py-1.5 text-xs font-medium text-husk transition-colors hover:border-paddy-600 hover:text-paddy-800"
                      >
                        <EyeIcon /> View
                      </Link>
                      <a
                        href={`/api/admin/orders/${o.id}/invoice`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Print invoice for ${o.orderNo}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-harvest-600/40 bg-harvest-500/10 px-3 py-1.5 text-xs font-medium text-harvest-700 transition-colors hover:border-harvest-600 hover:bg-harvest-500 hover:text-paddy-950"
                      >
                        <PdfIcon /> PDF
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 14h6M9 18h4" />
    </svg>
  );
}
