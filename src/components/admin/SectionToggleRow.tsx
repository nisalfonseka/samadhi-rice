"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSection } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export default function SectionToggleRow({
  settingKey,
  label,
  description,
  enabled,
}: {
  settingKey: string;
  label: string;
  description: string;
  enabled: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const toggle = () =>
    start(async () => {
      await toggleSection(settingKey, !enabled);
      router.refresh();
    });

  return (
    <li className="flex items-center gap-4 rounded-xl border border-husk/10 bg-rice-50 px-5 py-4">
      {/* colour bar */}
      <span
        className={cn(
          "hidden h-8 w-1 shrink-0 rounded-full transition-colors duration-300 sm:block",
          enabled ? "bg-paddy-700" : "bg-husk/15",
        )}
      />

      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium transition-colors", enabled ? "text-husk" : "text-husk/45")}>
          {label}
        </p>
        <p className="text-xs text-husk-soft">{description}</p>
      </div>

      {/* status chip */}
      <span
        className={cn(
          "hidden shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide transition-all duration-300 sm:inline-block",
          enabled
            ? "bg-paddy-800/10 text-paddy-700"
            : "bg-husk/8 text-husk/40",
        )}
      >
        {enabled ? "Visible" : "Hidden"}
      </span>

      {/* pill toggle */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${enabled ? "Hide" : "Show"} ${label}`}
        onClick={toggle}
        disabled={pending}
        className={cn(
          "relative flex h-7 w-[3.25rem] shrink-0 cursor-pointer items-center rounded-full px-[3px] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paddy-600 focus-visible:ring-offset-2",
          enabled ? "bg-paddy-800" : "bg-husk/20",
          pending && "cursor-not-allowed opacity-50",
        )}
      >
        <span
          className={cn(
            "h-[22px] w-[22px] rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            enabled ? "translate-x-[1.5rem]" : "translate-x-0",
          )}
        />
      </button>
    </li>
  );
}
