"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFeatured, toggleHotDeal } from "@/app/admin/actions";
import { formatLKR } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  slug: string;
  name: string;
  pricePerKg: number;
  featured: boolean;
  hotDeal: boolean;
  grainMid: string | null;
  stockKg: number;
};

export default function ProductHomepageRow({ product }: { product: Product }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const runRefresh = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-2xl border border-husk/10 bg-rice-50 p-4">
      <span
        className="h-10 w-10 shrink-0 rounded-lg"
        style={{ background: product.grainMid ?? "#e3d2a6" }}
      />
      <div className="min-w-0 flex-1">
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="font-medium text-husk hover:text-paddy-800"
        >
          {product.name}
        </Link>
        <p className="text-xs text-husk-soft">
          {formatLKR(product.pricePerKg)}/kg · {product.stockKg}kg in stock
        </p>
      </div>

      <Toggle
        active={product.featured}
        label="Featured"
        onClick={() => runRefresh(() => toggleFeatured(product.id))}
        disabled={pending}
      />
      <Toggle
        active={product.hotDeal}
        label="Hot Deal"
        onClick={() => runRefresh(() => toggleHotDeal(product.id))}
        disabled={pending}
      />
    </li>
  );
}

function Toggle({
  active,
  label,
  onClick,
  disabled,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-paddy-800 bg-paddy-800 text-rice-50"
          : "border-husk/15 text-husk-soft hover:border-paddy-600 hover:text-husk",
        disabled && "opacity-50",
      )}
    >
      {label}
    </button>
  );
}
