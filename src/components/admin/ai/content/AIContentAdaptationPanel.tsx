"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

// ── Types ──────────────────────────────────────────────────────────────────────

type EvolutionChange = {
  type:        string;
  description: string;
  data_signal?: string;
};

type Candidate = {
  id:                   string;
  slug:                 string;
  template_key:         string;
  template_version:     number;
  content_type:         string;
  user_prompt_template: string;
  evolved_from_id:      string;
  evolution_reason:     string;
  evolution_changes:    EvolutionChange[];
  expected_improvement: number;
  created_at:           string;
};

type AdaptationResult = {
  ok:                  boolean;
  stats_refreshed:     number;
  health_transitions:  Array<{ slug: string; from: string; to: string; reason: string }>;
  pattern_summary:     {
    edit_distributions_count: number;
    high_churn_openings_count: number;
    winning_hooks_count:      number;
  };
  evolution: {
    proposed: Array<{ content_type: string; slug: string; reason: string }>;
    skipped:  Array<{ content_type: string; reason: string }>;
  };
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function ImprovementBadge({ value }: { value: number }) {
  const pct = (value * 100).toFixed(1);
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      +{pct} expected
    </span>
  );
}

// ── Candidate card ─────────────────────────────────────────────────────────────

function CandidateCard({
  candidate,
  onApprove,
  onReject,
  acting,
}: {
  candidate: Candidate;
  onApprove: () => void;
  onReject:  () => void;
  acting:    boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Summary row */}
      <div className="flex items-start gap-3 p-3">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{candidate.slug}</span>
            <Badge variant="outline" className="text-xs capitalize">
              {candidate.content_type.replace(/_/g, " ")}
            </Badge>
            <ImprovementBadge value={candidate.expected_improvement} />
          </div>

          {/* Evolution changes */}
          <div className="flex flex-wrap gap-1 mt-1">
            {candidate.evolution_changes.map((c, i) => (
              <span
                key={i}
                title={c.description}
                className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              >
                {c.type.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="px-2 py-1.5 text-xs rounded border hover:bg-muted transition-colors"
            title="View prompt diff"
          >
            {expanded ? "Hide" : "View"}
          </button>
          <button
            onClick={onApprove}
            disabled={acting}
            className="px-3 py-1.5 text-xs rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-colors"
          >
            {acting ? "…" : "Approve"}
          </button>
          <button
            onClick={onReject}
            disabled={acting}
            className="px-3 py-1.5 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Expanded: change details + prompt preview */}
      {expanded && (
        <div className="border-t bg-muted/10 p-3 space-y-3 text-xs">
          {/* Evolution signals */}
          <div className="space-y-1.5">
            <p className="font-medium text-muted-foreground uppercase tracking-wide">Data signals</p>
            {candidate.evolution_changes.map((c, i) => (
              <div key={i} className="space-y-0.5 pl-2 border-l-2 border-blue-200 dark:border-blue-800">
                <p className="font-medium capitalize">{c.type.replace(/_/g, " ")}</p>
                <p className="text-muted-foreground">{c.description}</p>
                {c.data_signal && (
                  <p className="font-mono text-muted-foreground/70">{c.data_signal}</p>
                )}
              </div>
            ))}
          </div>

          {/* Prompt preview (truncated) */}
          <div className="space-y-1">
            <p className="font-medium text-muted-foreground uppercase tracking-wide">Proposed prompt (preview)</p>
            <pre className="text-xs whitespace-pre-wrap bg-muted rounded p-2 max-h-40 overflow-y-auto leading-relaxed">
              {candidate.user_prompt_template.slice(0, 600)}
              {candidate.user_prompt_template.length > 600 && "\n…"}
            </pre>
          </div>

          <p className="text-muted-foreground">
            Created {candidate.created_at.slice(0, 10)} · base template {candidate.evolved_from_id.slice(0, 8)}…
          </p>
        </div>
      )}
    </div>
  );
}

// ── Adaptation result banner ───────────────────────────────────────────────────

function AdaptationResultBanner({ result }: { result: AdaptationResult }) {
  return (
    <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 rounded-md p-3 space-y-2 text-xs">
      <p className="font-medium text-green-700 dark:text-green-400">Adaptation run complete</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div>
          <p className="text-muted-foreground">Stats refreshed</p>
          <p className="font-medium">{result.stats_refreshed}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Health transitions</p>
          <p className="font-medium">{result.health_transitions.length}</p>
        </div>
        <div>
          <p className="text-muted-foreground">New proposals</p>
          <p className="font-medium">{result.evolution.proposed.length}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Winning hooks</p>
          <p className="font-medium">{result.pattern_summary.winning_hooks_count}</p>
        </div>
      </div>

      {result.health_transitions.length > 0 && (
        <div className="space-y-1 pt-1">
          <p className="font-medium text-muted-foreground">Transitions</p>
          {result.health_transitions.map((t, i) => (
            <p key={i} className="text-muted-foreground">
              <span className="font-medium text-foreground">{t.slug}</span>: {t.from} → {t.to}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AIContentAdaptationPanel() {
  const [candidates,   setCandidates]   = useState<Candidate[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [adapting,     setAdapting]     = useState(false);
  const [actingId,     setActingId]     = useState<string | null>(null);
  const [adaptResult,  setAdaptResult]  = useState<AdaptationResult | null>(null);
  const [adaptError,   setAdaptError]   = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE}/api/admin/ai/content/templates/candidates`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const body = await res.json();
      if (body.ok) setCandidates(body.candidates ?? []);
    } catch (err) {
      console.error("[AIContentAdaptationPanel]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const handleRunAdaptation = useCallback(async () => {
    setAdapting(true);
    setAdaptResult(null);
    setAdaptError(null);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE}/api/admin/ai/content/templates/adapt`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token ?? ""}`, "Content-Type": "application/json" },
      });
      const body = await res.json();
      if (body.ok) {
        setAdaptResult(body);
        await fetchCandidates();
      } else {
        setAdaptError(body.message ?? body.code ?? "Adaptation failed");
      }
    } catch (err: any) {
      setAdaptError(err.message ?? "Adaptation failed");
    } finally {
      setAdapting(false);
    }
  }, [fetchCandidates]);

  const handleApprove = useCallback(async (id: string) => {
    setActingId(id);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/admin/ai/content/templates/${id}/approve`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token ?? ""}`, "Content-Type": "application/json" },
      });
      setCandidates((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("[AIContentAdaptationPanel] approve failed", err);
    } finally {
      setActingId(null);
    }
  }, []);

  const handleReject = useCallback(async (id: string) => {
    setActingId(id);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/admin/ai/content/templates/${id}/reject`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token ?? ""}`, "Content-Type": "application/json" },
      });
      setCandidates((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("[AIContentAdaptationPanel] reject failed", err);
    } finally {
      setActingId(null);
    }
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading && candidates.length === 0) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <Skeleton className="h-4 w-48" />
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded" />)}
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold">Adaptive System</h3>
          <p className="text-xs text-muted-foreground">
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} awaiting review ·{" "}
            Candidates are <strong>never auto-deployed</strong>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {adaptError && (
            <span className="text-xs text-red-500">{adaptError}</span>
          )}
          <button
            onClick={handleRunAdaptation}
            disabled={adapting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-foreground text-background font-medium hover:opacity-80 disabled:opacity-40 transition-opacity"
          >
            {adapting && (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
            )}
            {adapting ? "Running adaptation…" : "Run Adaptation"}
          </button>
          <button
            onClick={fetchCandidates}
            disabled={loading}
            className="px-3 py-1.5 text-xs rounded border hover:bg-muted transition-colors disabled:opacity-40"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Adaptation result */}
      {adaptResult && <AdaptationResultBanner result={adaptResult} />}

      {/* Candidates */}
      {candidates.length === 0 ? (
        <div className="py-4 text-center space-y-1">
          <p className="text-sm text-muted-foreground">No candidate templates pending review.</p>
          <p className="text-xs text-muted-foreground">
            Run Adaptation to analyze performance data and propose improvements.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              acting={actingId === c.id}
              onApprove={() => handleApprove(c.id)}
              onReject={() => handleReject(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
