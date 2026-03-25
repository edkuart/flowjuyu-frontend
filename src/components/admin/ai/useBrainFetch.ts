"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

// AI analytics endpoints perform heavy file operations and database aggregations.
// 20 s gives slow/cold backend instances room to respond without a false timeout.
const TIMEOUT_MS = 20_000;

const IS_DEV = process.env.NODE_ENV === "development";

// ── Debug logger (dev-only, no-op in production) ───────────────────────────────

function dbg(...args: unknown[]): void {
  if (IS_DEV) console.debug("[AI fetch]", ...args);
}

// ── Metadata key set ───────────────────────────────────────────────────────────
// Keys that are envelope/meta fields and should never be treated as data payloads.

const META_KEYS = new Set([
  "ok", "message", "status", "timestamp", "error", "code",
  "errors", "success", "statusCode", "generated_at", "evaluated_at",
]);

// ── Response normalizer ────────────────────────────────────────────────────────
//
// Handles every shape the backend may return:
//   • raw array:             []
//   • {ok, [pick]: ...}:     { ok: true, intelligence: {...} }
//   • {[pick]: ...} no ok:   { tasks: [...] }
//   • {data: ...}:           { data: [...] }
//   • {items: ...}:          { items: [...] }
//   • ok:true, single key:   { ok: true, supervisor: {...} }
//   • full object is data:   { agents: [...], evaluated_at: "..." }
//
// Guarantee: a response that contains ONLY metadata keys (e.g. { ok: true })
// returns null instead of a useless object. Callers should treat null as
// "no data" rather than an unexpected shape.
//
function normalize<T>(body: unknown, pick: string): T | null {
  // ── 1. Direct array — return as-is
  if (Array.isArray(body)) return body as T;

  // ── 2. Must be an object from here on
  if (body === null || typeof body !== "object") return body as T;

  const obj = body as Record<string, unknown>;

  // ── 3. Explicit server-side error flag
  if (obj.ok === false) {
    throw new Error(String(obj.message ?? "Server returned an error"));
  }

  // ── 4. Named pick key — highest priority (the intended API contract)
  //    Only skip if the value is strictly undefined; null means "no data"
  if (pick && obj[pick] !== undefined) return obj[pick] as T;

  // ── 5. Common data-envelope keys — only when the value is an array or
  //    a non-trivial object (prevent picking a scalar like a count or flag)
  for (const k of ["data", "items", "results", "payload"]) {
    const v = obj[k];
    if (v === undefined) continue;
    if (Array.isArray(v))                    return v as T;
    if (v !== null && typeof v === "object") return v as T;
    // scalar under an envelope key — not the payload, keep looking
  }

  // ── 6. ok:true but the pick key was absent — try the first non-metadata key
  if (obj.ok === true) {
    const key = Object.keys(obj).find((k) => !META_KEYS.has(k));
    if (key !== undefined) return obj[key] as T;
    // All keys are metadata — success-ack with no payload
    return null;
  }

  // ── 7. Last resort: the body itself may be the data shape
  //    (e.g. { agents: [...], evaluated_at: "..." } for SupervisorData)
  //    Reject if every key is a metadata key — no real payload present.
  const allMeta = Object.keys(obj).every((k) => META_KEYS.has(k));
  if (allMeta) return null;

  return body as T;
}

// ── Error classification ───────────────────────────────────────────────────────

export type BrainFetchErrorKind =
  | "timeout"   // request exceeded TIMEOUT_MS — safe to retry
  | "auth"      // 401/403 — retrying without re-login won't help
  | "server"    // 5xx or bad JSON — may be transient
  | "network"   // fetch() threw before a response was received
  | "unknown";

export interface BrainFetchError {
  kind:      BrainFetchErrorKind;
  message:   string;
  retryable: boolean;
}

