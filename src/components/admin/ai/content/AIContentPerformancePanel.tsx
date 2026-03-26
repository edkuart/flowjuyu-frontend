"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

// ── Types ──────────────────────────────────────────────────────────────────────

type ContentTypeStat = {
  content_type:   string;
  total_variants: number;
  approved_count: number;
  rejected_count: number;
  avg_score:      number | null;
  edit_rate:      number | null;
};

type ItemRecommendation = {
  content_item_id: string;
  subject_id:      string;
  content_type:    string;
  recommendation:  "repeat" | "stop" | "explore" | "no_data";
  reason:          string;
  avg_score:       number | null;
};

type RejectionPattern = {
  rejection_reason: string;
  count:            number;
  content_type:     string;
};

type Performer = {
  variant_id:       string;
  content_type:     string;
  generation_score: number;
  template_id:      string;
};

type LearningReport = {
  content_type_stats:  ContentTypeStat[];
  item_recommendations: ItemRecommendation[];
  rejection_patterns:  RejectionPattern[];
  edit_rate:           number | null;
  top_performers:      Performer[];
  worst_performers:    Performer[];
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function pct(n: number | null): string {
  return n == null ? "—" : `${(n * 100).toFixed(0)}%`;
}

function scoreColor(s: number | null): string {
  if (s == null) return "text-muted-foreground";
  if (s >= 0.7)  return "text-green-600 dark:text-green-400";
  if (s >= 0.5)  return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

const RECOMMEND_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  repeat:  { bg: "bg-green-100 dark:bg-green-900/40",  text: "text-green-700 dark:text-green-300",  label: "repeat"  },
  explore: { bg: "bg-blue-100 dark:bg-blue-900/40",    text: "text-blue-700 dark:text-blue-300",    label: "explore" },
  stop:    { bg: "bg-red-100 dark:bg-red-900/40",      text: "text-red-700 dark:text-red-300",      label: "stop"    },
  no_data: { bg: "bg-muted",                           text: "text-muted-foreground",               label: "no data" },
};

// ── Sub-sections ───────────────────────────────────────────────────────────────

function TypeStatsSection({ stats }: { stats: ContentTypeStat[] }) {
  if (stats.length === 0) return <p className="text-xs text-muted-foreground">No data yet.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {stats.map((s) => (
        <div key={s.content_type} className="border rounded-md p-3 space-y-2">
          <p className="text-xs font-medium capitalize">{s.content_type.replace(/_/g, " ")}</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium tabular-nums">{s.total_variants}</span>
            <span className="text-muted-foreground">Approved</span>
            <span className="font-medium tabular-nums">{s.approved_count}</span>
            <span className="text-muted-foreground">Avg score</span>
            <span className={`font-medium tabular-nums ${scoreColor(s.avg_score)}`}>
              {s.avg_score != null ? (s.avg_score * 100).toFixed(1) : "—"}
            </span>
            <span className="text-muted-foreground">Edit rate</span>
            <span className="font-medium tabular-nums">{pct(s.edit_rate)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PerformerList({ label, performers }: { label: string; performers: Performer[] }) {
  if (performers.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="space-y-1.5">
        {performers.slice(0, 5).map((p) => (
          <div key={p.variant_id} className="flex items-center gap-3 text-xs">
            <span className={`font-semibold tabular-nums w-8 ${scoreColor(p.generation_score)}`}>
              {(p.generation_score * 100).toFixed(0)}
            </span>
            <span className="font-mono text-muted-foreground truncate">{p.variant_id.slice(0, 8)}…</span>
            <Badge variant="outline" className="text-xs capitalize ml-auto shrink-0">
              {p.content_type.replace(/_/g, " ")}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AIContentPerformancePanel() {
  const [report,  setReport]  = useState<LearningReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE}/api/admin/ai/content/performance`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const body = await res.json();
      if (body.ok && body.report) setReport(body.report);
    } catch (err) {
      console.error("[AIContentPerformancePanel]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !report) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded" />)}
        </div>
        <Skeleton className="h-20 rounded" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">No performance data yet. Run the nightly rollup to populate this panel.</p>
      </div>
    );
  }

  const rejectionTop = [...(report.rejection_patterns ?? [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="bg-card border rounded-lg p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Performance</h3>
          {report.edit_rate != null && (
            <p className="text-xs text-muted-foreground">
              Overall edit rate: <span className="font-medium text-foreground">{pct(report.edit_rate)}</span>
            </p>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded border hover:bg-muted transition-colors disabled:opacity-40"
        >
          Refresh
        </button>
      </div>

      {/* Content type stats */}
      <TypeStatsSection stats={report.content_type_stats ?? []} />

      {/* Top / worst performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PerformerList label="Top performers (last 7 days)" performers={report.top_performers ?? []} />
        <PerformerList label="Worst performers"             performers={report.worst_performers ?? []} />
      </div>

      {/* Rejection patterns */}
      {rejectionTop.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Top rejection reasons</p>
          <div className="space-y-1.5">
            {rejectionTop.map((r) => (
              <div key={`${r.content_type}-${r.rejection_reason}`} className="flex items-center gap-3 text-xs">
                <span className="font-semibold tabular-nums w-6 text-right text-muted-foreground">{r.count}</span>
                <span className="flex-1 capitalize">{r.rejection_reason.replace(/_/g, " ")}</span>
                <Badge variant="outline" className="text-xs capitalize shrink-0">
                  {r.content_type.replace(/_/g, " ")}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
