"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { ProductFormState } from "@/app/admin/actions";
import ImageUploader from "@/components/admin/ImageUploader";
import { cn } from "@/lib/utils";

type Initial = {
  name?: string;
  slug?: string;
  categoryId?: string | null;
  variety?: string | null;
  sinhala?: string | null;
  note?: string | null;
  description?: string | null;
  cookingTips?: string | null;
  origin?: string | null;
  pricePerKg?: number;
  stockKg?: number;
  badge?: string | null;
  featured?: boolean;
  grainLight?: string | null;
  grainMid?: string | null;
  grainDark?: string | null;
  images?: string[];
  hotDeal?: boolean;
  discountPercent?: number;
};

const BADGES = ["", "Best Seller", "New Harvest", "Heirloom", "Premium", "Family Favourite"];

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductForm({
  action,
  categories,
  initial,
  submitLabel,
}: {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: { id: string; name: string }[];
  initial?: Initial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.slug));

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      {state?.error && (
        <p className="rounded-xl bg-clay-500/10 px-4 py-3 text-sm text-clay-700">
          {state.error}
        </p>
      )}

      {/* basics */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" className="sm:col-span-2">
          <input
            name="name"
            required
            className="ctrl"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugEdited) setSlug(slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="Slug" hint="URL: /shop/your-slug">
          <input
            name="slug"
            required
            className="ctrl"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEdited(true);
            }}
          />
        </Field>
        <Field label="Category">
          <select name="categoryId" defaultValue={initial?.categoryId ?? ""} className="ctrl">
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Variety" hint="e.g. Aromatic heirloom · white">
          <input name="variety" className="ctrl" defaultValue={initial?.variety ?? ""} />
        </Field>
        <Field label="Sinhala name">
          <input name="sinhala" className="ctrl" defaultValue={initial?.sinhala ?? ""} />
        </Field>
        <Field label="Short note" hint="One line shown on cards" className="sm:col-span-2">
          <input name="note" className="ctrl" defaultValue={initial?.note ?? ""} />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <textarea name="description" className="ctrl min-h-28 resize-y" defaultValue={initial?.description ?? ""} />
        </Field>
        <Field label="Cooking tips" className="sm:col-span-2">
          <textarea name="cookingTips" className="ctrl min-h-20 resize-y" defaultValue={initial?.cookingTips ?? ""} />
        </Field>
        <Field label="Origin">
          <input name="origin" className="ctrl" defaultValue={initial?.origin ?? ""} />
        </Field>
        <Field label="Badge">
          <select name="badge" defaultValue={initial?.badge ?? ""} className="ctrl">
            {BADGES.map((b) => (
              <option key={b} value={b}>{b || "— None —"}</option>
            ))}
          </select>
        </Field>
      </section>

      {/* pricing + stock */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Field label="Price per kg (LKR)">
          <input name="pricePerKg" type="number" min={0} required className="ctrl" defaultValue={initial?.pricePerKg ?? 0} />
        </Field>
        <Field label="Stock (kg)">
          <input name="stockKg" type="number" min={0} required className="ctrl" defaultValue={initial?.stockKg ?? 0} />
        </Field>
        <Field label="Discount %" hint="0–90, applied across all weights">
          <input
            name="discountPercent"
            type="number"
            min={0}
            max={90}
            className="ctrl"
            defaultValue={initial?.discountPercent ?? 0}
          />
        </Field>
      </section>

      {/* appearance */}
      <section>
        <p className="mb-3 text-sm font-medium text-husk">Pack grain colours</p>
        <div className="flex flex-wrap gap-5">
          {([
            ["grainLight", "Light", initial?.grainLight ?? "#f3ead4"],
            ["grainMid", "Mid", initial?.grainMid ?? "#e3d2a6"],
            ["grainDark", "Dark", initial?.grainDark ?? "#c7ad70"],
          ] as const).map(([n, label, val]) => (
            <label key={n} className="flex items-center gap-2 text-sm text-husk-soft">
              <input type="color" name={n} defaultValue={val} className="h-9 w-12 cursor-pointer rounded border border-husk/15 bg-transparent" />
              {label}
            </label>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2.5 text-sm text-husk">
            <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} className="h-4 w-4 accent-paddy-800" />
            Feature on homepage (Hot products)
          </label>
          <label className="flex items-center gap-2.5 text-sm text-husk">
            <input type="checkbox" name="hotDeal" defaultChecked={initial?.hotDeal ?? false} className="h-4 w-4 accent-paddy-800" />
            Show in Hot Deals carousel
          </label>
        </div>
      </section>

      {/* photos */}
      <section>
        <p className="mb-3 text-sm font-medium text-husk">Product photos</p>
        <ImageUploader name="images" initial={initial?.images} />
      </section>

      <div className="flex items-center gap-3 border-t border-husk/10 pt-6">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "rounded-full px-7 py-3 font-medium text-rice-50 transition-colors",
            pending ? "bg-paddy-600" : "bg-paddy-800 hover:bg-paddy-900",
          )}
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/admin/products" className="text-sm font-medium text-husk-soft hover:text-husk">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-husk">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-husk-soft">{hint}</span>}
    </label>
  );
}