function classifyError(err: unknown, path: string, timedOut: boolean): BrainFetchError {
  if (timedOut || (err instanceof DOMException && err.name === "AbortError")) {
    return {
      kind:      "timeout",
      message:   `Request timed out after ${TIMEOUT_MS / 1_000} s. The AI analytics endpoint may be busy — please retry.`,
      retryable: true,
    };
  }
  if (err instanceof Error) {
    const msg = err.message;

    if (msg.startsWith("HTTP 401") || msg.startsWith("HTTP 403") || msg.includes("No auth token")) {
      return { kind: "auth", message: msg, retryable: false };
    }
    if (/^HTTP 5\d\d/.test(msg)) {
      return { kind: "server", message: msg, retryable: true };
    }
    if (msg.startsWith("HTTP ")) {
      return { kind: "server", message: msg, retryable: true };
    }
    // fetch() network errors (offline, DNS failure, etc.)
    if (msg === "Failed to fetch" || msg.includes("NetworkError") || msg.includes("network")) {
      return { kind: "network", message: `Network error fetching ${path} — check your connection.`, retryable: true };
    }

    return { kind: "unknown", message: msg, retryable: true };
  }
  return { kind: "unknown", message: "An unexpected error occurred.", retryable: true };
}

// ── Loading message ────────────────────────────────────────────────────────────

const LOADING_LABELS: Record<string, string> = {
  "/api/admin/ai/intelligence":  "Fetching marketplace intelligence…",
  "/api/admin/ai/opportunities": "Analyzing growth opportunities…",
  "/api/admin/ai/sellers":       "Loading seller analytics…",
  "/api/admin/ai/risks":         "Running risk evaluation…",
  "/api/admin/ai/decisions":     "Fetching AI decisions…",
  "/api/admin/ai/agents":        "Checking agent status…",
  "/api/admin/ai/tasks":         "Loading task queue…",
  "/api/admin/ai/reports":       "Fetching AI reports…",
  "/api/admin/ai/telemetry":     "Loading telemetry data…",
};

