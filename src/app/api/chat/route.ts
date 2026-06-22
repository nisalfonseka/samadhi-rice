import { z } from "zod";
import {
  getAssistantConfig,
  buildSystemPrompt,
} from "@/lib/services/assistant.service";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES = 24;
const MAX_CHARS = 2000;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(MAX_CHARS),
      }),
    )
    .min(1)
    .max(MAX_MESSAGES),
});

/** Stream a single plain-text message back (used for graceful fallbacks). */
function textStream(message: string) {
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(message));
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}

/* ────────────────────────── OpenAI streaming ────────────────────────── */

async function streamOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[],
): Promise<ReadableStream> {
  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const err = await upstream.text().catch(() => "");
    throw new Error(`OpenAI ${upstream.status}: ${err.slice(0, 200)}`);
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = upstream.body.getReader();
  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) { controller.close(); return; }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") { controller.close(); return; }
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {
          /* ignore keep-alive / partial frames */
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

/* ────────────────────────── Gemini streaming ────────────────────────── */

async function streamGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[],
): Promise<ReadableStream> {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const upstream = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const err = await upstream.text().catch(() => "");
    throw new Error(`Gemini ${upstream.status}: ${err.slice(0, 200)}`);
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = upstream.body.getReader();
  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) { controller.close(); return; }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) controller.enqueue(encoder.encode(text));
        } catch {
          /* ignore partial frames */
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

/* ────────────────────────── POST handler ────────────────────────── */

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return new Response("Invalid request.", { status: 400 });
  }

  // Rate limit per IP — protects the AI bill from abuse.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon";
  const rl = await rateLimit(`chat:${ip}`, { limit: 15, windowSec: 60 });
  if (!rl.success) {
    return textStream(
      "You're sending messages quite fast 🌾 Please wait a few seconds and try again.",
    );
  }

  const config = await getAssistantConfig();
  if (!config.enabled) {
    return textStream(
      "The assistant is currently offline. Please message us on WhatsApp and we'll help right away.",
    );
  }

  // Pick provider and API key
  const provider = config.provider;
  const apiKey =
    provider === "gemini"
      ? process.env.GEMINI_API_KEY
      : process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return textStream(
      "The assistant isn't connected yet. Please message us on WhatsApp for now — we reply fast!",
    );
  }

  const systemPrompt = await buildSystemPrompt(config);

  // keep only the most recent turns for context/cost control
  const recent = parsed.messages.slice(-12);

  try {
    const stream =
      provider === "gemini"
        ? await streamGemini(apiKey, config.model, systemPrompt, recent)
        : await streamOpenAI(apiKey, config.model, systemPrompt, recent);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch {
    return textStream(
      "I'm having trouble reaching the kitchen right now. Please try again in a moment, or message us on WhatsApp.",
    );
  }
}
