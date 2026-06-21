"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { PRESET_WEIGHTS } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const STOPS = PRESET_WEIGHTS;

export default function WeightSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (w: number) => void;
  pricePerKg?: number;
  discountPercent?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customVal, setCustomVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const startXRef = useRef(0);
  const isDragRef = useRef(false);

  const isPreset = STOPS.includes(value as (typeof STOPS)[number]);
  const activeIdx = isPreset ? STOPS.indexOf(value as (typeof STOPS)[number]) : -1;
  const pct = (idx: number) => (idx / (STOPS.length - 1)) * 100;
  const thumbPct = activeIdx >= 0 ? pct(activeIdx) : -1;

  const resolve = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const nearest = Math.round(ratio * (STOPS.length - 1));
      onChange(STOPS[nearest]);
      setCustomOpen(false);
    },
    [onChange],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      setDragging(true);
      startXRef.current = e.clientX;
      isDragRef.current = false;
      resolve(e.clientX);
    },
    [resolve],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      if (Math.abs(e.clientX - startXRef.current) > 3) {
        isDragRef.current = true;
      }
      resolve(e.clientX);
    },
    [dragging, resolve],
  );

  const onPointerUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    if (!dragging) return;
    const up = () => setDragging(false);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [dragging]);

  const applyCustom = () => {
    const n = parseInt(customVal, 10);
    if (n >= 1 && n <= 100) {
      onChange(n);
      setCustomOpen(false);
    }
  };

  useEffect(() => {
    if (customOpen) inputRef.current?.focus();
  }, [customOpen]);

  return (
    <div className="select-none">
      {/* ── Track ── */}
      <div
        ref={trackRef}
        className="relative h-10 touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* base rail — spans first-dot-center to last-dot-center */}
        <div className="absolute inset-x-0 top-[17px] h-[2px] rounded-full bg-husk/12" />

        {/* filled rail */}
        {activeIdx >= 0 && (
          <div
            className="absolute top-[17px] h-[2px] rounded-full bg-paddy-700 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ left: 0, width: `${thumbPct}%` }}
          />
        )}

        {/* stops */}
        {STOPS.map((w, i) => {
          const isActive = activeIdx >= 0 && i <= activeIdx;
          const isExact = i === activeIdx;
          const left = pct(i);
          return (
            <div
              key={w}
              className="absolute -translate-x-1/2"
              style={{ left: `${left}%`, top: 0 }}
            >
              <button
                type="button"
                onClick={(e) => { 
                  if (isDragRef.current) {
                    e.preventDefault();
                    return;
                  }
                  onChange(w); 
                  setCustomOpen(false); 
                }}
                className="flex cursor-pointer flex-col items-center"
              >
                <span
                  className={cn(
                    "mb-[3px] block text-[0.6rem] font-bold tabular-nums leading-none transition-colors duration-200",
                    isExact ? "text-paddy-800" : isActive ? "text-paddy-700/50" : "text-husk/30",
                  )}
                >
                  {w}<span className="text-[0.45rem] font-semibold">kg</span>
                </span>
                <span
                  className={cn(
                    "block rounded-full transition-all duration-300",
                    isExact
                      ? "h-3 w-3 border-[2.5px] border-paddy-700 bg-white shadow-[0_0_6px_rgba(45,64,32,0.35)]"
                      : isActive
                        ? "h-[9px] w-[9px] bg-paddy-700"
                        : "h-[9px] w-[9px] bg-husk/18",
                  )}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Custom weight (below track) ── */}
      <div className="mt-1">
        {customOpen ? (
          <div className="flex items-center gap-1.5 animate-[rise_0.15s_ease]">
            <input
              ref={inputRef}
              type="number"
              min={1}
              max={100}
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyCustom();
                if (e.key === "Escape") setCustomOpen(false);
              }}
              placeholder="Enter weight in kg"
              className="h-7 w-full rounded-lg border border-paddy-600/30 bg-paddy-800/5 px-2.5 text-xs font-semibold text-paddy-800 outline-none transition focus:border-paddy-600 focus:ring-1 focus:ring-paddy-500/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={applyCustom}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-paddy-800 text-rice-50 hover:bg-paddy-700"
            >
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden>
                <path d="m4 8.5 3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setCustomOpen(false)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-husk/15 text-husk/40 hover:text-husk"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { setCustomOpen(true); setCustomVal(isPreset ? "" : String(value)); }}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-lg border py-1 text-[0.6rem] font-bold uppercase tracking-wider transition-all duration-200",
              !isPreset
                ? "border-paddy-700 bg-paddy-800 text-rice-50"
                : "border-husk/10 text-husk/35 hover:border-paddy-500/30 hover:text-paddy-700",
            )}
          >
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden>
              <path d="M1 9.5 8.5 2l2 2L3 11.5H1V9.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            {!isPreset ? `Custom: ${value}kg` : "Custom weight"}
          </button>
        )}
      </div>
    </div>
  );
}
