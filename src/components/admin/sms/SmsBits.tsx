"use client";

import { smsStats } from "@/lib/sms";
import { cn } from "@/lib/utils";

/** Pill switch — same feel as the homepage section toggles. */
export function PillSwitch({
  on,
  onToggle,
  pending,
  label,
  size = "md",
}: {
  on: boolean;
  onToggle: () => void;
  pending?: boolean;
  label: string;
  size?: "md" | "lg";
}) {
  const lg = size === "lg";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      disabled={pending}
      className={cn(
        "relative flex shrink-0 cursor-pointer items-center rounded-full px-[3px] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harvest-400 focus-visible:ring-offset-2",
        lg ? "h-8 w-[3.75rem]" : "h-7 w-[3.25rem]",
        on ? (lg ? "bg-harvest-500" : "bg-paddy-800") : lg ? "bg-rice-50/20" : "bg-husk/20",
        pending && "cursor-wait opacity-60",
      )}
    >
      <span
        className={cn(
          "rounded-full bg-white shadow-md transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          lg ? "h-[26px] w-[26px]" : "h-[22px] w-[22px]",
          on ? (lg ? "translate-x-[1.75rem]" : "translate-x-[1.5rem]") : "translate-x-0",
        )}
      />
    </button>
  );
}

/** Characters / segments / encoding for a rendered message. */
export function SmsMeter({ text, className }: { text: string; className?: string }) {
  const s = smsStats(text);
  const pricey = s.segments > 1;
  return (
    <div className={cn("space-y-1 text-xs", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-husk-soft">
        <span className="tabular-nums">
          <b className={cn("font-semibold", pricey ? "text-harvest-700" : "text-husk")}>{s.length}</b>
          {" / "}
          {s.segments === 1 ? (s.encoding === "GSM-7" ? 160 : 70) : s.length + s.remaining}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-semibold",
            pricey ? "bg-harvest-200 text-harvest-700" : "bg-paddy-800/10 text-paddy-700",
          )}
        >
          {s.segments} SMS{s.segments > 1 ? " credits" : " credit"}
        </span>
        <span className={cn(s.encoding === "Unicode" && "text-harvest-700")}>{s.encoding}</span>
      </div>
      {s.encoding === "Unicode" && (
        <p className="text-harvest-700">
          {/[඀-෿஀-௿]/.test(text)
            ? "Sinhala/Tamil text uses Unicode — 70 characters per SMS."
            : <>Unicode because of {s.offenders.map((c) => `“${c}”`).join(" ")} — swap for plain characters to fit 160 per SMS.</>}
        </p>
      )}
    </div>
  );
}

/** A small handset showing the message the customer will receive. */
export function SmsPhonePreview({
  sender,
  text,
  className,
}: {
  sender: string;
  text: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[15.5rem] rounded-[2.1rem] bg-husk p-[7px] shadow-[0_24px_48px_-24px_rgba(34,31,23,.55)]",
        className,
      )}
      aria-label="Message preview"
    >
      <div className="relative overflow-hidden rounded-[1.7rem] bg-rice-50">
        {/* status bar + dynamic island */}
        <div className="flex items-center justify-between px-5 pt-2.5 text-[0.6rem] font-semibold text-husk">
          <span>9:41</span>
          <span className="h-[1.1rem] w-16 rounded-full bg-husk" aria-hidden />
          <span className="tracking-tight">▮▮▮</span>
        </div>
        {/* thread header */}
        <div className="mt-2 flex flex-col items-center border-b border-husk/8 pb-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-paddy-800 font-display text-sm text-harvest-300">
            {sender.slice(0, 1).toUpperCase() || "S"}
          </span>
          <span className="mt-1 text-[0.7rem] font-semibold text-husk">{sender || "Sender"}</span>
        </div>
        {/* message */}
        <div className="min-h-[11rem] px-3 pb-5 pt-3">
          <p className="mb-2 text-center text-[0.58rem] uppercase tracking-widest text-husk-soft/70">Text message · now</p>
          {text ? (
            <p className="w-fit max-w-[92%] whitespace-pre-wrap break-words rounded-[1.1rem] rounded-bl-md bg-rice-200 px-3 py-2 text-[0.74rem] leading-snug text-husk">
              {text}
            </p>
          ) : (
            <p className="pt-8 text-center text-xs text-husk-soft/60">Nothing to send</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatusChip({ status }: { status: string }) {
  const tone =
    status === "SENT"
      ? "bg-paddy-800/10 text-paddy-700"
      : status === "FAILED"
        ? "bg-clay-500/12 text-clay-600"
        : "bg-harvest-200/70 text-harvest-700";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider", tone)}>
      {status === "SENT" ? "Sent" : status === "FAILED" ? "Failed" : "Skipped"}
    </span>
  );
}
