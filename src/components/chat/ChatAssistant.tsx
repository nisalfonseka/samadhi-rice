"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ChatProductCard from "@/components/chat/ChatProductCard";
import type { ProductDTO } from "@/lib/services/product.service";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const MARKER = /\[\[product:([a-z0-9-]+)\]\]/gi;
const PARTIAL_MARKER = /\[\[product:[a-z0-9-]*\]?\]?/gi;

/** Render assistant text, turning /shop/... and /blog/... paths into links. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\/(?:shop|blog)\/[a-z0-9-]+)/gi);
  return (
    <>
      {parts.map((part, i) => {
        const m = /^\/(shop|blog)\/[a-z0-9-]+$/i.exec(part);
        if (m) {
          return (
            <Link
              key={i}
              href={part}
              className="font-medium text-paddy-700 underline underline-offset-2 hover:text-paddy-900"
            >
              {m[1].toLowerCase() === "blog" ? "Read article" : "View product"}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function ChatAssistant({
  greeting,
  suggestions,
  whatsapp,
  products,
}: {
  greeting: string;
  suggestions: string[];
  whatsapp: string;
  products: ProductDTO[];
}) {
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.slug, p])),
    [products],
  );
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  /* Separate thinking state so dots show immediately on send,
     before the fetch response arrives and the empty message is added. */
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    // Prevent the event from reaching the page — apply scroll manually
    e.stopPropagation();
    el.scrollTop += e.deltaY;
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setThinking(true); // ← show dots immediately

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.body) throw new Error("no stream");

      // open an empty assistant bubble and fill it as deltas arrive
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        // Hide dots as soon as the first real content arrives
        if (acc.trim().length > 0) {
          setThinking(false);
        }
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setThinking(false);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Sorry — something went wrong. Please try again, or message us on WhatsApp.",
        },
      ]);
    } finally {
      setStreaming(false);
      setThinking(false);
      inputRef.current?.focus();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[min(32rem,70vh)] flex-col">
      {/* Scoped keyframes — guaranteed to load with this component */}
      <style>{`
        @keyframes caDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>

      {/* header */}
      <div className="flex items-center gap-3 border-b border-husk/10 px-5 py-4">
        <span className="relative grid h-10 w-10 place-items-center rounded-full bg-paddy-800 text-rice-50">
          <AssistantIcon className="h-5 w-5" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-rice-50 bg-paddy-500" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-none">Rice Finder</p>
          <p className="text-xs text-husk-soft">
            {thinking ? (
              <span className="inline-flex items-center gap-1">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: "var(--color-paddy-500)",
                    animation: "caDot 1.4s ease-in-out 0s infinite",
                  }}
                />
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: "var(--color-paddy-500)",
                    animation: "caDot 1.4s ease-in-out 0.2s infinite",
                  }}
                />
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: "var(--color-paddy-500)",
                    animation: "caDot 1.4s ease-in-out 0.4s infinite",
                  }}
                />
                <span className="ml-0.5">Thinking</span>
              </span>
            ) : (
              "AI assistant · usually instant"
            )}
          </p>
        </div>
        <Link
          href="/rice-finder"
          aria-label="Open full Rice Finder page"
          title="Open full page"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-husk/50 transition-colors hover:bg-rice-100 hover:text-husk"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path d="M14 4h6v6M10 14L20 4M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {/* messages */}
      <div ref={scrollRef} onWheel={handleWheel} className="flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-5 py-4">
        {/* greeting always shown first */}
        <Bubble role="assistant">{greeting}</Bubble>

        {messages.map((m, i) =>
          m.role === "assistant" ? (
            m.content === "" ? null : (
              <AssistantMessage key={i} content={m.content} productMap={productMap} />
            )
          ) : (
            <Bubble key={i} role="user">
              {m.content}
            </Bubble>
          ),
        )}

        {/* Thinking dots — show whenever thinking is true */}
        {thinking && (
          <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-rice-100 px-4 py-3">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor: "var(--color-husk)",
                animation: "caDot 1.4s ease-in-out 0s infinite",
              }}
            />
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor: "var(--color-husk)",
                animation: "caDot 1.4s ease-in-out 0.2s infinite",
              }}
            />
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor: "var(--color-husk)",
                animation: "caDot 1.4s ease-in-out 0.4s infinite",
              }}
            />
          </div>
        )}

        {/* suggestion chips before the first message */}
        {isEmpty && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-husk/15 px-3 py-1.5 text-xs text-husk transition-colors hover:border-paddy-700 hover:bg-paddy-700 hover:text-rice-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-husk/10 px-3 py-3"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about any rice…"
          enterKeyHint="send"
          className="ctrl flex-1 !rounded-full !py-2.5"
        />
        <button
          type="submit"
          disabled={!input.trim() || streaming}
          aria-label="Send message"
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full text-rice-50 transition-colors",
            !input.trim() || streaming ? "cursor-not-allowed bg-husk/25" : "bg-paddy-800 hover:bg-paddy-700",
          )}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
            <path d="M5 12h13M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>

      {/* whatsapp fallback */}
      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="border-t border-husk/10 py-2 text-center text-[0.7rem] font-medium uppercase tracking-widest text-husk-soft transition-colors hover:text-paddy-700"
      >
        Prefer a human? Chat on WhatsApp →
      </a>
    </div>
  );
}

function AssistantMessage({
  content,
  productMap,
}: {
  content: string;
  productMap: Map<string, ProductDTO>;
}) {
  const slugs = [...content.matchAll(MARKER)].map((m) => m[1]);
  const unique = [...new Set(slugs)].filter((s) => productMap.has(s));
  const text = content.replace(PARTIAL_MARKER, "").replace(/\n{3,}/g, "\n\n").trim();
  return (
    <div className="space-y-2">
      {text && (
        <Bubble role="assistant">
          <RichText text={text} />
        </Bubble>
      )}
      {unique.map((slug) => (
        <ChatProductCard key={slug} product={productMap.get(slug)!} />
      ))}
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          role === "user"
            ? "rounded-br-md bg-paddy-800 text-rice-50"
            : "rounded-bl-md bg-rice-100 text-husk",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function AssistantIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4 4v-4h-.5A1.5 1.5 0 0 1 3 14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 6.6l.85 2.05L14.9 9.5l-2.05.85L12 12.4l-.85-2.05L9.1 9.5l2.05-.85L12 6.6Z" fill="currentColor" />
    </svg>
  );
}
