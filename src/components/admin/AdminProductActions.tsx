"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/admin/actions";

export default function AdminProductActions({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const onDelete = () => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    start(async () => {
      await deleteProduct(id);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/products/${id}/edit`}
        className="rounded-lg border border-husk/15 px-3 py-1.5 text-xs font-medium text-husk transition-colors hover:border-paddy-600"
      >
        Edit
      </Link>
      <button
        onClick={onDelete}
        disabled={pending}
        className="rounded-lg border border-husk/15 px-3 py-1.5 text-xs font-medium text-clay-600 transition-colors hover:border-clay-500 hover:bg-clay-500 hover:text-rice-50 disabled:opacity-50"
      >
        {pending ? "…" : "Delete"}
      </button>
    </div>
  );
}
