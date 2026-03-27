// src/lib/perfStore.ts
// Phase 2 — in-memory structured performance store. No persistence, no DB.

export type PerfEntry = {
  type:      "navigation" | "api";
  name:      string;   // page name or endpoint path
  duration:  number;   // milliseconds (float)
  timestamp: number;   // Date.now()
};

const MAX_ENTRIES = 100;

// Module-level singleton — survives across re-renders, cleared on hard refresh.
const _entries: PerfEntry[] = [];

export function addPerfEntry(entry: PerfEntry): void {
  _entries.push(entry);
  // FIFO: drop oldest when over the cap
  if (_entries.length > MAX_ENTRIES) {
    _entries.splice(0, _entries.length - MAX_ENTRIES);
  }
}

export function getPerfEntries(): ReadonlyArray<PerfEntry> {
  return _entries;
}

export function clearPerfEntries(): void {
  _entries.splice(0, _entries.length);
}
