"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateStock } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export default function StockEdit({ id, value }: { id: string; value: number }) {
  const [v, setV] = useState(value);
  const [pending, start] = useTransition();
  const router = useRouter();

  const save = () => {
    if (v === value || Number.isNaN(v)) return;
    start(async () => {
      await updateStock(id, v);
      router.refresh();
    });
  };

  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="number"
        min={0}
        value={Number.isNaN(v) ? "" : v}
        onChange={(e) => setV(Number(e.target.value))}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className={cn(
          "w-16 rounded-lg border border-husk/15 bg-rice-50 px-2 py-1 text-sm text-husk outline-none focus:border-paddy-600",
          pending && "opacity-50",
          v <= 0 && "text-clay-600",
        )}
      />
      <span className="text-xs text-husk-soft">kg</span>
    </span>
  );
}
