"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

// ── Types ──────────────────────────────────────────────────────────────────────

type QueueEntry = {
  product_id:     string;
  content_type:   string;
  priority_score: number;
  reason:         string;
  can_generate:   boolean;
  block_reason?:  string;
  factors?: {
    content_gap:             number;
    product_potential:       number;
    performance_opportunity: number;
    recency_decay:           number;
    diversity_factor:        number;
  };
};

type Budget = {
  used:      number;
  limit:     number;
  remaining: number;
};

type OptimizationData = {
  queue:  QueueEntry[];
  budget: Budget;
  total:  number;
};

// Lightweight product info we fetch once for name resolution
type ProductInfo = {
  nombre: string;
  codigo?: string;
  code?:   string;
};

// Per-item generation result stored in state
type ItemGenResult = {
  ok:      boolean;
  code:    string;
  variant_id?: string;
  generation_score?: number;
  queue_flag?: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s >= 0.7) return "text-green-600 dark:text-green-400";
  if (s >= 0.4) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

function Spinner({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
    </svg>
  );
}

function BudgetBar({ budget }: { budget: Budget }) {
  const pct      = budget.limit > 0 ? Math.round((budget.used / budget.limit) * 100) : 0;
  const barColor = pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-yellow-400" : "bg-green-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Daily budget</span>
        <span>
          {budget.used}/{budget.limit} used ·{" "}
          <span className="text-foreground font-medium">{budget.remaining} remaining</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Inline result pill shown after per-item generation
function ResultPill({ result }: { result: ItemGenResult }) {
  if (result.ok) {
    const score = result.generation_score != null
      ? ` · ${(result.generation_score * 100).toFixed(0)}`
      : "";
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 font-medium whitespace-nowrap">
        ✓ queued{score}
      </span>
    );
  }

  const label =
    result.code === "COOLDOWN_ACTIVE"    ? "cooldown"    :
    result.code === "GUARDRAIL_FAILED"   ? "guardrail"   :
    result.code === "BELOW_THRESHOLD"    ? "low score"   :
    result.code === "GENERATION_FAILED"  ? "gen failed"  :
    result.code === "BUDGET_EXHAUSTED"   ? "budget limit":
    result.code.toLowerCase().replace(/_/g, " ");

  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 font-medium whitespace-nowrap">
      {label}
    </span>
  );
}

// ── Queue entry row ────────────────────────────────────────────────────────────

