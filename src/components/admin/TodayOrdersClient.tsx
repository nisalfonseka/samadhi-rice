"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { bulkConfirmOrders } from "@/app/admin/actions";
import { formatLKR } from "@/lib/pricing";

type OrderItemLite = { name: string; quantity: number; weightKg: number; unitPrice: number };
type AdminOrder = {
  id: string;
  orderNo: string;
  customerName: string;
  phone: string | null;
  createdAt: Date;
  total: number;
  paymentMethod: string;
  status: string;
  items: OrderItemLite[];
};

export default function TodayOrdersClient({ orders }: { orders: AdminOrder[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "COD" | "PAYHERE">("ALL");
  const [pending, start] = useTransition();
  const router = useRouter();

  const filteredOrders = orders.filter((o) => {
    if (paymentFilter === "ALL") return true;
    return o.paymentMethod === paymentFilter;
  });

  const toggleAll = () => {
    if (selected.size === filteredOrders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleConfirmAll = () => {
    if (selected.size === 0) return;
    start(async () => {
      await bulkConfirmOrders(Array.from(selected));
      setSelected(new Set());
      router.refresh();
    });
  };

  const handleConfirmAndPrintAll = () => {
    if (selected.size === 0) return;
    start(async () => {
      await bulkConfirmOrders(Array.from(selected));
      
      const idsQuery = Array.from(selected).join(",");
      const printHref = `/api/admin/orders/invoices?ids=${idsQuery}`;
      window.open(printHref, "_blank", "noopener,noreferrer");

      setSelected(new Set());
      router.refresh();
    });
  };

  if (orders.length === 0) return null;

  return (
    <div className="mb-12">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-husk">Today's Orders</h2>
          <p className="mt-1 text-xs text-husk-soft">{orders.length} orders arrived today.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-husk/10 bg-rice-50 p-1">
            <button
              onClick={() => setPaymentFilter("ALL")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                paymentFilter === "ALL" ? "bg-husk text-rice-50" : "text-husk-soft hover:text-husk"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPaymentFilter("COD")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                paymentFilter === "COD" ? "bg-husk text-rice-50" : "text-husk-soft hover:text-husk"
              }`}
            >
              COD
            </button>
            <button
              onClick={() => setPaymentFilter("PAYHERE")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                paymentFilter === "PAYHERE" ? "bg-husk text-rice-50" : "text-husk-soft hover:text-husk"
              }`}
            >
              PayHere
            </button>
          </div>

          <button
            onClick={handleConfirmAll}
            disabled={selected.size === 0 || pending}
            className={`rounded-full border border-husk/15 bg-rice-50 px-4 py-2 text-sm font-medium text-husk transition-colors hover:border-paddy-600 ${
              (selected.size === 0 || pending) && "pointer-events-none opacity-50"
            }`}
          >
            {pending ? "Processing..." : `Confirm Selected (${selected.size})`}
          </button>
          
          <button
            onClick={handleConfirmAndPrintAll}
            disabled={selected.size === 0 || pending}
            className={`inline-flex items-center gap-2 rounded-full bg-paddy-800 px-4 py-2 text-sm font-medium text-rice-50 transition-colors hover:bg-paddy-900 ${
              (selected.size === 0 || pending) && "pointer-events-none opacity-50"
            }`}
          >
            <PdfIcon /> Confirm & Print All
          </button>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-husk/10 bg-rice-50">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-husk/10 text-xs uppercase tracking-wider text-husk-soft">
            <tr>
              <th className="px-5 py-3 font-medium">
                <input
                  type="checkbox"
                  className="rounded border-husk/20 text-paddy-800 focus:ring-paddy-800"
                  checked={filteredOrders.length > 0 && selected.size === filteredOrders.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Time</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Pay</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-husk/10">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-husk-soft">
                  No orders match this payment filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id} className="align-top hover:bg-husk/[0.02]">
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-husk/20 text-paddy-800 focus:ring-paddy-800"
                      checked={selected.has(o.id)}
                      onChange={() => toggleOne(o.id)}
                    />
                  </td>
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
                    {new Date(o.createdAt).toLocaleTimeString("en-LK", { hour: "numeric", minute: "2-digit" })}
                  </td>
                  <td className="px-5 py-4 font-semibold text-husk">{formatLKR(o.total)}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-husk/5 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-husk-soft">
                      {o.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${
                      o.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                      o.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
                      "bg-husk/10 text-husk-soft"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
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
