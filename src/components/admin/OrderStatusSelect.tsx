"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setOrderStatus } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value;
        start(async () => {
          await setOrderStatus(orderId, value);
          router.refresh();
        });
      }}
      className={cn(
        "rounded-full border border-husk/15 bg-rice-50 px-3 py-1.5 text-xs font-semibold text-husk outline-none transition-colors focus:border-paddy-600",
        pending && "opacity-50",
      )}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0) + s.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
}
