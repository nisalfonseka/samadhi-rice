"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContactForm, type ContactFormState } from "./actions";

const INIT: ContactFormState = { status: "idle" };

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitContactForm, INIT);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-husk/50">
            Your name
          </span>
          <input
            name="name"
            type="text"
            placeholder="Ayesha Perera"
            className="w-full rounded-2xl border border-husk/15 bg-rice-100/60 px-4 py-3 text-sm text-husk placeholder-husk/30 outline-none transition focus:border-paddy-500 focus:ring-2 focus:ring-paddy-500/10"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-husk/50">
            Email address
          </span>
          <input
            name="email"
            type="email"
            placeholder="ayesha@example.com"
            className="w-full rounded-2xl border border-husk/15 bg-rice-100/60 px-4 py-3 text-sm text-husk placeholder-husk/30 outline-none transition focus:border-paddy-500 focus:ring-2 focus:ring-paddy-500/10"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-husk/50">
          Message <span className="text-clay-500">*</span>
        </span>
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Tell us about your order, ask about a variety, or just say hello…"
          className="w-full resize-none rounded-2xl border border-husk/15 bg-rice-100/60 px-4 py-3 text-sm text-husk placeholder-husk/30 outline-none transition focus:border-paddy-500 focus:ring-2 focus:ring-paddy-500/10"
        />
      </label>

      {state.status === "error" && (
        <p className="rounded-xl bg-clay-500/10 px-4 py-3 text-sm text-clay-600">
          {state.message}
        </p>
      )}

      {state.status === "success" && (
        <p className="rounded-xl bg-paddy-700/10 px-4 py-3 text-sm font-medium text-paddy-700">
          Message sent — we&apos;ll get back to you within 24 hours.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-paddy-800 px-8 py-3.5 text-sm font-medium text-rice-50 transition-all duration-300 hover:bg-paddy-700 hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rice-50/30 border-t-rice-50" />
            Sending…
          </>
        ) : (
          <>
            Send message
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </>
        )}
      </button>
    </form>
  );
}
