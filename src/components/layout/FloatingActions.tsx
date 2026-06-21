"use client";

import { useEffect, useState } from "react";
import ChatAssistant from "@/components/chat/ChatAssistant";
import type { ProductDTO } from "@/lib/services/product.service";
import { cn } from "@/lib/utils";

export default function FloatingActions({
  whatsapp,
  assistant,
  products,
}: {
  whatsapp: string;
  assistant: { enabled: boolean; greeting: string; suggestions: string[] };
  products: ProductDTO[];
}) {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);

  // reveal after a small scroll so it doesn't crowd the hero
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 transition-all duration-500",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      {/* assistant chat panel */}
      {assistant.enabled && (
        <div
          className={cn(
            "w-[min(22rem,calc(100vw-2.5rem))] origin-bottom-right overflow-hidden rounded-3xl border border-husk/10 bg-rice-50 shadow-[0_30px_60px_-24px_rgba(34,31,23,0.5)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            open ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0",
          )}
        >
          {open && (
            <ChatAssistant
              greeting={assistant.greeting}
              suggestions={assistant.suggestions}
              whatsapp={whatsapp}
              products={products}
            />
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="grid place-items-center rounded-full bg-[#25D366] text-white shadow-[0_16px_30px_-12px_rgba(37,211,102,0.8)] transition-transform duration-300 hover:scale-105"
          style={{ height: "3.25rem", width: "3.25rem" }}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
            <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3m4.1 11.8a2.5 2.5 0 0 1-1.7 1.2c-.4 0-.4.3-2.4-.5a11 11 0 0 1-4.2-3.7 4.9 4.9 0 0 1-1-2.6 2.8 2.8 0 0 1 .9-2.1.9.9 0 0 1 .7-.3h.5c.1 0 .3 0 .5.4l.7 1.6q.15.2 0 .5l-.4.4c-.1.1-.2.3-.1.5a6.5 6.5 0 0 0 1.2 1.5 5.9 5.9 0 0 0 1.7 1c.2.1.4.1.5-.1s.6-.7.7-.9.3-.2.5-.1 1.3.7 1.5.7.1.4.1.5" />
          </svg>
        </a>

        {/* assistant toggle */}
        {assistant.enabled && (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close Rice Finder assistant" : "Open Rice Finder assistant"}
            className="grid place-items-center rounded-full bg-paddy-800 text-rice-50 shadow-[0_16px_30px_-12px_rgba(29,41,22,0.9)] transition-transform duration-300 hover:scale-105"
            style={{ height: "3.5rem", width: "3.5rem", animation: open ? "none" : "breathe 3.2s ease-in-out infinite" }}
          >
            {open ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <span className="select-none text-2xl leading-none">✦</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

