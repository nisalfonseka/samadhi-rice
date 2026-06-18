"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/providers/CartProvider";
import { formatLKR } from "@/lib/pricing";
import { deliveryFeeFor } from "@/lib/delivery";
import { cn } from "@/lib/utils";

const DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
];

type Form = {
  customerName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  notes: string;
};

const EMPTY: Form = {
  customerName: "",
  email: "",
  phone: "",
  addressLine: "",
  city: "",
  district: "",
  notes: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, setQty, remove, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => setMounted(true), []);

  const fee = deliveryFeeFor(subtotal);
  const total = subtotal + fee;

  const set = (key: keyof Form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (form.customerName.trim().length < 2) e.customerName = "Please enter your name";
    if (form.phone.trim().length < 7) e.phone = "Enter a valid phone number";
    if (form.addressLine.trim().length < 6) e.addressLine = "Enter your full address";
    if (form.city.trim().length < 2) e.city = "Enter your city / town";
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod: "COD",
          items: lines.map((l) => ({ slug: l.slug, weight: l.weight, qty: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setDone(true);
      clear();
      router.push(`/order/${data.orderNo}`);
    } catch {
      setServerError("Network error. Please check your connection and retry.");
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-paper grid min-h-screen place-items-center px-6 text-center">
        <p className="font-display text-2xl text-husk">Placing your order…</p>
      </div>
    );
  }

  if (mounted && lines.length === 0) {
    return (
      <div className="bg-paper grid min-h-screen place-items-center px-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="font-display text-3xl text-husk">Your basket is empty</h1>
          <p className="mt-3 text-husk-soft">Add some rice before checking out.</p>
          <Link
            href="/shop"
            className="mt-6 rounded-full bg-paddy-800 px-7 py-3.5 font-medium text-rice-50 transition-colors hover:bg-paddy-900"
          >
            Browse the harvest
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-screen">
      <form
        onSubmit={submit}
        className="mx-auto grid max-w-7xl gap-10 px-5 pb-24 pt-32 sm:px-8 sm:pt-36 lg:grid-cols-[1.5fr_1fr] lg:gap-14"
      >
        {/* left — details */}
        <div>
          <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-husk-soft">
            <Link href="/shop" className="hover:text-paddy-700">Shop</Link>
            <span aria-hidden>/</span>
            <span className="text-husk">Checkout</span>
          </nav>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-medium text-husk">
            Checkout
          </h1>
          <p className="mt-2 text-husk-soft">
            No account needed — just tell us where to deliver.
          </p>

          {/* delivery details */}
          <section className="mt-10">
            <h2 className="font-display text-xl text-husk">Delivery details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.customerName} className="sm:col-span-2">
                <input className="ctrl" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="Nimal Perera" />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <input className="ctrl" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="07X XXX XXXX" inputMode="tel" />
              </Field>
              <Field label="Email (optional)" error={errors.email}>
                <input className="ctrl" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.lk" inputMode="email" />
              </Field>
              <Field label="Address" error={errors.addressLine} className="sm:col-span-2">
                <input className="ctrl" value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)} placeholder="No. 12, Temple Road, Kotte" />
              </Field>
              <Field label="City / Town" error={errors.city}>
                <input className="ctrl" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Nugegoda" />
              </Field>
              <Field label="District">
                <select className="ctrl" value={form.district} onChange={(e) => set("district", e.target.value)}>
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Delivery notes (optional)" className="sm:col-span-2">
                <textarea className="ctrl min-h-20 resize-y" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Landmark, preferred time, gate code…" />
              </Field>
            </div>
          </section>

          {/* payment */}
          <section className="mt-10">
            <h2 className="font-display text-xl text-husk">Payment</h2>
            <div className="mt-5 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-paddy-800 bg-rice-50 p-4">
                <input type="radio" name="pay" defaultChecked className="mt-1 accent-paddy-800" />
                <span>
                  <span className="block font-medium text-husk">Cash on Delivery</span>
                  <span className="block text-sm text-husk-soft">Pay in cash when your rice arrives. No card needed.</span>
                </span>
              </label>
              <label className="flex cursor-not-allowed items-start gap-3 rounded-2xl border border-husk/15 bg-rice-100/40 p-4 opacity-60">
                <input type="radio" name="pay" disabled className="mt-1" />
                <span>
                  <span className="block font-medium text-husk">Card / Online (PayHere)</span>
                  <span className="block text-sm text-husk-soft">Coming soon — secure card payments.</span>
                </span>
              </label>
            </div>
          </section>
        </div>

        {/* right — summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-husk/10 bg-rice-50 p-6 shadow-[0_18px_44px_-32px_rgba(34,31,23,0.5)]">
            <h2 className="font-display text-xl text-husk">Order summary</h2>

            <ul className="mt-5 divide-y divide-husk/10">
              {lines.map((l) => (
                <li key={`${l.slug}-${l.weight}`} className="flex items-center gap-3 py-3">
                  <div className="flex-1">
                    <p className="font-medium text-husk">{l.name}</p>
                    <p className="text-xs text-husk-soft">{l.weight}kg pack</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-husk/15">
                        <button type="button" onClick={() => setQty(l.slug, l.weight, l.qty - 1)} aria-label="Decrease" className="grid h-7 w-7 place-items-center text-husk">−</button>
                        <span className="w-6 text-center text-sm">{l.qty}</span>
                        <button type="button" onClick={() => setQty(l.slug, l.weight, l.qty + 1)} aria-label="Increase" className="grid h-7 w-7 place-items-center text-husk">+</button>
                      </div>
                      <button type="button" onClick={() => remove(l.slug, l.weight)} className="text-xs text-husk-soft underline-offset-2 hover:underline">remove</button>
                    </div>
                  </div>
                  <span className="font-semibold text-husk">{formatLKR(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-1.5 border-t border-husk/10 pt-4 text-sm">
              <div className="flex justify-between text-husk-soft"><dt>Subtotal</dt><dd>{formatLKR(subtotal)}</dd></div>
              <div className="flex justify-between text-husk-soft"><dt>Delivery</dt><dd>{fee === 0 ? "Free" : formatLKR(fee)}</dd></div>
              <div className="flex justify-between pt-2 font-display text-xl text-husk"><dt>Total</dt><dd>{formatLKR(total)}</dd></div>
            </dl>

            {serverError && (
              <p className="mt-4 rounded-xl bg-clay-500/10 px-4 py-3 text-sm text-clay-700">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={submitting || lines.length === 0}
              className={cn(
                "mt-5 flex w-full items-center justify-center gap-2 rounded-full py-4 font-medium text-rice-50 transition-all duration-300",
                submitting ? "bg-paddy-600" : "bg-paddy-800 hover:bg-paddy-900 hover:-translate-y-0.5",
              )}
            >
              {submitting ? "Placing order…" : `Place order · ${formatLKR(total)}`}
            </button>
            <p className="mt-3 text-center text-xs text-husk-soft">
              You&apos;ll pay {formatLKR(total)} in cash on delivery.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-husk">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-clay-600">{error}</span>}
    </label>
  );
}
