import { getAssistantConfig } from "@/lib/services/assistant.service";
import AssistantAdmin from "@/components/admin/AssistantAdmin";

export const dynamic = "force-dynamic";

export default async function AdminAssistantPage() {
  const config = await getAssistantConfig();
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

  return (
    <div className="max-w-2xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl text-husk">Rice Finder assistant</h1>
        <p className="mt-1 text-husk-soft">
          The AI helper that guides shoppers to the right rice. It already knows your full product
          catalogue — use the documents below to teach it everything else.
        </p>
      </header>

      {/* API key status banners */}
      <div className="mb-6 space-y-3">
        {!hasOpenAIKey && !hasGeminiKey && (
          <div className="rounded-2xl border border-harvest-500/40 bg-harvest-200/40 p-4 text-sm text-husk">
            <strong className="font-semibold">No AI provider connected.</strong> Add{" "}
            <code className="rounded bg-husk/8 px-1 py-px text-xs">OPENAI_API_KEY</code> or{" "}
            <code className="rounded bg-husk/8 px-1 py-px text-xs">GEMINI_API_KEY</code> to{" "}
            <code className="rounded bg-husk/8 px-1 py-px text-xs">.env.local</code> to enable the
            assistant.
          </div>
        )}

        {config.provider === "openai" && !hasOpenAIKey && hasGeminiKey && (
          <div className="rounded-2xl border border-harvest-500/40 bg-harvest-200/40 p-4 text-sm text-husk">
            <strong className="font-semibold">OpenAI selected but no key found.</strong> Add{" "}
            <code className="rounded bg-husk/8 px-1 py-px text-xs">OPENAI_API_KEY</code> to{" "}
            <code className="rounded bg-husk/8 px-1 py-px text-xs">.env.local</code>, or switch to Gemini below.
          </div>
        )}

        {config.provider === "gemini" && !hasGeminiKey && hasOpenAIKey && (
          <div className="rounded-2xl border border-harvest-500/40 bg-harvest-200/40 p-4 text-sm text-husk">
            <strong className="font-semibold">Gemini selected but no key found.</strong> Add{" "}
            <code className="rounded bg-husk/8 px-1 py-px text-xs">GEMINI_API_KEY</code> to{" "}
            <code className="rounded bg-husk/8 px-1 py-px text-xs">.env.local</code>, or switch to OpenAI below.
          </div>
        )}
      </div>

      <AssistantAdmin
        config={config}
        hasOpenAIKey={hasOpenAIKey}
        hasGeminiKey={hasGeminiKey}
      />
    </div>
  );
}
