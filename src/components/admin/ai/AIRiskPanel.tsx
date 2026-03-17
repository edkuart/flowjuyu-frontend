"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge }    from "@/components/ui/badge";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type Severity = "low" | "medium" | "high" | "critical";

type Risk = {
  type:        string;
  severity:    Severity;
  description: string;
  seller_id?:  number | null;
  product_id?: string | null;
  count?:      number;
};

type RiskData = {
  risks:         Risk[];
  tasks_created: number;
  evaluated_at:  string;
};

// ── Severity config ────────────────────────────────────────────────────────────

const SEV: Record<Severity, {
  label:  string;
  row:    string;
  badge:  string;
  icon:   string;
  dot:    string;
}> = {
  critical: {
    label: "Critical",
    row:   "border-l-4 border-red-500 bg-red-50/60 dark:bg-red-950/25",
    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0",
    icon:  "🔴",
    dot:   "bg-red-500",
  },
  high: {
    label: "High",
    row:   "border-l-4 border-orange-500 bg-orange-50/60 dark:bg-orange-950/25",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 border-0",
    icon:  "🟠",
    dot:   "bg-orange-500",
  },
  medium: {
    label: "Medium",
    row:   "border-l-4 border-yellow-400 bg-yellow-50/60 dark:bg-yellow-950/25",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0",
    icon:  "🟡",
    dot:   "bg-yellow-400",
  },
  low: {
    label: "Low",
    row:   "border-l-4 border-blue-300 bg-blue-50/40 dark:bg-blue-950/20",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0",
    icon:  "🔵",
    dot:   "bg-blue-400",
  },
};

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AIRiskPanel() {
  const { data, loading, error, refetch } =
    useBrainFetch<RiskData>("/api/admin/ai/risks", "risks");

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-36" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold">Risk Detection</p>
        <p className="text-xs text-red-500">{error ?? "No data available."}</p>
        <button onClick={refetch} className="text-xs px-3 py-1 rounded border hover:bg-muted transition-colors">
          Retry
        </button>
      </div>
    );
  }

  // Sort: critical → high → medium → low
  const ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...data.risks].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

  const critCount   = data.risks.filter((r) => r.severity === "critical").length;
  const highCount   = data.risks.filter((r) => r.severity === "high").length;
  const medCount    = data.risks.filter((r) => r.severity === "medium").length;
  const lowCount    = data.risks.filter((r) => r.severity === "low").length;
  const urgentCount = critCount + highCount;

  return (
    <div className="bg-card border rounded-lg overflow-hidden">

      {/* Security alert header bar */}
      <div className={`px-4 py-3 flex items-center justify-between gap-3 flex-wrap ${
        critCount > 0
          ? "bg-red-600 text-white"
          : urgentCount > 0
          ? "bg-orange-500 text-white"
          : "bg-card border-b"
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">
            {critCount > 0 ? "⚠ Security Alerts" : urgentCount > 0 ? "⚠ Risk Warnings" : "Risk Detection"}
          </span>
          {data.risks.length === 0 && (
            <span className="text-xs opacity-80">No issues found</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {critCount > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20">
              {critCount} critical
            </span>
          )}
          {highCount > 0 && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${critCount > 0 ? "bg-white/20" : "bg-orange-100 text-orange-700"}`}>
              {highCount} high
            </span>
          )}
          {medCount > 0 && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgentCount > 0 ? "bg-white/20" : "bg-yellow-100 text-yellow-700"}`}>
              {medCount} medium
            </span>
          )}
          {lowCount > 0 && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgentCount > 0 ? "bg-white/20" : "bg-blue-100 text-blue-700"}`}>
              {lowCount} low
            </span>
          )}
          {data.tasks_created > 0 && (
            <span className={`text-xs ${urgentCount > 0 ? "opacity-80" : "text-muted-foreground"}`}>
              {data.tasks_created} task{data.tasks_created > 1 ? "s" : ""} auto-created
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">

        {/* All clear */}
        {data.risks.length === 0 && (
          <div className="flex items-center gap-2 p-3 rounded-md border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
            <span className="text-green-600 font-bold text-lg">✓</span>
            <p className="text-sm text-green-700 dark:text-green-400">No marketplace risks detected</p>
          </div>
        )}

        {/* Risk list */}
        <ul className="space-y-2">
          {sorted.map((risk, i) => {
            const s = SEV[risk.severity];
            return (
              <li key={i} className={`flex items-start gap-3 p-3 rounded-md ${s.row}`}>
                <span className="text-base leading-none mt-0.5 shrink-0">{s.icon}</span>
                <div className="flex-1 min-w-0 space-y-1">
                  {/* Severity + type + count */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs ${s.badge}`}>{s.label}</Badge>
                    <span className="text-xs font-semibold">
                      {risk.type.replace(/_/g, " ")}
                    </span>
                    {risk.count !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {risk.count} affected
                      </span>
                    )}
                  </div>
                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {risk.description}
                  </p>
                  {/* IDs */}
                  {(risk.seller_id != null || risk.product_id != null) && (
                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      {risk.seller_id != null && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          Seller #{risk.seller_id}
                        </span>
                      )}
                      {risk.product_id != null && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          Product {risk.product_id}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-right pt-1">
          Evaluated at {new Date(data.evaluated_at).toLocaleTimeString()}
        </p>

      </div>
    </div>
  );
}
