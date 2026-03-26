"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

// ── Types ──────────────────────────────────────────────────────────────────────

type HealthStatus = "active" | "degraded" | "paused" | "candidate" | "retired";

type Template = {
  id:                    string;
  slug:                  string;
  template_key:          string;
  template_version:      number;
  content_type:          string;
  health_status:         HealthStatus;
  is_active:             boolean;
  sample_count:          number;
  generation_score_avg:  number | null;
  performance_score_avg: number | null;
  rejection_rate:        number | null;
  edit_rate:             number | null;
  paused_at:             string | null;
  pause_reason:          string | null;
  evolution_reason:      string | null;
  expected_improvement:  number | null;
  approved_at:           string | null;
  created_at:            string;
};

type HealthSummary = {
  by_status:       Record<string, number>;
  needs_attention: Array<{
    slug:          string;
    health_status: string;
    rejection_rate: number | null;
    edit_rate:      number | null;
  }>;
};

type TemplatesResponse = {
  summary:   HealthSummary;
  templates: Template[];
};

// ── Style maps ─────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<HealthStatus, string> = {
  active:    "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300 border-0",
  degraded:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300 border-0",
  paused:    "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 border-0",
  candidate: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border-0",
  retired:   "bg-muted text-muted-foreground border-0",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function pct(n: number | null): string {
  return n == null ? "—" : `${(n * 100).toFixed(0)}%`;
}

function scoreVal(n: number | null): string {
  return n == null ? "—" : (n * 100).toFixed(1);
}

function scoreColor(n: number | null): string {
  if (n == null) return "text-muted-foreground";
  if (n >= 0.7)  return "text-green-600 dark:text-green-400";
  if (n >= 0.5)  return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

// ── Summary bar ────────────────────────────────────────────────────────────────

function SummaryBar({ summary }: { summary: HealthSummary }) {
  const statusOrder: HealthStatus[] = ["active", "degraded", "candidate", "paused", "retired"];
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {statusOrder.map((s) => {
        const count = summary.by_status[s] ?? 0;
        if (count === 0) return null;
        return (
          <Badge key={s} className={`text-xs ${STATUS_BADGE[s]}`}>
            {count} {s}
          </Badge>
        );
      })}
    </div>
  );
}

// ── Template row ───────────────────────────────────────────────────────────────

function TemplateRow({ t }: { t: Template }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-md text-sm overflow-hidden">
      {/* Main row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/40 transition-colors"
      >
        {/* Slug + version */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{t.template_key}</span>
            <span className="text-xs text-muted-foreground shrink-0">v{t.template_version}</span>
          </div>
          <p className="text-xs text-muted-foreground capitalize">{t.content_type.replace(/_/g, " ")}</p>
        </div>

        {/* Status */}
        <Badge className={`text-xs capitalize shrink-0 ${STATUS_BADGE[t.health_status]}`}>
          {t.health_status}
        </Badge>

        {/* Key metrics */}
        <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
          <span title="Avg generation score">
            Score <span className={`font-medium ${scoreColor(t.generation_score_avg)}`}>{scoreVal(t.generation_score_avg)}</span>
          </span>
          <span title="Rejection rate">
            Rej <span className="font-medium">{pct(t.rejection_rate)}</span>
          </span>
          <span title="Edit rate">
            Edit <span className="font-medium">{pct(t.edit_rate)}</span>
          </span>
          <span title="Sample count">
            n={t.sample_count}
          </span>
        </div>

        {/* Chevron */}
        <svg
          className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t px-3 py-3 bg-muted/10 space-y-2 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <p className="text-muted-foreground">Slug</p>
              <p className="font-mono font-medium">{t.slug}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Samples</p>
              <p className="font-medium">{t.sample_count}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Perf score</p>
              <p className={`font-medium ${scoreColor(t.performance_score_avg)}`}>
                {scoreVal(t.performance_score_avg)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{t.created_at.slice(0, 10)}</p>
            </div>
          </div>

          {t.health_status === "paused" && t.pause_reason && (
            <div className="pt-1">
              <p className="text-muted-foreground">Pause reason</p>
              <p className="text-yellow-700 dark:text-yellow-400 mt-0.5">{t.pause_reason}</p>
            </div>
          )}
          {t.evolution_reason && (
            <div className="pt-1">
              <p className="text-muted-foreground">Evolution</p>
              <p className="mt-0.5">{t.evolution_reason}</p>
              {t.expected_improvement != null && (
                <p className="text-green-600 dark:text-green-400 font-medium mt-0.5">
                  Expected improvement: +{(t.expected_improvement * 100).toFixed(1)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AIContentTemplatesPanel() {
  const [data,    setData]    = useState<TemplatesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE}/api/admin/ai/content/templates`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const body = await res.json();
      if (body.ok) setData({ summary: body.summary, templates: body.templates ?? [] });
    } catch (err) {
      console.error("[AIContentTemplatesPanel]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-6 w-64" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
      </div>
    );
  }

  const templates = data?.templates ?? [];
  const summary   = data?.summary;

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">Templates</h3>
          <p className="text-xs text-muted-foreground">{templates.length} templates</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded border hover:bg-muted transition-colors disabled:opacity-40"
        >
          Refresh
        </button>
      </div>

      {/* Summary badges */}
      {summary && <SummaryBar summary={summary} />}

      {/* Needs attention */}
      {summary && summary.needs_attention.length > 0 && (
        <div className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 rounded-md p-3 space-y-2">
          <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Needs attention</p>
          <div className="space-y-1">
            {summary.needs_attention.map((t) => (
              <div key={t.slug} className="flex items-center gap-3 text-xs">
                <Badge className={`text-xs capitalize ${STATUS_BADGE[t.health_status as HealthStatus]}`}>
                  {t.health_status}
                </Badge>
                <span className="font-medium">{t.slug}</span>
                {t.rejection_rate != null && (
                  <span className="text-muted-foreground">rej {pct(t.rejection_rate)}</span>
                )}
                {t.edit_rate != null && (
                  <span className="text-muted-foreground">edit {pct(t.edit_rate)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template list */}
      {templates.length === 0 ? (
        <p className="text-sm text-muted-foreground">No templates found. Run the migration to seed base templates.</p>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => <TemplateRow key={t.id} t={t} />)}
        </div>
      )}
    </div>
  );
}
