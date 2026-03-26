"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

// ── Types ──────────────────────────────────────────────────────────────────────
// Sourced from ContentLearningService.analyzeLast7Days() → item_recommendations

type Recommendation = "repeat" | "stop" | "explore" | "no_data";

type ItemRecommendation = {
  content_item_id: string;
  subject_id:      string;
  content_type:    string;
  recommendation:  Recommendation;
  reason:          string;
  avg_score:       number | null;
};

type ContentTypeStat = {
  content_type:   string;
  total_variants: number;
  approved_count: number;
  rejected_count: number;
  avg_score:      number | null;
  edit_rate:      number | null;
};

type LearningReport = {
  item_recommendations: ItemRecommendation[];
  content_type_stats:   ContentTypeStat[];
  edit_rate:            number | null;
};

// ── Style maps ─────────────────────────────────────────────────────────────────

const DECISION_STYLES: Record<Recommendation, {
  badge: string;
  dot:   string;
  label: string;
}> = {
  repeat:  { badge: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-0",  dot: "bg-green-500",            label: "repeat"  },
  explore: { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-0",      dot: "bg-blue-500",             label: "explore" },
  stop:    { badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-0",          dot: "bg-red-500",              label: "stop"    },
  no_data: { badge: "bg-muted text-muted-foreground border-0",                                        dot: "bg-muted-foreground/50",  label: "no data" },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function scoreColor(s: number | null): string {
  if (s == null) return "text-muted-foreground";
  if (s >= 0.7)  return "text-green-600 dark:text-green-400";
  if (s >= 0.5)  return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

// ── Filter tabs ────────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { value: Recommendation | "all"; label: string }[] = [
  { value: "all",     label: "All"     },
  { value: "repeat",  label: "Repeat"  },
  { value: "explore", label: "Explore" },
  { value: "stop",    label: "Stop"    },
  { value: "no_data", label: "No data" },
];

// ── Main component ─────────────────────────────────────────────────────────────

export default function AIContentDecisionsPanel() {
  const [report,  setReport]  = useState<LearningReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<Recommendation | "all">("all");

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
      console.error("[AIContentDecisionsPanel]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !report) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-full rounded" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
      </div>
    );
  }

  const recommendations = report?.item_recommendations ?? [];

  const filtered = filter === "all"
    ? recommendations
    : recommendations.filter((r) => r.recommendation === filter);

  const counts = recommendations.reduce<Record<string, number>>((acc, r) => {
    acc[r.recommendation] = (acc[r.recommendation] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">Content Decisions</h3>
          <p className="text-xs text-muted-foreground">
            Per-item recommendations from the last 7 days · {recommendations.length} items
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded border hover:bg-muted transition-colors disabled:opacity-40"
        >
          Refresh
        </button>
      </div>

      {/* Summary counts */}
      {recommendations.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {(["repeat", "explore", "stop", "no_data"] as Recommendation[]).map((r) => {
            const n = counts[r] ?? 0;
            if (n === 0) return null;
            const s = DECISION_STYLES[r];
            return (
              <span key={r} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {n} {s.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Filter tabs */}
      {recommendations.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1 text-xs rounded whitespace-nowrap transition-colors ${
                filter === opt.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
              {opt.value !== "all" && counts[opt.value] != null && (
                <span className="ml-1 opacity-70">({counts[opt.value]})</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Decision list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          {recommendations.length === 0
            ? "No recommendations yet. Performance data will be available after the first rollup run."
            : "No items match this filter."}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((rec) => {
            const s = DECISION_STYLES[rec.recommendation];
            return (
              <div
                key={`${rec.content_item_id}`}
                className="flex items-start gap-3 p-3 rounded-md border bg-muted/20 text-sm"
              >
                {/* Decision dot */}
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${s.dot}`} />

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{rec.subject_id.slice(0, 8)}…</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {rec.content_type.replace(/_/g, " ")}
                    </Badge>
                    <Badge className={`text-xs capitalize ${s.badge}`}>
                      {s.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{rec.reason}</p>
                </div>

                {/* Score */}
                {rec.avg_score != null && (
                  <span className={`text-xs font-semibold tabular-nums shrink-0 ${scoreColor(rec.avg_score)}`}>
                    {(rec.avg_score * 100).toFixed(0)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
