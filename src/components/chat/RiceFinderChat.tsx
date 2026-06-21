"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import RiceBag from "@/components/shop/RiceBag";
import { useCart } from "@/providers/CartProvider";
import { priceFor, formatLKR } from "@/lib/pricing";
import type { ProductDTO } from "@/lib/services/product.service";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type Msg = { role: "user" | "assistant"; content: string };

type Conversation = {
  id: string;
  title: string;
  messages: Msg[];
  updatedAt: number;
};

const STORAGE_KEY = "rf.conversations.v1";
const ACTIVE_KEY = "rf.active.v1";

/* ─── Markers ────────────────────────────────────────────────────────────── */

const MARKER = /\[\[product:([a-z0-9-]+)\]\]/gi;
const PARTIAL_MARKER = /\[\[product:[a-z0-9-]*\]?\]?/gi;

function extractSlugs(content: string): string[] {
  return [...content.matchAll(MARKER)].map((m) => m[1]);
}

/* ─── Storage helpers ────────────────────────────────────────────────────── */

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveConversations(list: Conversation[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* quota — ignore */
  }
}

function loadActiveId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

function saveActiveId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(ACTIVE_KEY, id);
    else window.localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* ignore */
  }
}

function titleFromMessage(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > 48 ? trimmed.slice(0, 48) + "…" : trimmed;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

/* ─── Main component ─────────────────────────────────────────────────────── */

export default function RiceFinderChat({
  greeting,
  suggestions,
  products,
  enabled,
}: {
  greeting: string;
  suggestions: string[];
  products: ProductDTO[];
  enabled: boolean;
}) {
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated" && !!session?.user;

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.slug, p])),
    [products],
  );

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* ─── Hydrate from localStorage ──────────────────────────────────────── */
  useEffect(() => {
    const list = loadConversations();
    setConversations(list);
    const stored = loadActiveId();
    if (stored && list.some((c) => c.id === stored)) {
      setActiveId(stored);
    }
  }, []);

  /* ─── Persist on change ──────────────────────────────────────────────── */
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveActiveId(activeId);
  }, [activeId]);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const messages = active?.messages ?? [];
  const isEmpty = messages.length === 0;

  /* ─── Product slugs referenced in current conversation ───────────────── */
  const referencedSlugs = useMemo(() => {
    const slugs: string[] = [];
    for (const m of messages) {
      if (m.role !== "assistant") continue;
      for (const s of extractSlugs(m.content)) slugs.push(s);
    }
    return [...new Set(slugs)].filter((s) => productMap.has(s));
  }, [messages, productMap]);

  /* ─── Auto-scroll ────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  /* ─── Open right panel when products land (desktop) ──────────────────── */
  useEffect(() => {
    if (
      referencedSlugs.length > 0 &&
      typeof window !== "undefined" &&
      window.innerWidth >= 1024
    ) {
      setRightOpen(true);
    }
  }, [referencedSlugs.length]);

  /* ─── Trackpad scroll capture (Lenis interferes otherwise) ───────────── */
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    e.stopPropagation();
    el.scrollTop += e.deltaY;
  };

  /* ─── Auto-resize textarea ───────────────────────────────────────────── */
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  /* ─── Conversation operations ────────────────────────────────────────── */

  const newConversation = useCallback(() => {
    setActiveId(null);
    setInput("");
    setLeftOpen(false);
    setRightOpen(false);
    inputRef.current?.focus();
  }, []);

  const selectConversation = (id: string) => {
    setActiveId(id);
    setLeftOpen(false);
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  /* ─── Send a message ─────────────────────────────────────────────────── */

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming || !enabled) return;

    let convId = activeId;
    let nextMessages: Msg[];

    if (!convId) {
      convId = (
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      ) as string;
      const newConv: Conversation = {
        id: convId,
        title: titleFromMessage(trimmed),
        messages: [{ role: "user", content: trimmed }],
        updatedAt: Date.now(),
      };
      nextMessages = newConv.messages;
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(convId);
    } else {
      nextMessages = [...messages, { role: "user", content: trimmed }];
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: nextMessages, updatedAt: Date.now() }
            : c,
        ),
      );
    }

    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setStreaming(true);
    setThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      if (!res.body) throw new Error("no stream");

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...nextMessages, { role: "assistant", content: "" }],
                updatedAt: Date.now(),
              }
            : c,
        ),
      );

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        if (acc.trim().length > 0) setThinking(false);
        const updated = acc;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: [
                    ...nextMessages,
                    { role: "assistant", content: updated },
                  ],
                  updatedAt: Date.now(),
                }
              : c,
          ),
        );
      }
    } catch {
      setThinking(false);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [
                  ...nextMessages,
                  {
                    role: "assistant",
                    content:
                      "Sorry — something went wrong. Please try again.",
                  },
                ],
                updatedAt: Date.now(),
              }
            : c,
        ),
      );
    } finally {
      setStreaming(false);
      setThinking(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  /* ─── Render ─────────────────────────────────────────────────────────── */

  return (
    <>
      <style>{`
        @keyframes rfcDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
          30%            { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes rfcRise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rfcFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .rfc-rise { animation: rfcRise 0.32s ease-out both; }
        .rfc-fade { animation: rfcFade 0.45s ease-out both; }
      `}</style>

      {/* Page container — sits below the fixed global Header (~7.25rem).
          Uses dvh so it works with mobile browser chrome. */}
      <div
        className="flex bg-rice-50 text-husk"
        style={{ height: "100dvh", paddingTop: "7.25rem", boxSizing: "border-box" }}
      >
        <div className="flex w-full min-h-0 flex-1">
          {/* Left sidebar */}
          <LeftSidebar
            open={leftOpen}
            signedIn={signedIn}
            sessionLoading={status === "loading"}
            conversations={conversations}
            activeId={activeId}
            onSelect={selectConversation}
            onNew={newConversation}
            onDelete={deleteConversation}
            onClose={() => setLeftOpen(false)}
          />

          {/* Center chat */}
          <main className="flex min-w-0 flex-1 flex-col">
            {/* Compact in-page sub-toolbar (mobile only) — opens the sidebars */}
            <div className="flex items-center justify-between border-b border-husk/8 bg-rice-50 px-3 py-2 lg:hidden">
              <button
                onClick={() => setLeftOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-lg text-husk/60 transition-colors hover:bg-rice-100 hover:text-husk"
                aria-label="Open conversations"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
              <p className="text-xs font-medium text-husk/70">Rice Finder</p>
              <button
                onClick={() => setRightOpen(true)}
                className={`relative grid h-9 w-9 place-items-center rounded-lg text-husk/60 transition-colors hover:bg-rice-100 hover:text-husk ${
                  referencedSlugs.length === 0 ? "opacity-40" : ""
                }`}
                aria-label="Open products"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path d="M3 7h18M5 7v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7M9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                {referencedSlugs.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-paddy-500" />
                )}
              </button>
            </div>

            <div
              ref={scrollRef}
              onWheel={handleWheel}
              className="flex-1 overflow-y-auto overscroll-y-contain"
            >
              <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
                {/* Greeting */}
                <AssistantTextBubble>{greeting}</AssistantTextBubble>

                {/* Messages */}
                <div className="mt-4 space-y-4">
                  {messages.map((m, i) =>
                    m.role === "user" ? (
                      <UserBubble key={i} content={m.content} />
                    ) : m.content === "" ? null : (
                      <AssistantMessage
                        key={i}
                        content={m.content}
                        productMap={productMap}
                      />
                    ),
                  )}

                  {thinking && <ThinkingDots />}

                  {!enabled && (
                    <div className="rfc-fade rounded-xl border border-husk/10 bg-white p-4 text-center text-sm text-husk/60">
                      The assistant is currently offline. Please{" "}
                      <Link href="/contact" className="underline">
                        contact us
                      </Link>{" "}
                      directly.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Composer — blends with chat area, no boxed background */}
            <Composer
              isEmpty={isEmpty}
              suggestions={suggestions}
              input={input}
              streaming={streaming}
              enabled={enabled}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onSend={() => send(input)}
              onSuggest={(s) => send(s)}
              inputRef={inputRef}
            />
          </main>

          {/* Right sidebar */}
          <RightSidebar
            open={rightOpen}
            slugs={referencedSlugs}
            productMap={productMap}
            onClose={() => setRightOpen(false)}
          />
        </div>

        {/* Mobile overlay backdrop */}
        {(leftOpen || rightOpen) && (
          <button
            onClick={() => {
              setLeftOpen(false);
              setRightOpen(false);
            }}
            aria-label="Close panel"
            className="fixed inset-0 z-30 bg-husk/30 backdrop-blur-sm lg:hidden"
          />
        )}
      </div>
    </>
  );
}

/* ─── Left sidebar ───────────────────────────────────────────────────────── */

function LeftSidebar({
  open,
  signedIn,
  sessionLoading,
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onClose,
}: {
  open: boolean;
  signedIn: boolean;
  sessionLoading: boolean;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-husk/8 bg-rice-50 transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-husk/45">
          Conversations
        </p>
        <button
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-lg text-husk/45 hover:bg-rice-100 hover:text-husk lg:hidden"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="px-3">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-lg border border-husk/12 bg-white px-3 py-2 text-sm font-medium text-husk transition-all duration-200 hover:-translate-y-px hover:border-husk/25 hover:shadow-sm"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New chat
        </button>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {sessionLoading ? (
          <div className="px-3 py-2 text-xs text-husk/40">Loading…</div>
        ) : !signedIn ? (
          <SignInPrompt />
        ) : conversations.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-husk/45">No conversations yet.</p>
            <p className="mt-1 text-xs text-husk/30">Ask anything to begin.</p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => (
              <li key={c.id}>
                <ConversationItem
                  conv={c}
                  active={c.id === activeId}
                  onSelect={() => onSelect(c.id)}
                  onDelete={() => onDelete(c.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function ConversationItem({
  conv,
  active,
  onSelect,
  onDelete,
}: {
  conv: Conversation;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div
      className={`group flex items-center gap-1 rounded-lg px-2 py-2 transition-colors duration-150 ${
        active ? "bg-white shadow-sm" : "hover:bg-white/60"
      }`}
    >
      <button onClick={onSelect} className="flex min-w-0 flex-1 flex-col items-start text-left">
        <span className="w-full truncate text-sm text-husk">{conv.title}</span>
        <span className="text-[0.65rem] text-husk/40">{timeAgo(conv.updatedAt)}</span>
      </button>
      {confirming ? (
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded px-1.5 py-0.5 text-[0.65rem] font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirming(false);
            }}
            className="rounded px-1.5 py-0.5 text-[0.65rem] text-husk/50 hover:bg-rice-100"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setConfirming(true);
          }}
          className="grid h-6 w-6 shrink-0 place-items-center rounded text-husk/30 opacity-0 transition-opacity duration-150 hover:bg-rice-200 hover:text-husk/70 group-hover:opacity-100"
          aria-label="Delete conversation"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

function SignInPrompt() {
  return (
    <div className="rfc-fade mx-2 mt-1 rounded-xl border border-husk/10 bg-white p-4">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-paddy-100 text-paddy-700">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <p className="mt-3 text-sm font-medium text-husk">Save your chats</p>
      <p className="mt-1 text-xs leading-relaxed text-husk/55">
        Sign in to keep your conversations synced across devices.
      </p>
      <Link
        href="/login"
        className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-husk px-3 py-2 text-xs font-medium text-rice-50 transition-colors hover:bg-husk/85"
      >
        Sign in
      </Link>
      <Link
        href="/register"
        className="mt-1.5 inline-flex w-full items-center justify-center rounded-lg px-3 py-1.5 text-xs text-husk/55 hover:text-husk"
      >
        Create account
      </Link>
    </div>
  );
}

/* ─── Right sidebar ──────────────────────────────────────────────────────── */

function RightSidebar({
  open,
  slugs,
  productMap,
  onClose,
}: {
  open: boolean;
  slugs: string[];
  productMap: Map<string, ProductDTO>;
  onClose: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    e.stopPropagation();
    el.scrollTop += e.deltaY;
  };

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-40 flex w-80 shrink-0 flex-col border-l border-husk/8 bg-rice-50 transition-transform duration-300 ease-out lg:static lg:flex lg:translate-x-0 ${
        open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      } ${slugs.length === 0 ? "lg:hidden xl:flex" : ""}`}
    >
      <div className="flex items-center justify-between border-b border-husk/8 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-husk/45">
            Recommended
          </p>
          <p className="mt-0.5 text-[0.65rem] text-husk/40">
            {slugs.length === 0
              ? "Suggestions appear here"
              : `${slugs.length} ${slugs.length === 1 ? "rice" : "rices"} mentioned`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-lg text-husk/45 hover:bg-rice-100 hover:text-husk lg:hidden"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div ref={scrollRef} onWheel={handleWheel} className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3">
        {slugs.length === 0 ? (
          <div className="grid h-full place-items-center px-4 text-center">
            <div className="rfc-fade">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rice-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-husk/35" fill="none">
                  <path d="M3 7h18M5 7v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7M9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-medium text-husk/65">No products yet</p>
              <p className="mt-1 text-xs text-husk/40">
                Ask the assistant for a recommendation.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {slugs.map((slug, i) => {
              const p = productMap.get(slug);
              if (!p) return null;
              return (
                <div
                  key={slug}
                  className="rfc-rise"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <ProductDetailCard product={p} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

/* ─── Product detail card (right sidebar) ────────────────────────────────── */

function ProductDetailCard({ product }: { product: ProductDTO }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const price = priceFor(product.pricePerKg, 1, product.discountPercent);
  const soldOut = product.stockKg <= 0;

  const handleAdd = () => {
    if (soldOut) return;
    add({ slug: product.slug, name: product.name, weight: 1, price });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className="overflow-hidden rounded-xl border border-husk/10 bg-white transition-shadow duration-200 hover:shadow-sm">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="grid h-32 place-items-center bg-rice-100">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
          ) : (
            <RiceBag
              id={`rfright-${product.slug}`}
              light={product.grain.light}
              mid={product.grain.mid}
              dark={product.grain.dark}
              sinhala={product.sinhala}
              className="h-28 w-28"
            />
          )}
        </div>
      </Link>
      <div className="p-3">
        {product.variety && (
          <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-clay-500">
            {product.variety}
          </p>
        )}
        <Link href={`/shop/${product.slug}`} className="block">
          <h3 className="mt-0.5 font-display text-base leading-tight text-husk hover:underline">
            {product.name}
          </h3>
        </Link>
        {product.note && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-husk/55">
            {product.note}
          </p>
        )}

        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-base font-semibold text-paddy-800">
            {formatLKR(price)}
          </span>
          <span className="text-[0.7rem] text-husk/50">/ kg</span>
          {product.discountPercent > 0 && (
            <span className="ml-auto rounded bg-clay-500/15 px-1.5 py-0.5 text-[0.6rem] font-semibold text-clay-600">
              −{product.discountPercent}%
            </span>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 text-[0.65rem]">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${soldOut ? "bg-red-500" : "bg-paddy-500"}`} />
          <span className="text-husk/55">
            {soldOut ? "Out of stock" : `${product.stockKg} kg available`}
          </span>
          {product.origin && (
            <>
              <span className="text-husk/25">·</span>
              <span className="truncate text-husk/55">{product.origin}</span>
            </>
          )}
        </div>

        <div className="mt-3 flex gap-1.5">
          <button
            onClick={handleAdd}
            disabled={soldOut}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
              soldOut
                ? "cursor-not-allowed bg-husk/10 text-husk/40"
                : added
                  ? "bg-paddy-600 text-rice-50"
                  : "bg-husk text-rice-50 hover:-translate-y-px hover:bg-husk/85 hover:shadow-sm"
            }`}
          >
            {added ? "Added ✓" : "Add to cart"}
          </button>
          <Link
            href={`/shop/${product.slug}`}
            className="rounded-lg border border-husk/12 px-3 py-2 text-xs font-medium text-husk transition-colors hover:bg-rice-100"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ─── Composer (no boxed background — blends with chat) ─────────────────── */

function Composer({
  isEmpty,
  suggestions,
  input,
  streaming,
  enabled,
  onInput,
  onKeyDown,
  onSend,
  onSuggest,
  inputRef,
}: {
  isEmpty: boolean;
  suggestions: string[];
  input: string;
  streaming: boolean;
  enabled: boolean;
  onInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onSuggest: (text: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div className="shrink-0 bg-rice-50">
      {isEmpty && suggestions.length > 0 && (
        <div className="mx-auto max-w-2xl px-4 pt-3 sm:px-6">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s, i) => (
              <button
                key={s}
                onClick={() => onSuggest(s)}
                disabled={!enabled || streaming}
                className="rfc-rise rounded-full border border-husk/12 bg-white px-3 py-1.5 text-xs text-husk/75 transition-all duration-200 hover:-translate-y-px hover:border-husk/25 hover:text-husk hover:shadow-sm disabled:opacity-40"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="mx-auto max-w-2xl px-4 pb-3 pt-3 sm:px-6"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-husk/12 bg-white px-2 py-1.5 transition-colors duration-200 focus-within:border-husk/30">
          <textarea
            ref={inputRef}
            value={input}
            onChange={onInput}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Message Rice Finder…"
            disabled={!enabled}
            className="flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-husk outline-none placeholder:text-husk/35 disabled:opacity-40"
            style={{ minHeight: "2.25rem", maxHeight: "9rem" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming || !enabled}
            aria-label="Send message"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-husk text-rice-50 transition-all duration-200 hover:-translate-y-px hover:bg-husk/85 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-husk/20 disabled:hover:translate-y-0"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
              <path d="M5 12h13M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-center text-[0.62rem] text-husk/35">
          Enter to send · Shift+Enter for new line · AI may make mistakes
        </p>
      </form>
    </div>
  );
}

/* ─── Chat bubbles ───────────────────────────────────────────────────────── */

function UserBubble({ content }: { content: string }) {
  return (
    <div className="rfc-rise flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-husk px-4 py-2.5 text-sm leading-relaxed text-rice-50">
        {content}
      </div>
    </div>
  );
}

function AssistantTextBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="rfc-rise flex items-start gap-2.5">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paddy-800 text-rice-50 text-sm leading-none select-none">
        ✦
      </span>
      <div className="flex-1 rounded-2xl rounded-tl-md border border-husk/8 bg-white px-4 py-2.5 text-sm leading-relaxed text-husk">
        {children}
      </div>
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
  const slugs = extractSlugs(content);
  const unique = [...new Set(slugs)].filter((s) => productMap.has(s));
  const text = content
    .replace(PARTIAL_MARKER, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const parts = text.split(/(\/(?:shop|blog)\/[a-z0-9-]+)/gi);

  return (
    <div className="space-y-2">
      {text && (
        <AssistantTextBubble>
          <p className="whitespace-pre-wrap">
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
          </p>
        </AssistantTextBubble>
      )}
      {unique.length > 0 && (
        <div className="ml-9 grid gap-2 sm:grid-cols-2">
          {unique.map((slug, i) => {
            const p = productMap.get(slug)!;
            return (
              <div
                key={slug}
                className="rfc-rise"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <InlineProductCard product={p} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InlineProductCard({ product }: { product: ProductDTO }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const price = priceFor(product.pricePerKg, 1, product.discountPercent);
  const soldOut = product.stockKg <= 0;
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-husk/10 bg-white p-2.5 transition-shadow duration-200 hover:shadow-sm">
      <Link
        href={`/shop/${product.slug}`}
        className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-rice-100"
      >
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
        ) : (
          <RiceBag
            id={`rfinline-${product.slug}`}
            light={product.grain.light}
            mid={product.grain.mid}
            dark={product.grain.dark}
            sinhala={product.sinhala}
            className="h-10 w-10"
          />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/shop/${product.slug}`} className="block">
          <p className="truncate text-sm font-medium text-husk hover:underline">
            {product.name}
          </p>
        </Link>
        <p className="text-xs text-husk/55">
          {formatLKR(price)}
          <span className="text-husk/40">/kg</span>
        </p>
      </div>
      <button
        onClick={() => {
          if (soldOut) return;
          add({ slug: product.slug, name: product.name, weight: 1, price });
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1200);
        }}
        disabled={soldOut}
        aria-label="Add to cart"
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-200 ${
          soldOut
            ? "cursor-not-allowed bg-husk/10 text-husk/30"
            : added
              ? "bg-paddy-600 text-rice-50"
              : "bg-husk text-rice-50 hover:-translate-y-px hover:bg-husk/85 hover:shadow-sm"
        }`}
      >
        {added ? (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
            <path d="m5 12.5 4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="rfc-fade flex items-start gap-2.5" aria-label="Assistant is thinking">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paddy-800 text-rice-50 text-sm leading-none select-none">
        ✦
      </span>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-husk/8 bg-white px-4 py-3">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-husk/60"
          style={{ animation: "rfcDot 1.4s ease-in-out 0s infinite" }}
        />
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-husk/60"
          style={{ animation: "rfcDot 1.4s ease-in-out 0.15s infinite" }}
        />
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-husk/60"
          style={{ animation: "rfcDot 1.4s ease-in-out 0.3s infinite" }}
        />
      </div>
    </div>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function GrainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <ellipse cx="12" cy="12" rx="5" ry="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3c0 5-4 9-4 9s4 4 4 9M12 3c0 5 4 9 4 9s-4 4-4 9"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
