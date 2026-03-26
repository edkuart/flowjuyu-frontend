"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

// ── Types ──────────────────────────────────────────────────────────────────────

type ContentTypeRanking = {
  content_type: string;
  avg_score:    number;
  sample_count: number;
};

type WordCountRange = {
  content_type: string;
  p25:          number;
  median:       number;
  p75:          number;
};

type WinningHook = {
  content_type:  string;
  phrase:        string;
  avg_gen_score: number;
};

type RejectionPattern = {
  content_type: string;
  reason:       string;
  freq:         number;
};

type ExplorationSignal = {
  template_id:  string;
  content_type: string;
  usage_count:  number;
  avg_score:    number;
};

type Patterns = {
  content_type_rankings: ContentTypeRanking[];
  word_count_ranges:     WordCountRange[];
  winning_hooks:         WinningHook[];
  rejection_patterns:    RejectionPattern[];
  exploration_signals:   ExplorationSignal[];
  diversity_health:      "healthy" | "at_risk" | "over_exploited" | string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 0.7) return "text-green-600 dark:text-green-400";
  if (s >= 0.5) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

const DIVERSITY_STYLES: Record<string, string> = {
  healthy:        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  at_risk:        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  over_exploited: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

// ── Sub-sections ───────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{children}</p>
  );
}

function WinningHooksList({ hooks }: { hooks: WinningHook[] }) {
  if (hooks.length === 0) return <p className="text-xs text-muted-foreground">No hooks yet.</p>;
  return (
    <div className="space-y-1.5">
      {hooks.slice(0, 8).map((h, i) => (
        <div key={i} className="flex items-start gap-3 text-sm">
          <span className={`tabular-nums text-xs font-semibold w-8 shrink-0 mt-0.5 ${scoreColor(h.avg_gen_score)}`}>
            {(h.avg_gen_score * 100).toFixed(0)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="truncate italic text-foreground/80">"{h.phrase}…"</p>
            <p className="text-xs text-muted-foreground capitalize">{h.content_type.replace(/_/g, " ")}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FailingPatternsList({ patterns }: { patterns: RejectionPattern[] }) {
  if (patterns.length === 0) return <p className="text-xs text-muted-foreground">No rejection patterns yet.</p>;
  const sorted = [...patterns].sort((a, b) => b.freq - a.freq);
  return (
    <div className="space-y-1.5">
      {sorted.slice(0, 8).map((p, i) => (
        <div key={i} className="flex items-center gap-3 text-xs">
          <span className="font-semibold tabular-nums w-5 text-right text-muted-foreground">{p.freq}</span>
          <span className="flex-1 capitalize">{p.reason.replace(/_/g, " ")}</span>
          <Badge variant="outline" className="text-xs capitalize shrink-0">
            {p.content_type.replace(/_/g, " ")}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function WordCountRanges({ ranges }: { ranges: WordCountRange[] }) {
  if (ranges.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {ranges.map((r) => (
        <div key={r.content_type} className="border rounded-md p-2.5 space-y-1">
          <p className="text-xs font-medium capitalize">{r.content_type.replace(/_/g, " ")}</p>
          <div className="flex items-end gap-1 text-xs text-muted-foreground">
            <span>{r.p25}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden mx-1">
              <div className="h-full bg-primary/50 rounded-full" style={{ width: "60%" }} />
            </div>
            <span>{r.p75}</span>
          </div>
          <p className="text-xs text-center text-muted-foreground">median {r.median}w</p>
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AIContentPatternsPanel() {
  const [patterns, setPatterns] = useState<Patterns | null>(null);
  const [loading,  setLoading]  = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE}/api/admin/ai/content/optimization?patterns=true`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const body = await res.json();
      if (body.ok && body.patterns) setPatterns(body.patterns);
    } catch (err) {
      console.error("[AIContentPatternsPanel]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !patterns) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded" />)}
        </div>
        <Skeleton className="h-32 rounded" />
      </div>
    );
  }

  if (!patterns) {
    return (
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          No patterns yet — patterns are built from approved variants over the first 14 days.
        </p>
      </div>
    );
  }

  const divStyle = DIVERSITY_STYLES[patterns.diversity_health] ?? DIVERSITY_STYLES.at_risk;

  return (
    <div className="bg-card border rounded-lg p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">Pattern Learning</h3>
          <p className="text-xs text-muted-foreground">What the AI has learned from approved content</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${divStyle}`}>
            {patterns.diversity_health.replace(/_/g, " ")}
          </span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3 py-1.5 text-xs rounded border hover:bg-muted transition-colors disabled:opacity-40"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Word count sweet spots */}
      {(patterns.word_count_ranges ?? []).length > 0 && (
        <div className="space-y-2">
          <SectionTitle>Word count sweet spots</SectionTitle>
          <WordCountRanges ranges={patterns.word_count_ranges} />
        </div>
      )}

      {/* Content type rankings */}
      {(patterns.content_type_rankings ?? []).length > 0 && (
        <div className="space-y-2">
          <SectionTitle>Content type performance</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {patterns.content_type_rankings.map((r) => (
              <div key={r.content_type} className="border rounded-md p-2.5 flex items-center gap-3">
                <span className={`text-base font-bold tabular-nums ${scoreColor(r.avg_score)}`}>
                  {(r.avg_score * 100).toFixed(0)}
                </span>
                <div>
                  <p className="text-xs font-medium capitalize">{r.content_type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">n={r.sample_count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Winning hooks + failing patterns side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <SectionTitle>Winning hooks</SectionTitle>
          <WinningHooksList hooks={patterns.winning_hooks ?? []} />
        </div>
        <div className="space-y-2">
          <SectionTitle>Failing patterns</SectionTitle>
          <FailingPatternsList patterns={patterns.rejection_patterns ?? []} />
        </div>
      </div>
    </div>
  );
}
