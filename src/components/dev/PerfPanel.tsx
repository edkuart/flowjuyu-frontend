"use client";

// src/components/dev/PerfPanel.tsx
// Phase 2 dev-only diagnostic panel. Rendered only when NEXT_PUBLIC_ENABLE_PERF_LOGS=true.

import { useCallback, useEffect, useReducer, useState } from "react";
import { getPerfEntries, clearPerfEntries, type PerfEntry } from "@/lib/perfStore";

const ENABLED = process.env.NEXT_PUBLIC_ENABLE_PERF_LOGS === "true";

export default function PerfPanel() {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const [open, setOpen] = useState(true);

  // Re-render every second so the list stays fresh
  useEffect(() => {
    if (!ENABLED) return;
    const id = setInterval(forceRender, 1000);
    return () => clearInterval(id);
  }, []);

  if (!ENABLED) return null;

  const entries = getPerfEntries();
  const recent  = [...entries].reverse().slice(0, 10);

  const handleClear = useCallback(() => {
    clearPerfEntries();
    forceRender();
  }, []);

  return (
    <div
      style={{ zIndex: 9999 }}
      className="fixed bottom-4 right-4 w-72 font-mono text-[11px] shadow-2xl rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950/95 text-zinc-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-800 border-b border-zinc-700">
        <span className="font-semibold tracking-wide text-zinc-100">⚡ Perf</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            {open ? "▾" : "▴"}
          </button>
        </div>
      </div>

      {/* Entry list */}
      {open && (
        <ul className="divide-y divide-zinc-800 max-h-72 overflow-y-auto">
          {recent.length === 0 ? (
            <li className="px-3 py-3 text-zinc-500">No entries yet</li>
          ) : (
            recent.map((e: PerfEntry, i) => (
              <li key={i} className="flex items-start justify-between gap-2 px-3 py-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`shrink-0 ${e.type === "navigation" ? "text-yellow-400" : "text-sky-400"}`}>
                    {e.type === "navigation" ? "⏱" : "🌐"}
                  </span>
                  <span className="truncate text-zinc-300">{e.name}</span>
                </div>
                <span className={`shrink-0 tabular-nums ${
                  e.duration > 1000 ? "text-red-400" :
                  e.duration > 300  ? "text-yellow-400" :
                  "text-green-400"
                }`}>
                  {e.duration.toFixed(0)}ms
                </span>
              </li>
            ))
          )}
        </ul>
      )}

      {/* Footer: total entry count */}
      {open && (
        <div className="px-3 py-1.5 bg-zinc-900 border-t border-zinc-800 text-zinc-500">
          {entries.length} total entries stored
        </div>
      )}
    </div>
  );
}