function loadingLabel(path: string): string {
  return LOADING_LABELS[path] ?? "Fetching AI insights…";
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface UseBrainFetchResult<T> {
  data:          T | null;
  loading:       boolean;
  /** Short human-readable description shown while loading, e.g. "Fetching AI insights…" */
  loadingLabel:  string;
  /** Structured error — null when no error. Use `.message` for display, `.retryable` to show retry button. */
  fetchError:    BrainFetchError | null;
  /** Convenience: `fetchError?.message ?? null` — for components that only need the string */
  error:         string | null;
  /** True when the request was aborted by the timeout guard */
  timedOut:      boolean;
  /** Number of times refetch() has been called since last success */
  retries:       number;
  refetch:       () => void;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

/**
 * Generic hook for fetching a brain endpoint.
 *
 * @param path  e.g. "/api/admin/ai/intelligence"
 * @param pick  key to extract from the JSON body (e.g. "intelligence")
 *
 * Features:
 *  - 20 s AbortController timeout (increased from 8 s for heavy AI endpoints)
 *  - Structured BrainFetchError with `.retryable` flag — no component crashes on timeout
 *  - Parallel-safe: each call is independent; use Promise.allSettled in one-shot fetches
 *  - Dev-only console.debug with request URL and response time
 *  - Normalizes all API response shapes: [], {data}, {[pick]}, {items}, {ok:true, key}
 *  - Metadata-only responses ({ok:true}) return null instead of a useless object
 */
export function useBrainFetch<T>(
  path: string,
  pick: string,
): UseBrainFetchResult<T> {
  const [data,       setData]       = useState<T | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState<BrainFetchError | null>(null);
  const [timedOut,   setTimedOut]   = useState(false);
  const [retries,    setRetries]    = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch_ = useCallback(async () => {
    // Cancel any previous in-flight request and timer
    abortRef.current?.abort();
    if (timerRef.current) clearTimeout(timerRef.current);

    const controller = new AbortController();
    abortRef.current = controller;

    // Soft timeout — sets timedOut and aborts, but component shows retry UI
    let didTimeout = false;
    timerRef.current = setTimeout(() => {
      didTimeout = true;
      controller.abort("timeout");
      setTimedOut(true);
      dbg(`timeout after ${TIMEOUT_MS / 1_000}s —`, path);
    }, TIMEOUT_MS);

    setLoading(true);
    setFetchError(null);
    setTimedOut(false);

    const startMs = performance.now();

    try {
      const url   = `${API_BASE}${path}`;
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token — please log in again.");

      dbg("request →", url);

      const res = await fetch(url, {
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      const elapsed = Math.round(performance.now() - startMs);
      dbg(`response ← ${res.status} (${elapsed} ms)`, url);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const msg  = text.length < 300 ? text.trim() : "";
        throw new Error(
          msg
            ? `HTTP ${res.status}: ${msg}`
            : `Request to ${path} failed with status ${res.status}`,
        );
      }

      const body       = await res.json();
      const normalized = normalize<T>(body, pick);
      setData(normalized ?? null);
      setRetries(0);
    } catch (err: unknown) {
      // Ignore abort errors from unmount — the component is gone
      if (
        err instanceof DOMException &&
        err.name === "AbortError" &&
        !didTimeout
      ) {
        return;
      }

      const structured = classifyError(err, path, didTimeout);
      setFetchError(structured);

      if (structured.kind === "timeout") setTimedOut(true);

      dbg("error —", structured.kind, structured.message);
    } finally {
      if (timerRef.current) clearTimeout(timerRef.current);
      setLoading(false);
    }
  }, [path, pick]);

  const refetch = useCallback(() => {
    setRetries((n) => n + 1);
    fetch_();
  }, [fetch_]);

  useEffect(() => {
    fetch_();
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetch_]);

  return {
    data,
    loading,
    loadingLabel:  loadingLabel(path),
    fetchError,
    error:         fetchError?.message ?? null,
    timedOut,
    retries,
    refetch,
  };
}

// ── One-shot parallel fetch utility ───────────────────────────────────────────
//
// Use this for components that need multiple endpoints in a single async call
// (e.g. server actions, route handlers, or custom hooks that compose results).
//
// Unlike Promise.all(), Promise.allSettled() guarantees that one failing
// endpoint does not abort the others. Rejected results are returned as
// { status: "rejected", reason: BrainFetchError } and should be treated as
// empty/null data rather than a full panel crash.
//

export interface ParallelResult<T> {
  data:       T | null;
  fetchError: BrainFetchError | null;
}

/**
 * Fetch multiple AI endpoints in parallel. One failure does not prevent the
 * others from resolving. Always returns an array of the same length as `requests`.
 *
 * @example
 * const [intel, risks] = await fetchAllSettled([
 *   { path: "/api/admin/ai/intelligence", pick: "intelligence" },
 *   { path: "/api/admin/ai/risks",        pick: "risks" },
 * ]);
 */
export async function fetchAllSettled<T = unknown>(
  requests: { path: string; pick: string }[],
): Promise<ParallelResult<T>[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const promises = requests.map(async ({ path, pick }): Promise<ParallelResult<T>> => {
    const url       = `${API_BASE}${path}`;
    const startMs   = performance.now();
    const controller = new AbortController();

    const timer = setTimeout(() => controller.abort("timeout"), TIMEOUT_MS);

    try {
      if (!token) throw new Error("No auth token — please log in again.");

      dbg("parallel request →", url);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        signal:  controller.signal,
      });

      clearTimeout(timer);
      dbg(`parallel response ← ${res.status} (${Math.round(performance.now() - startMs)} ms)`, url);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const msg  = text.length < 300 ? text.trim() : "";
        throw new Error(msg ? `HTTP ${res.status}: ${msg}` : `HTTP ${res.status}`);
      }

      const body = await res.json();
      return { data: normalize<T>(body, pick) ?? null, fetchError: null };
    } catch (err) {
      clearTimeout(timer);
      const isTimeout = controller.signal.aborted;
      const fe        = classifyError(err, path, isTimeout);
      dbg("parallel error —", fe.kind, path);
      return { data: null, fetchError: fe };
    }
  });

  const settled = await Promise.allSettled(promises);

  return settled.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { data: null, fetchError: { kind: "unknown", message: String(r.reason), retryable: true } },
  );
}
