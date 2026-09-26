"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSmsTemplate, setSmsSwitch } from "@/app/admin/actions";
import {
  SMS_EVENT_META,
  SMS_PLACEHOLDERS,
  SMS_SAMPLE_VARS,
  renderSmsTemplate,
  smsStats,
  type SmsEvent,
} from "@/lib/sms";
import { cn } from "@/lib/utils";
import { PillSwitch, SmsMeter, SmsPhonePreview } from "./SmsBits";

export default function SmsEventCard({
  event,
  step,
  enabled,
  template,
  isDefault,
  senderId,
  masterOn,
  last,
  disabledReason,
}: {
  event: SmsEvent;
  step: number | null;
  enabled: boolean;
  template: string;
  isDefault: boolean;
  senderId: string;
  masterOn: boolean;
  last?: boolean;
  /** shown instead of the template summary when the event can't fire */
  disabledReason?: string;
}) {
  const meta = SMS_EVENT_META[event];
  const router = useRouter();
  const [on, setOn] = useState(enabled);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(template);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [toggling, startToggle] = useTransition();
  const [saving, startSave] = useTransition();
  const area = useRef<HTMLTextAreaElement>(null);

  const rendered = renderSmsTemplate(open ? draft : template, SMS_SAMPLE_VARS);
  const segments = smsStats(renderSmsTemplate(template, SMS_SAMPLE_VARS)).segments;
  const dirty = draft.trim() !== template.trim();
  const live = masterOn && on;

  const toggle = () => {
    const next = !on;
    setOn(next); // optimistic
    startToggle(async () => {
      try {
        await setSmsSwitch(event, next);
        router.refresh();
      } catch {
        setOn(!next);
      }
    });
  };

  const insert = (key: string) => {
    const el = area.current;
    const token = `{${key}}`;
    if (!el) return setDraft((d) => d + token);
    const { selectionStart: a, selectionEnd: b } = el;
    const next = draft.slice(0, a) + token + draft.slice(b);
    setDraft(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + token.length, a + token.length);
    });
  };

  const save = (value: string) =>
    startSave(async () => {
      const r = await saveSmsTemplate(event, value);
      setNote({ ok: r.ok, text: r.message });
      if (r.ok) {
        if (!value.trim()) setDraft(meta.template);
        router.refresh();
      }
    });

  return (
    <li className="relative flex gap-4 sm:gap-5">
      {/* journey rail */}
      <div className="relative flex w-9 shrink-0 flex-col items-center">
        <span
          className={cn(
            "z-10 grid h-9 w-9 place-items-center rounded-full border text-xs font-bold tabular-nums transition-colors duration-300",
            live
              ? "border-paddy-800 bg-paddy-800 text-harvest-300"
              : "border-husk/15 bg-rice-50 text-husk/35",
          )}
        >
          {step ?? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          )}
        </span>
        {!last && (
          <span
            aria-hidden
            className={cn(
              "absolute top-9 bottom-[-1.25rem] w-px transition-colors",
              live ? "bg-paddy-700/40" : "bg-husk/12",
            )}
          />
        )}
      </div>

      <div
        className={cn(
          "min-w-0 flex-1 rounded-2xl border bg-rice-50 transition-[border-color,box-shadow] duration-300",
          open ? "border-paddy-600/40 shadow-[0_18px_40px_-28px_rgba(40,54,31,.6)]" : "border-husk/10",
        )}
      >
        <div className="flex items-start gap-4 p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <h3 className={cn("font-display text-lg leading-tight transition-colors", on ? "text-husk" : "text-husk/45")}>
                {meta.label}
              </h3>
              <span className="font-sinhala text-xs text-husk-soft/70" lang="si">{meta.sinhala}</span>
            </div>
            <p className="mt-0.5 text-xs text-husk-soft">{meta.when}</p>

            {!open && (
              <p className={cn("mt-3 line-clamp-2 text-sm leading-relaxed", on ? "text-husk-soft" : "text-husk/35")}>
                {disabledReason ? <span className="text-harvest-700">{disabledReason}</span> : rendered}
              </p>
            )}

            {!open && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setOpen(true); setNote(null); }}
                  className="text-xs font-semibold text-paddy-700 transition-colors hover:text-paddy-900"
                >
                  Edit message →
                </button>
                {!isDefault && (
                  <span className="rounded-full bg-harvest-200/70 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-harvest-700">
                    Custom
                  </span>
                )}
                {segments > 1 && (
                  <span className="text-[0.7rem] font-medium text-harvest-700">{segments} credits per send</span>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <PillSwitch on={on} onToggle={toggle} pending={toggling} label={`${on ? "Turn off" : "Turn on"} ${meta.label} SMS`} />
            <span className={cn("text-[0.62rem] font-semibold uppercase tracking-wider", live ? "text-paddy-700" : "text-husk/35")}>
              {!on ? "Off" : masterOn ? "Sending" : "Paused"}
            </span>
          </div>
        </div>

        {/* editor */}
        {open && (
          <div className="grid gap-6 border-t border-husk/8 p-4 sm:p-5 lg:grid-cols-[1fr_15.5rem]">
            <div className="min-w-0">
              <label htmlFor={`tpl-${event}`} className="mb-1.5 block text-sm font-medium text-husk">
                Message template
              </label>
              <textarea
                id={`tpl-${event}`}
                ref={area}
                value={draft}
                onChange={(e) => { setDraft(e.target.value); setNote(null); }}
                rows={5}
                maxLength={480}
                className="ctrl resize-y font-mono text-[0.8rem] leading-relaxed"
              />
              <SmsMeter text={rendered} className="mt-2" />

              <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-widest text-husk-soft">
                Insert a detail
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SMS_PLACEHOLDERS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => insert(p.key)}
                    title={`e.g. ${p.hint}`}
                    aria-label={`Insert {${p.key}}, e.g. ${p.hint}`}
                    className="rounded-full border border-husk/12 bg-rice-100 px-2.5 py-1 font-mono text-[0.7rem] text-husk transition-colors hover:border-paddy-600 hover:bg-paddy-50"
                  >
                    {`{${p.key}}`}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={saving || !dirty || !draft.trim()}
                  onClick={() => save(draft)}
                  className="rounded-full bg-paddy-800 px-5 py-2 text-sm font-medium text-rice-50 transition-colors hover:bg-paddy-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? "Saving…" : "Save message"}
                </button>
                <button
                  type="button"
                  onClick={() => { setOpen(false); setDraft(template); setNote(null); }}
                  className="rounded-full border border-husk/15 px-4 py-2 text-sm font-medium text-husk transition-colors hover:border-husk/30"
                >
                  {dirty ? "Discard" : "Close"}
                </button>
                {!isDefault && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => save("")}
                    className="ml-auto text-xs font-semibold text-husk-soft transition-colors hover:text-clay-600"
                  >
                    Reset to default
                  </button>
                )}
              </div>
              {note && (
                <p role="status" className={cn("mt-3 text-xs font-medium", note.ok ? "text-paddy-700" : "text-clay-600")}>
                  {note.text}
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 text-center text-[0.65rem] font-medium uppercase tracking-widest text-husk-soft">
                Preview · sample order
              </p>
              <SmsPhonePreview sender={senderId} text={rendered} />
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
