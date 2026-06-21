"use client";

import { useState } from "react";
import { saveAssistant } from "@/app/admin/actions";
import type { AssistantConfig, AssistantDoc, AssistantProvider } from "@/lib/services/assistant.service";

const OPENAI_MODELS = [
  { value: "gpt-5-mini", label: "GPT-5 Mini", desc: "Fast & affordable" },
  { value: "gpt-5", label: "GPT-5", desc: "Most capable" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini", desc: "Compact & quick" },
  { value: "gpt-4.1-nano", label: "GPT-4.1 Nano", desc: "Cheapest" },
];

const GEMINI_MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Fast & affordable" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", desc: "Most capable" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", desc: "Previous gen, stable" },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-husk">{label}</span>
      {hint && <span className="mb-1.5 block text-xs text-husk-soft">{hint}</span>}
      {children}
    </label>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-husk/10 bg-rice-50 p-6">
      <div className="mb-5 border-b border-husk/8 pb-4">
        <h2 className="font-display text-xl text-husk">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-husk-soft">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function ProviderCard({
  provider,
  label,
  icon,
  desc,
  selected,
  connected,
  onSelect,
}: {
  provider: AssistantProvider;
  label: string;
  icon: React.ReactNode;
  desc: string;
  selected: boolean;
  connected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-1 flex-col items-center gap-2.5 rounded-xl border-2 p-5 text-center transition-all ${
        selected
          ? "border-paddy-700 bg-paddy-800/5 shadow-sm"
          : "border-husk/12 bg-rice-50 hover:border-husk/25"
      }`}
    >
      {/* selected indicator */}
      <span
        className={`absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border-2 transition-colors ${
          selected ? "border-paddy-700 bg-paddy-700" : "border-husk/20"
        }`}
      >
        {selected && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-rice-50" fill="none">
            <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>

      {/* connection dot */}
      <span className="relative">
        {icon}
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-rice-50 ${
            connected ? "bg-paddy-500" : "bg-husk/30"
          }`}
          title={connected ? "API key configured" : "API key missing"}
        />
      </span>

      <span className="text-sm font-semibold text-husk">{label}</span>
      <span className="text-xs text-husk-soft">{desc}</span>
      <span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider ${
        connected
          ? "bg-paddy-800/10 text-paddy-700"
          : "bg-husk/8 text-husk-soft"
      }`}>
        {connected ? "Connected" : "No key"}
      </span>
    </button>
  );
}

export default function AssistantAdmin({
  config,
  hasOpenAIKey,
  hasGeminiKey,
}: {
  config: AssistantConfig;
  hasOpenAIKey: boolean;
  hasGeminiKey: boolean;
}) {
  const [docs, setDocs] = useState<AssistantDoc[]>(config.docs);
  const [provider, setProvider] = useState<AssistantProvider>(config.provider);
  const [model, setModel] = useState(config.model);

  const models = provider === "gemini" ? GEMINI_MODELS : OPENAI_MODELS;
  // if the current model isn't in the list for this provider, default to first
  const validModel = models.some((m) => m.value === model)
    ? model
    : models[0].value;

  const switchProvider = (p: AssistantProvider) => {
    setProvider(p);
    const newModels = p === "gemini" ? GEMINI_MODELS : OPENAI_MODELS;
    setModel(newModels[0].value);
  };

  const addDoc = () =>
    setDocs((d) => [...d, { id: `doc-${Date.now()}`, title: "", content: "" }]);
  const updateDoc = (id: string, patch: Partial<AssistantDoc>) =>
    setDocs((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeDoc = (id: string) => setDocs((d) => d.filter((x) => x.id !== id));

  return (
    <form action={saveAssistant} className="space-y-7">
      <input type="hidden" name="assistant_docs" value={JSON.stringify(docs)} />
      <input type="hidden" name="assistant_provider" value={provider} />
      <input type="hidden" name="assistant_model" value={validModel} />

      {/* ── Provider & model ── */}
      <Section title="AI provider & model" description="Choose which AI service powers the chat assistant.">
        <div className="space-y-5">
          {/* provider cards */}
          <div className="flex gap-3">
            <ProviderCard
              provider="openai"
              label="OpenAI"
              desc="GPT-5 & GPT-4.1 models"
              selected={provider === "openai"}
              connected={hasOpenAIKey}
              onSelect={() => switchProvider("openai")}
              icon={
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#0a0a0a] text-white">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
                  </svg>
                </span>
              }
            />
            <ProviderCard
              provider="gemini"
              label="Google Gemini"
              desc="Gemini 2.5 Flash & Pro"
              selected={provider === "gemini"}
              connected={hasGeminiKey}
              onSelect={() => switchProvider("gemini")}
              icon={
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                    <path d="M12 0C5.352 0 0 6.032 0 12.688c0 .448.268.85.682 1.024l10.636 4.504a1.104 1.104 0 0 0 .364.064c.122 0 .246-.022.364-.064L22.682 13.712A1.104 1.104 0 0 0 23.364 12.688C23.364 6.032 18.012 0 11.364 0zM12 2.4a9.88 9.88 0 0 1 7.384 3.304L12 9.392 4.616 5.704A9.88 9.88 0 0 1 12 2.4zm-8.784 5.2L12 11.792l8.784-4.192c.928 1.568 1.48 3.424 1.48 5.088l-10.264 4.344L1.736 12.688c0-1.664.552-3.52 1.48-5.088z" />
                  </svg>
                </span>
              }
            />
          </div>

          {/* model selector */}
          <Field
            label="Model"
            hint={provider === "gemini"
              ? "Gemini 2.5 Flash recommended for speed and cost."
              : "GPT-5 Mini recommended for speed and cost."
            }
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {models.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setModel(m.value)}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    validModel === m.value
                      ? "border-paddy-700 bg-paddy-800/5"
                      : "border-husk/12 hover:border-husk/25"
                  }`}
                >
                  <span
                    className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${
                      validModel === m.value
                        ? "border-paddy-700 bg-paddy-700"
                        : "border-husk/25"
                    }`}
                  >
                    {validModel === m.value && (
                      <span className="h-1.5 w-1.5 rounded-full bg-rice-50" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-husk">{m.label}</p>
                    <p className="text-xs text-husk-soft">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Field>

          {/* enabled toggle */}
          <label className="flex items-center gap-2.5 text-sm text-husk">
            <input type="checkbox" name="assistant_enabled" defaultChecked={config.enabled} className="h-4 w-4 accent-paddy-800" />
            Show the Rice Finder assistant on the storefront
          </label>
        </div>
      </Section>

      <Section title="Conversation" description="The first message customers see and the quick-reply chips.">
        <div className="space-y-4">
          <Field label="Greeting message">
            <textarea name="assistant_greeting" rows={2} defaultValue={config.greeting} className="ctrl resize-none" />
          </Field>
          <Field label="Suggestion chips" hint="One per line — shown as quick-reply buttons (max 6).">
            <textarea
              name="assistant_suggestions"
              rows={4}
              defaultValue={config.suggestions.join("\n")}
              className="ctrl resize-none"
              placeholder={"Best rice for biryani?\nDiabetic-friendly options\nI want to buy in bulk"}
            />
          </Field>
        </div>
      </Section>

      <Section title="Behaviour prompt" description="The system instructions that shape the assistant's tone and rules. The live product catalogue is added automatically.">
        <Field label="System prompt">
          <textarea name="assistant_system_prompt" rows={12} defaultValue={config.systemPrompt} className="ctrl resize-y font-mono text-xs leading-relaxed" />
        </Field>
      </Section>

      <Section title="Knowledge documents" description="Extra context the assistant can use — rice comparisons, health notes, FAQs, recipes, storage tips. These are added to every conversation.">
        <div className="space-y-4">
          {docs.length === 0 && (
            <p className="rounded-xl border border-dashed border-husk/15 p-6 text-center text-sm text-husk-soft">
              No documents yet. Add notes like &ldquo;Best rice for diabetics&rdquo; or &ldquo;Biryani vs everyday rice&rdquo;.
            </p>
          )}
          {docs.map((doc, i) => (
            <div key={doc.id} className="rounded-2xl border border-husk/12 bg-rice-100/60 p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-paddy-800/10 text-xs font-bold text-paddy-700">
                  {i + 1}
                </span>
                <input
                  value={doc.title}
                  onChange={(e) => updateDoc(doc.id, { title: e.target.value })}
                  placeholder="Document title (e.g. Diabetic-friendly rice)"
                  className="ctrl flex-1 !py-2"
                />
                <button
                  type="button"
                  onClick={() => removeDoc(doc.id)}
                  aria-label="Remove document"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-husk/15 text-husk-soft transition-colors hover:border-clay-500 hover:text-clay-600"
                >
                  ✕
                </button>
              </div>
              <textarea
                value={doc.content}
                onChange={(e) => updateDoc(doc.id, { content: e.target.value })}
                rows={5}
                placeholder="Write the knowledge in plain language…"
                className="ctrl resize-y text-sm"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addDoc}
            className="rounded-full border border-husk/15 px-5 py-2.5 text-sm font-medium text-husk transition-colors hover:border-paddy-600 hover:text-paddy-700"
          >
            + Add document
          </button>
        </div>
      </Section>

      <div className="flex items-center gap-4 pt-1">
        <button type="submit" className="rounded-full bg-paddy-800 px-8 py-3 font-medium text-rice-50 transition-colors hover:bg-paddy-700">
          Save assistant
        </button>
        <p className="text-xs text-husk-soft">Changes apply immediately to the live chat.</p>
      </div>
    </form>
  );
}
