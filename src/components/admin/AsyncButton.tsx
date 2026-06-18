"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

/** Runs a bound server action with a pending state + optional confirm. */
export default function AsyncButton({
  action,
  children,
  confirm,
  className,
}: {
  action: () => Promise<void>;
  children: React.ReactNode;
  confirm?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          await action();
          router.refresh();
        });
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}
