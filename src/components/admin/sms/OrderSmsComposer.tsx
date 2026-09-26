"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendOrderSms } from "@/app/admin/actions";
import { renderSmsTemplate, type SmsVars } from "@/lib/sms";
import { cn } from "@/lib/utils";
import { SmsMeter } from "./SmsBits";

const QUICK = [
  {
    label: "Rider on the way",
    text: "Hi {firstName}, our rider is on the way with your SamadhiRice order {orderNo}. Please keep your phone nearby.",
  },
  {
    label: "Running late",
    text: "Sorry {firstName}, order {orderNo} is running a little late today. We will deliver it by tomorrow. - SamadhiRice",
  },
  {
    label: "Couldn't reach you",
    text: "Hi {firstName}, we tried to call you about order {orderNo}. Please call us on {shopPhone}. - SamadhiRice",
  },
];

export default function OrderSmsComposer({
  orderId,
  vars,
  canSend,
}: {
  orderId: string;
  vars: SmsVars;
  /** false when the order phone isn't a mobile number */
  canSend: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  if (!canSend) {
    return (
      <p className="rounded-xl bg-harvest-200/40 px-3 py-2.5 text-xs text-husk">
        This order’s phone isn’t a Sri Lankan mobile number, so it can’t receive SMS.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await sendOrderSms(orderId, text);
          setNote({ ok: r.ok, text: r.message });
          if (r.ok) setText("");
          router.refresh();
        });
      }}
    >
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {QUICK.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => { setText(renderSmsTemplate(q.text, vars)); setNote(null); }}
            className="rounded-full border border-husk/12 bg-rice-100 px-2.5 py-1 text-[0.7rem] font-medium text-husk transition-colors hover:border-paddy-600 hover:bg-paddy-50"
          >
            {q.label}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setNote(null); }}
        rows={3}
        maxLength={480}
        placeholder={`Write to ${vars.firstName}…`}
        className="ctrl resize-none text-sm"
        aria-label="SMS message"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        {text ? <SmsMeter text={text} /> : <span />}
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="rounded-full bg-paddy-800 px-4 py-1.5 text-xs font-semibold text-rice-50 transition-colors hover:bg-paddy-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Sending…" : "Send SMS"}
        </button>
      </div>
      {note && (
        <p role="status" className={cn("mt-2 text-xs font-medium", note.ok ? "text-paddy-700" : "text-clay-600")}>
          {note.text}
        </p>
      )}
    </form>
  );
}
