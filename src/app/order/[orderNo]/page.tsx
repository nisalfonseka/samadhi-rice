import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrderByNo } from "@/lib/services/order.service";
import { formatLKR } from "@/lib/pricing";
import { WHATSAPP_NUMBER } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

const STEPS = [
  { title: "Order received", body: "We've got your order and the mill has been notified." },
  { title: "Milled & packed", body: "Your rice is milled fresh and sealed the same day." },
  { title: "Out for delivery", body: "We'll call before we arrive at your door." },
  { title: "Pay on delivery", body: "Hand over the cash to our delivery partner. Done!" },
];

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = await params;
  const order = await getOrderByNo(orderNo).catch(() => null);
  if (!order) notFound();

  return (
    <div className="bg-paper min-h-screen">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8 sm:pt-36">
        {/* success header */}
        <div className="flex flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-paddy-700 text-rice-50">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
              <path d="m5 12.5 4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="kicker mt-6 text-clay-500">Thank you</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] font-medium text-husk">
            Your order is placed
          </h1>
          <p className="mt-3 text-husk-soft">
            Order <span className="font-semibold text-husk">{order.orderNo}</span> ·
            we&apos;ll be in touch on {order.phone} shortly.
          </p>
        </div>

        {/* order card */}
        <div className="mt-10 rounded-3xl border border-husk/10 bg-rice-50 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-husk/10 pb-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-husk-soft">Order</p>
              <p className="font-display text-lg text-husk">{order.orderNo}</p>
            </div>
            <span className="rounded-full bg-harvest-500/15 px-3 py-1 text-sm font-medium text-harvest-700">
              Cash on Delivery · {order.status.toLowerCase()}
            </span>
          </div>

          <ul className="divide-y divide-husk/10">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium text-husk">{it.name}</p>
                  <p className="text-sm text-husk-soft">
                    {it.weightKg}kg × {it.quantity}
                  </p>
                </div>
                <span className="font-semibold text-husk">
                  {formatLKR(it.unitPrice * it.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-1.5 border-t border-husk/10 pt-4 text-sm">
            <div className="flex justify-between text-husk-soft"><dt>Subtotal</dt><dd>{formatLKR(order.subtotal)}</dd></div>
            <div className="flex justify-between text-husk-soft"><dt>Delivery</dt><dd>{order.deliveryFee === 0 ? "Free" : formatLKR(order.deliveryFee)}</dd></div>
            <div className="flex justify-between pt-2 font-display text-xl text-husk"><dt>Total to pay</dt><dd>{formatLKR(order.total)}</dd></div>
          </dl>
        </div>

        {/* delivery + next steps */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-husk/10 bg-rice-50 p-6">
            <h2 className="font-display text-lg text-husk">Delivering to</h2>
            <address className="mt-3 text-sm not-italic leading-relaxed text-husk-soft">
              <span className="block font-medium text-husk">{order.customerName}</span>
              {order.addressLine}
              <br />
              {order.city}
              {order.district ? `, ${order.district}` : ""}
              <br />
              {order.phone}
              {order.notes ? <><br /><span className="text-husk-soft">“{order.notes}”</span></> : null}
            </address>
          </div>
          <div className="rounded-3xl border border-husk/10 bg-rice-50 p-6">
            <h2 className="font-display text-lg text-husk">What happens next</h2>
            <ol className="mt-3 space-y-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-paddy-800 text-xs font-bold text-rice-50">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-husk">{s.title}</span>
                    <span className="block text-xs text-husk-soft">{s.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-paddy-800 px-7 py-3.5 font-medium text-rice-50 transition-colors hover:bg-paddy-900"
          >
            Continue shopping
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I just placed order ${order.orderNo}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-husk/20 px-7 py-3.5 font-medium text-husk transition-colors hover:border-paddy-700"
          >
            Question? Message us
          </a>
        </div>
      </div>
    </div>
  );
}
