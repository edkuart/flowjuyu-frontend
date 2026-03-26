"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

// ── Types ──────────────────────────────────────────────────────────────────────

const REJECTION_REASONS = [
  "off_topic",
  "price_mismatch",
  "inappropriate_language",
  "cultural_insensitivity",
  "factual_error",
  "too_promotional",
  "too_generic",
  "wrong_language",
  "competitor_mention",
  "other_quality_issue",
] as const;

type RejectionReason = (typeof REJECTION_REASONS)[number];

type Scores = {
  generation_score:      number | null;
  score_specificity:     number | null;
  score_brand_alignment: number | null;
  score_readability:     number | null;
  score_seo_coverage:    number | null;
};

type ReviewItem = {
  variant_id:   string;
  content_body: string;
  word_count:   number;
  language:     string;
  model_used:   string;
  template_id:  string;
  queue_flag:   string | null;
  generated_at: string;
  cost_usd:     number;
  scores:       Scores;
  item: {
    id:           string;
    subject_type: string;
    subject_id:   string;
    content_type: string;
    priority:     number;
  } | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(s: number | null): string {
  return s == null ? "—" : (s * 100).toFixed(0);
}

function scoreColor(s: number | null): string {
  if (s == null) return "text-muted-foreground";
  if (s >= 0.7)  return "text-green-600 dark:text-green-400";
  if (s >= 0.5)  return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

// ── Score mini-grid ────────────────────────────────────────────────────────────

function ScoreGrid({ scores }: { scores: Scores }) {
  const cells: [string, number | null][] = [
    ["Spec",  scores.score_specificity],
    ["Brand", scores.score_brand_alignment],
    ["Read",  scores.score_readability],
    ["SEO",   scores.score_seo_coverage],
  ];

  return (
    <div className="grid grid-cols-4 gap-1 pt-1">
      {cells.map(([label, val]) => (
        <div key={label} className="text-center">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-xs font-semibold tabular-nums ${scoreColor(val)}`}>{fmt(val)}</p>
        </div>
      ))}
    </div>
  );
}

// ── Review card ────────────────────────────────────────────────────────────────

function ReviewCard({
  item,
  acting,
  onApprove,
  onReject,
}: {
  item:      ReviewItem;
  acting:    boolean;
  onApprove: () => void;
  onReject:  (reason: RejectionReason) => void;
}) {
  const [rejecting,   setRejecting]   = useState(false);
  const [rejectReason, setRejectReason] = useState<RejectionReason>("too_generic");
  const [expanded,    setExpanded]    = useState(false);

  const genScore = item.scores.generation_score;
  const isReady  = item.queue_flag === "ready";

  return (
    <div className="border rounded-md p-3 space-y-3 text-sm">
      {/* Row 1: meta */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-xs capitalize">
          {(item.item?.content_type ?? "unknown").replace(/_/g, " ")}
        </Badge>
        {isReady && (
          <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300 border-0">
            ready
          </Badge>
        )}
        {item.queue_flag && !isReady && (
          <Badge variant="secondary" className="text-xs">{item.queue_flag}</Badge>
        )}
        <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span>{item.word_count}w</span>
          <span className={`font-semibold tabular-nums ${scoreColor(genScore)}`}>
            {fmt(genScore)}
          </span>
        </span>
      </div>

      {/* Row 2: content preview */}
      <div>
        <p
          className={`text-sm leading-relaxed text-foreground/80 ${expanded ? "" : "line-clamp-3"}`}
        >
          {item.content_body}
        </p>
        {item.content_body.length > 160 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground mt-0.5 transition-colors"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Row 3: score breakdown */}
      <ScoreGrid scores={item.scores} />

      {/* Row 4: actions */}
      {rejecting ? (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <select
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value as RejectionReason)}
            className="flex-1 min-w-0 px-2 py-1.5 text-xs rounded border bg-background"
          >
            {REJECTION_REASONS.map((r) => (
              <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
            ))}
          </select>
          <button
            onClick={() => onReject(rejectReason)}
            disabled={acting}
            className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            {acting ? "…" : "Confirm reject"}
          </button>
          <button
            onClick={() => setRejecting(false)}
            className="px-3 py-1.5 text-xs rounded border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onApprove}
            disabled={acting}
            className="px-3 py-1.5 text-xs rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-colors"
          >
            {acting ? "…" : "Approve"}
          </button>
          <button
            onClick={() => setRejecting(true)}
            disabled={acting}
            className="px-3 py-1.5 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40 transition-colors"
          >
            Reject
          </button>
          <span className="ml-auto font-mono text-xs text-muted-foreground truncate max-w-[140px]">
            {item.template_id}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AIContentReviewQueue() {
  const [variants, setVariants] = useState<ReviewItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE}/api/admin/ai/content/review-queue`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const body = await res.json();
      if (body.ok) setVariants(body.queue ?? []);
    } catch (err) {
      console.error("[AIContentReviewQueue]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const doAction = useCallback(async (
    variantId:       string,
    action:          "approved" | "rejected",
    rejectionReason?: RejectionReason,
  ) => {
    setActing(variantId);
    try {
      const token   = localStorage.getItem("token");
      const payload: Record<string, string> = { action };
      if (action === "rejected" && rejectionReason) payload.rejection_reason = rejectionReason;

      await fetch(`${API_BASE}/api/admin/ai/content/review/${variantId}`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token ?? ""}`, "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      setVariants((prev) => prev.filter((v) => v.variant_id !== variantId));
    } catch (err) {
      console.error("[AIContentReviewQueue] action failed", err);
    } finally {
      setActing(null);
    }
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading && variants.length === 0) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <Skeleton className="h-4 w-40" />
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-36 rounded" />)}
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Review Queue</h3>
          <p className="text-xs text-muted-foreground">{variants.length} awaiting review</p>
        </div>
        <button
          onClick={fetchQueue}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded border hover:bg-muted transition-colors disabled:opacity-40"
        >
          Refresh
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="py-4 text-center space-y-1">
          <p className="text-sm text-muted-foreground">No variants awaiting review.</p>
          <p className="text-xs text-muted-foreground">Run the optimizer or trigger a single generation to populate this queue.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((v) => (
            <ReviewCard
              key={v.variant_id}
              item={v}
              acting={acting === v.variant_id}
              onApprove={() => doAction(v.variant_id, "approved")}
              onReject={(reason) => doAction(v.variant_id, "rejected", reason)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