function QueueRow({
  entry,
  productName,
  productCode,
  onGenerate,
  generating,
  result,
}: {
  entry:       QueueEntry;
  productName: string | null;
  productCode: string | null;
  onGenerate:  () => void;
  generating:  boolean;
  result:      ItemGenResult | null;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-md border text-sm transition-opacity ${
        entry.can_generate
          ? "bg-muted/20 border-border"
          : "bg-muted/5 border-border/40 opacity-50"
      }`}
    >
      {/* Priority score */}
      <span
        className={`text-base font-bold tabular-nums leading-none mt-0.5 w-7 shrink-0 ${scoreColor(entry.priority_score)}`}
      >
        {Math.round(entry.priority_score * 100)}
      </span>

      {/* Product + type info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Human-readable name */}
          <span className="font-medium truncate">
            {productName ?? (
              <span className="font-mono text-muted-foreground text-xs">
                {entry.product_id.slice(0, 8)}…
              </span>
            )}
          </span>
          {productCode && (
            <span className="text-xs text-muted-foreground font-mono">{productCode}</span>
          )}
          <Badge variant="outline" className="text-xs capitalize">
            {entry.content_type.replace(/_/g, " ")}
          </Badge>
          {!entry.can_generate && entry.block_reason && (
            <Badge
              variant="secondary"
              className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300 border-0"
            >
              {entry.block_reason}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{entry.reason}</p>
      </div>

      {/* Mini factor sparkline */}
      {entry.factors && (
        <div
          className="hidden md:flex items-end gap-0.5 h-5 shrink-0"
          title="Priority factors (gap · potential · opportunity · recency · diversity)"
        >
          {Object.values(entry.factors).map((val, fi) => (
            <div
              key={fi}
              className="w-1.5 rounded-sm bg-primary/40"
              style={{ height: `${Math.max(15, Math.round(val * 100))}%` }}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {result && <ResultPill result={result} />}

        {entry.can_generate && !result && (
          <button
            onClick={onGenerate}
            disabled={generating}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-foreground/20 hover:bg-foreground hover:text-background disabled:opacity-40 transition-colors font-medium"
          >
            {generating ? <Spinner /> : null}
            {generating ? "…" : "Generate"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AIContentPriorityQueue() {
  const [data,         setData]         = useState<OptimizationData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [running,      setRunning]      = useState(false);
  const [runMessage,   setRunMessage]   = useState<string | null>(null);

  // Product name cache: product_id → ProductInfo
  const [productNames, setProductNames] = useState<Record<string, ProductInfo>>({});
  const fetchingNamesRef = useRef<Set<string>>(new Set());

  // Per-item generation: key = `${product_id}::${content_type}`
  const [generatingKey, setGeneratingKey] = useState<string | null>(null);
  const [itemResults,   setItemResults]   = useState<Record<string, ItemGenResult>>({});

  // ── Data fetch ─────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE}/api/admin/ai/content/optimization`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const body = await res.json();
      if (body.ok) {
        setData({ queue: body.queue ?? [], budget: body.budget, total: body.total ?? 0 });
      }
    } catch (err) {
      console.error("[AIContentPriorityQueue]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Resolve product names in background ───────────────────────────────────
  // Batch fetch: once we have queue data, fetch any unknown product names.
  // We fetch individual product detail endpoints to get nombre + codigo.

  useEffect(() => {
    if (!data) return;
    const unknown = data.queue
      .map((e) => e.product_id)
      .filter((id) => !productNames[id] && !fetchingNamesRef.current.has(id));

    if (unknown.length === 0) return;

    unknown.forEach((id) => fetchingNamesRef.current.add(id));

    const token = localStorage.getItem("token");

    Promise.allSettled(
      unknown.map((id) =>
        fetch(`${API_BASE}/api/admin/products/${id}`, {
          headers: { Authorization: `Bearer ${token ?? ""}` },
        })
          .then((r) => r.json())
          .then((body) => {
            const p = body.product ?? body.data ?? body;
            return { id, info: { nombre: p.nombre, codigo: p.codigo ?? p.code } as ProductInfo };
          })
          .catch(() => ({ id, info: null })),
      ),
    ).then((results) => {
      const resolved: Record<string, ProductInfo> = {};
      for (const r of results) {
        if (r.status === "fulfilled" && r.value.info?.nombre) {
          resolved[r.value.id] = r.value.info;
        }
      }
      if (Object.keys(resolved).length > 0) {
        setProductNames((prev) => ({ ...prev, ...resolved }));
      }
    });
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Batch run ──────────────────────────────────────────────────────────────

  const handleRunBatch = useCallback(async () => {
    setRunning(true);
    setRunMessage(null);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE}/api/admin/ai/content/optimization/run`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token ?? ""}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ limit: 3 }),
      });
      const body = await res.json();
      setRunMessage(
        body.ok
          ? `✓ Queued ${body.queued}/${body.triggered} for review`
          : (body.message ?? body.code ?? "Run failed"),
      );
      await fetchData();
    } catch (err: any) {
      setRunMessage(err.message ?? "Run failed");
    } finally {
      setRunning(false);
    }
  }, [fetchData]);

  // ── Per-item generate ──────────────────────────────────────────────────────

  const handleItemGenerate = useCallback(async (entry: QueueEntry) => {
    const key = `${entry.product_id}::${entry.content_type}`;
    setGeneratingKey(key);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE}/api/admin/ai/content/generate`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token ?? ""}`, "Content-Type": "application/json" },
        body:    JSON.stringify({
          subject_type: "product",
          subject_id:   entry.product_id,
          content_type: entry.content_type,
        }),
      });
      const body = await res.json();
      setItemResults((prev) => ({
        ...prev,
        [key]: {
          ok:               body.ok,
          code:             body.code,
          variant_id:       body.variant_id,
          generation_score: body.scores?.generation_score ?? body.generation_score,
          queue_flag:       body.queue_flag,
        },
      }));
      // Refresh queue so budget and can_generate update
      await fetchData();
    } catch (err: any) {
      setItemResults((prev) => ({
        ...prev,
        [key]: { ok: false, code: "FETCH_ERROR" },
      }));
    } finally {
      setGeneratingKey(null);
    }
  }, [fetchData]);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading && !data) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-2 w-full rounded-full" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}
      </div>
    );
  }

  const queue  = data?.queue  ?? [];
  const budget = data?.budget ?? { used: 0, limit: 10, remaining: 10 };

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold">Generation Queue</h3>
          <p className="text-xs text-muted-foreground">
            {queue.length} items · {queue.filter((e) => e.can_generate).length} eligible
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {runMessage && (
            <span className="text-xs text-muted-foreground">{runMessage}</span>
          )}
          <button
            onClick={handleRunBatch}
            disabled={running || budget.remaining === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-foreground text-background font-medium hover:opacity-80 disabled:opacity-40 transition-opacity"
          >
            {running && <Spinner />}
            {running ? "Running…" : "Run Batch (3)"}
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3 py-1.5 text-xs rounded border hover:bg-muted transition-colors disabled:opacity-40"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Budget bar */}
      <BudgetBar budget={budget} />

      {/* Queue list */}
      {queue.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No items in priority queue.</p>
      ) : (
        <div className="space-y-2">
          {queue.slice(0, 12).map((entry, i) => {
            const key      = `${entry.product_id}::${entry.content_type}`;
            const info     = productNames[entry.product_id];
            return (
              <QueueRow
                key={`${entry.product_id}-${entry.content_type}-${i}`}
                entry={entry}
                productName={info?.nombre ?? null}
                productCode={info?.codigo ?? info?.code ?? null}
                onGenerate={() => handleItemGenerate(entry)}
                generating={generatingKey === key}
                result={itemResults[key] ?? null}
              />
            );
          })}

          {queue.length > 12 && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              +{queue.length - 12} more items
            </p>
          )}
        </div>
      )}
    </div>
  );
}
