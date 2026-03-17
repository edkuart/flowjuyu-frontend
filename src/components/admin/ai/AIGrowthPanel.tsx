"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge }    from "@/components/ui/badge";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type Opportunity = {
  type:          string;
  category?:     string;
  seller?:       string;
  demand_score:  number;
  supply_score:  number;
  suggestion:    string;
};

type GrowthData = {
  opportunities:   Opportunity[];
  report_filename: string | null;
  generated_at:    string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  category_opportunity: { label: "Category Gap",    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  trending_product:     { label: "Trending Product", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  high_growth_seller:   { label: "Growth Seller",    color: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300" },
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.round((value / Math.max(value, 100)) * 100));
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AIGrowthPanel() {
  const { data, loading, error, refetch } =
    useBrainFetch<GrowthData>("/api/admin/ai/opportunities", "growth");

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-44" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold">Growth Opportunities</p>
        <p className="text-xs text-red-500">{error ?? "No data available."}</p>
        <button onClick={refetch} className="text-xs px-3 py-1 rounded border hover:bg-muted transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const ops = data.opportunities;

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold text-sm">Growth Opportunities</h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{ops.length} detected</Badge>
          {data.report_filename && (
            <span className="text-xs text-muted-foreground">{data.report_filename}</span>
          )}
        </div>
      </div>

      {/* Empty */}
      {ops.length === 0 && (
        <p className="text-sm text-muted-foreground">No growth opportunities detected this cycle.</p>
      )}

      {/* Opportunity cards */}
      <div className="space-y-3">
        {ops.map((op, i) => {
          const meta = TYPE_LABELS[op.type] ?? { label: op.type, color: "bg-gray-100 text-gray-700" };
          return (
            <div key={i} className="border rounded-md p-3 space-y-2">

              {/* Title row */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
                    {meta.label}
                  </span>
                  <span className="text-sm font-medium truncate">
                    {op.category ?? op.seller ?? "—"}
                  </span>
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-3">
                <ScoreBar label="Demand" value={op.demand_score} />
                <ScoreBar label="Supply" value={op.supply_score} />
              </div>

              {/* Suggestion */}
              <p className="text-xs text-muted-foreground leading-relaxed">{op.suggestion}</p>

            </div>
          );
        })}
      </div>

    </div>
  );
}
