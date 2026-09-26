"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { retrySms, saveSmsGateway, sendTestSms, setSmsSwitch } from "@/app/admin/actions";
import { normalizeLkMobile } from "@/lib/sms";
import { cn } from "@/lib/utils";
import { PillSwitch, SmsMeter } from "./SmsBits";

type Note = { ok: boolean; text: string } | null;

function NoteLine({ note }: { note: Note }) {
  if (!note) return null;
  return (
    <p role="status" className={cn("text-xs font-medium", note.ok ? "text-paddy-700" : "text-clay-600")}>
      {note.text}
    </p>
  );
}

/* ---- master switch (sits on the dark gateway card) ---------------------- */

export function SmsMasterSwitch({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(enabled);
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-semibold text-rice-50">{on ? "Notifications live" : "All SMS paused"}</p>
        <p className="text-xs text-rice-50/55">{on ? "Customers are being texted" : "Nothing will be sent"}</p>
      </div>
      <PillSwitch
        size="lg"
        on={on}
        pending={pending}
        label={on ? "Pause all SMS" : "Resume SMS"}
        onToggle={() => {
          const next = !on;
          if (!next && !window.confirm("Pause every SMS notification? Customers won't be texted until you turn this back on.")) return;
          setOn(next);
          start(async () => {
            try {
              await setSmsSwitch("enabled", next);
              router.refresh();
            } catch {
              setOn(!next);
            }
          });
        }}
      />
    </div>
  );
}

/* ---- sender ID + shop alert phone -------------------------------------- */

export function SmsGatewayForm({ senderId, adminPhone }: { senderId: string; adminPhone: string }) {
  const router = useRouter();
  const [sender, setSender] = useState(senderId);
  const [phone, setPhone] = useState(adminPhone);
  const [note, setNote] = useState<Note>(null);
  const [pending, start] = useTransition();
  const dirty = sender !== senderId || phone !== adminPhone;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveSmsGateway(sender, phone);
          setNote({ ok: r.ok, text: r.message });
          if (r.ok) router.refresh();
        });
      }}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-husk">Sender ID</span>
        <span className="mb-1.5 block text-xs text-husk-soft">
          The name customers see. Must be approved on your text.lk account — max 11 characters.
        </span>
        <input
          value={sender}
          onChange={(e) => { setSender(e.target.value); setNote(null); }}
          maxLength={15}
          className="ctrl font-medium"
          placeholder="SamadhiRice"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-husk">Shop mobile for new-order alerts</span>
        <span className="mb-1.5 block text-xs text-husk-soft">
          Used by the “New-order alert to shop” message. Leave blank to never alert.
        </span>
        <input
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setNote(null); }}
          type="tel"
          inputMode="tel"
          className="ctrl"
          placeholder="077 123 4567"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || !dirty}
          className="rounded-full bg-paddy-800 px-5 py-2 text-sm font-medium text-rice-50 transition-colors hover:bg-paddy-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <NoteLine note={note} />
      </div>
    </form>
  );
}

/* ---- send a test ------------------------------------------------------- */

export function SmsTestForm({ defaultPhone }: { defaultPhone: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState(defaultPhone);
  const [text, setText] = useState("Ayubowan! This is a test message from SamadhiRice.lk - your SMS notifications are working.");
  const [note, setNote] = useState<Note>(null);
  const [pending, start] = useTransition();
  const valid = Boolean(normalizeLkMobile(phone));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await sendTestSms(phone, text);
          setNote({ ok: r.ok, text: r.message });
          router.refresh();
        });
      }}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-husk">Mobile number</span>
        <input
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setNote(null); }}
          type="tel"
          inputMode="tel"
          className="ctrl"
          placeholder="077 123 4567"
        />
        {phone && !valid && (
          <span className="mt-1 block text-xs text-harvest-700">Enter a Sri Lankan mobile, e.g. 077 123 4567</span>
        )}
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-husk">Message</span>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setNote(null); }}
          rows={3}
          maxLength={480}
          className="ctrl resize-none"
        />
      </label>
      <SmsMeter text={text} />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || !valid || !text.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-harvest-500 px-5 py-2 text-sm font-medium text-paddy-950 transition-colors hover:bg-harvest-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
          </svg>
          {pending ? "Sending…" : "Send test"}
        </button>
        <span className="text-xs text-husk-soft">Uses 1 credit per segment.</span>
      </div>
      <NoteLine note={note} />
    </form>
  );
}

/* ---- retry a failed/skipped entry -------------------------------------- */

export function SmsRetryButton({ logId }: { logId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await retrySms(logId);
            setErr(r.ok ? null : r.message);
            router.refresh();
          })
        }
        className="rounded-full border border-husk/15 px-3 py-1 text-xs font-semibold text-husk transition-colors hover:border-paddy-600 hover:text-paddy-800 disabled:opacity-50"
      >
        {pending ? "Retrying…" : "Retry"}
      </button>
      {err && <span className="text-[0.7rem] text-clay-600">{err}</span>}
    </span>
  );
}
