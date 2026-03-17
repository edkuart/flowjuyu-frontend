"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge }    from "@/components/ui/badge";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type AiDecision = {
  date:          string;
  decision_type: string;
  explanation:   string;
  related_data?: unknown;
};

// ── Type color map ──────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  growth_opportunity: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  risk_mitigation:    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  seller_action:      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  category_insight:   "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
};

const TYPE_DOT: Record<string, string> = {
  growth_opportunity: "bg-green-500",
  risk_mitigation:    "bg-red-500",
  seller_action:      "bg-blue-500",
  category_insight:   "bg-violet-500",
};

function typeColor(type: string): string {
  return TYPE_COLOR[type] ?? "bg-muted text-muted-foreground";
}

function typeDot(type: string): string {
  return TYPE_DOT[type] ?? "bg-muted-foreground";
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AIDecisionsPanel() {
  const { data, loading, error, refetch } =
    useBrainFetch<AiDecision[]>("/api/admin/ai/decisions", "decisions");

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-3 h-3 rounded-full mt-1 shrink-0" />
              <Skeleton className="flex-1 h-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold">AI Decision Memory</p>
        <p className="text-xs text-red-500">{error ?? "No data available."}</p>
        <button onClick={refetch} className="text-xs px-3 py-1 rounded border hover:bg-muted transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const decisions = Array.isArray(data) ? data : [];

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">AI Decision Memory</h2>
        <Badge variant="secondary">{decisions.length} records</Badge>
      </div>

      {/* Empty */}
      {decisions.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No AI decisions recorded yet. Run the brain cycle to generate insights.
        </p>
      )}

      {/* Timeline */}
      <div className="max-h-80 overflow-y-auto pr-1">
        <ol className="relative space-y-0">
          {decisions.map((d, i) => {
            const dot  = typeDot(d.decision_type);
            const last = i === decisions.length - 1;

            return (
              <li key={i} className="flex gap-3">
                {/* Timeline spine */}
                <div className="flex flex-col items-center">
                  <span className={`w-3 h-3 rounded-full shrink-0 mt-1 ring-2 ring-background ${dot}`} />
                  {!last && <div className="w-px flex-1 bg-border mt-1 mb-0" />}
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 space-y-1 ${last ? "pb-0" : "pb-4"}`}>
                  {/* Type + date */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 ${typeColor(d.decision_type)}`}
                    >
                      {d.decision_type.replace(/_/g, " ")}
                    </span>
                    <time className="text-xs text-muted-foreground">
                      {new Date(d.date).toLocaleDateString(undefined, {
                        month: "short",
                        day:   "numeric",
                        year:  "numeric",
                      })}
                      {" · "}
                      {new Date(d.date).toLocaleTimeString(undefined, {
                        hour:   "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>

                  {/* Explanation */}
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {d.explanation}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

    </div>
  );
}
