"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Skeleton }  from "@/components/ui/skeleton";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type LLMResponse = {
  schema_version:     string;
  date:               string;
  prompt_file:        string;
  issues_analyzed:    number;
  model:              string;
  stop_reason:        string;
  tokens_used: {
    input:  number;
    output: number;
    total:  number;
  };
  estimated_cost_usd: number;
  response:           string;
};

type ExecutionState = "pending" | "in_progress" | "done";

// ── Action map ─────────────────────────────────────────────────────────────────
// Maps every priority-generator issue ID → human label, severity, nav URLs,
// and a one-sentence next-step instruction.

type ActionEntry = {
  label:     string;
  severity:  "high" | "medium" | "low";
  view:      string;
  action:    string;
  nextStep:  string;
};

const ACTION_MAP: Record<string, ActionEntry> = {
  seller_activation_zero: {
    label:    "Zero Real Sellers Have Active Products",
    severity: "high",
    view:     "/admin/products",
    action:   "/admin/sellers",
    nextStep: "Open Sellers and individually activate the first real seller who has a complete profile.",
  },
  inactive_sellers_worsening: {
    label:    "Inactive Sellers Increasing",
    severity: "high",
    view:     "/admin/sellers",
    action:   "/admin/sellers?filter=inactive",
    nextStep: "Filter sellers by inactive status and reach out to the 3 most recently inactive accounts.",
  },
  dead_catalog: {
    label:    "Dead Catalog — Products With No Views",
    severity: "high",
    view:     "/admin/products",
    action:   "/admin/products",
    nextStep: "Open Products and identify the 5 zero-view listings to audit their visibility and category tags.",
  },
  test_data_contamination: {
    label:    "Test Account Contamination in Metrics",
    severity: "medium",
    view:     "/admin/sellers",
    action:   "/admin/sellers",
    nextStep: "Locate test accounts in Sellers and flag or remove them to restore metric accuracy.",
  },
  metric_source_conflict: {
    label:    "Metric Source Conflict Detected",
    severity: "medium",
    view:     "/admin/ai",
    action:   "/admin/ai",
    nextStep: "Review the AI telemetry panel to identify which conflicting data source is producing the discrepancy.",
  },
};

// ── Severity styles ────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<"high" | "medium" | "low", {
  badge: string;
  bar:   string;
}> = {
  high: {
    badge: "bg-red-100    text-red-700    border-red-200    dark:bg-red-900/30    dark:text-red-400    dark:border-red-800",
    bar:   "bg-red-500",
  },
  medium: {
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    bar:   "bg-yellow-400",
  },
  low: {
    badge: "bg-blue-100   text-blue-700   border-blue-200   dark:bg-blue-900/30   dark:text-blue-400   dark:border-blue-800",
    bar:   "bg-blue-400",
  },
};

// ── Execution status styles ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ExecutionState, {
  icon:  string;
  label: string;
  style: string;
}> = {
  pending: {
    icon:  "⏳",
    label: "Pending",
    style: "text-muted-foreground",
  },
  in_progress: {
    icon:  "🚧",
    label: "In Progress",
    style: "text-yellow-600 dark:text-yellow-400",
  },
  done: {
    icon:  "✅",
    label: "Done",
    style: "text-green-600 dark:text-green-400",
  },
};

// ── localStorage helpers ───────────────────────────────────────────────────────

const LS_PREFIX = "flowjuyu_issue_status_";

function loadStatus(issueId: string): ExecutionState {
  try {
    const raw = localStorage.getItem(LS_PREFIX + issueId);
    if (raw === "pending" || raw === "in_progress" || raw === "done") return raw;
  } catch {
    // SSR or storage unavailable
  }
  return "pending";
}

function saveStatus(issueId: string, status: ExecutionState): void {
  try {
    localStorage.setItem(LS_PREFIX + issueId, status);
  } catch {
    // Storage unavailable — state lives only in memory
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function extractField(text: string, re: RegExp): string {
  const m = text.match(re);
  return m ? m[1].trim() : "";
}

/** snake_case → Title Case fallback when no ACTION_MAP entry exists */
function prettifyId(id: string): string {
  return id
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Issue action card ──────────────────────────────────────────────────────────

function IssueActionCard({ content }: { content: string }) {
  const router = useRouter();

  const full = "**ISSUE:" + content;

  // Extract issue ID
  const idMatch = full.match(/\*\*ISSUE:\s*([\w-]+)/);
  const id      = idMatch ? idMatch[1].trim() : "";

  // Resolve mapped metadata
  const mapped   = ACTION_MAP[id] ?? null;
  const title    = mapped?.label ?? prettifyId(id);
  const severity = mapped?.severity ?? "medium";
  const styles   = SEVERITY_STYLES[severity];

  // Parse text fields
  const rootCause  = extractField(full, /[-–]\s*Root cause:\s*(.+)/i);
  const action24h  = extractField(full, /[-–]\s*24h action:\s*(.+)/i);
  const blocker    = extractField(full, /[-–]\s*Blocker:\s*(.+)/i);
  const confirmed  = extractField(full, /[-–]\s*Confirmed:\s*([^,\n]+)/i);
  const confidence = extractField(full, /[-–]\s*Confidence in diagnosis:\s*(.+)/i);

  const blockerIsReal = blocker && blocker.toLowerCase() !== "none";
  const canView       = !!mapped?.view;
  const canAction     = !!mapped?.action;

  // ── Execution state ─────────────────────────────────────────────────────────

  const [status, setStatus]       = useState<ExecutionState>("pending");
  const [executing, setExecuting] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    if (id) setStatus(loadStatus(id));
  }, [id]);

  const updateStatus = useCallback((next: ExecutionState) => {
    setStatus(next);
    if (id) saveStatus(id, next);
  }, [id]);

  // Navigate to a URL with confirmation message and delay
  const navigateWithConfirmation = useCallback(
    (url: string, msg: string, nextStatus: ExecutionState) => {
      if (executing) return;
      setConfirmMsg(msg);
      setExecuting(true);
      updateStatus(nextStatus);
      const delay = 400 + Math.random() * 200; // 400–600ms
      setTimeout(() => {
        setExecuting(false);
        setConfirmMsg("");
        router.push(url);
      }, delay);
    },
    [executing, router, updateStatus],
  );

  const handleViewData = () => {
    if (!canView) return;
    navigateWithConfirmation(
      mapped!.view,
      `Opening data view for this issue...`,
      status === "pending" ? "in_progress" : status,
    );
  };

  const handleTakeAction = () => {
    if (!canAction) return;
    navigateWithConfirmation(
      mapped!.action,
      `Opening ${mapped!.action.replace("/admin/", "")} to execute this action...`,
      "in_progress",
    );
  };

  const handleMarkDone = () => {
    updateStatus(status === "done" ? "pending" : "done");
  };

  const statusCfg = STATUS_CONFIG[status];

  return (
    <div className={`border rounded-lg overflow-hidden bg-card transition-opacity ${status === "done" ? "opacity-60" : ""}`}>

      {/* Severity bar */}
      <div className={`h-1 w-full ${styles.bar}`} />

      <div className="p-4 space-y-3">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <h3 className="font-semibold text-sm leading-snug">{title}</h3>
            <p className="text-xs font-mono text-muted-foreground truncate">{id}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {confirmed && (
              <span className="text-xs text-muted-foreground">
                {confirmed === "yes" ? "confirmed" : confirmed === "no" ? "false positive" : confirmed}
              </span>
            )}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide ${styles.badge}`}>
              {severity}
            </span>
          </div>
        </div>

        {/* Root cause */}
        {rootCause && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {rootCause}
          </p>
        )}

        {/* Recommended action — highlighted */}
        {action24h && (
          <div className="bg-muted/40 border rounded-md p-3 space-y-1">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Recommended 24h Action
            </p>
            <p className="text-sm text-foreground leading-relaxed">{action24h}</p>
          </div>
        )}

        {/* Next step instruction */}
        {mapped?.nextStep && status !== "done" && (
          <div className="flex items-start gap-2">
            <span className="text-xs mt-0.5 shrink-0">→</span>
            <p className="text-xs text-foreground font-medium leading-relaxed">
              <span className="text-muted-foreground font-normal">Next step: </span>
              {mapped.nextStep}
            </p>
          </div>
        )}

        {/* Blocker warning */}
        {blockerIsReal && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5">
            <span>⚠</span>
            <span><span className="font-medium">Blocker:</span> {blocker}</span>
          </p>
        )}

        {/* Inline confirmation message */}
        {executing && confirmMsg && (
          <p className="text-xs text-muted-foreground italic animate-pulse">
            {confirmMsg}
          </p>
        )}

        {/* Status + confidence row */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            {/* Execution status badge */}
            <button
              onClick={handleMarkDone}
              title={status === "done" ? "Mark as pending" : "Mark as done"}
              className={`flex items-center gap-1 font-medium transition-colors hover:opacity-75 ${statusCfg.style}`}
            >
              <span>{statusCfg.icon}</span>
              <span>{statusCfg.label}</span>
            </button>
            {confidence && (
              <span className="text-muted-foreground">
                Confidence: <span className="font-medium text-foreground">{confidence}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-0.5">
          {/* View Data — ghost/secondary */}
          <button
            onClick={handleViewData}
            disabled={!canView || executing}
            title={canView ? `Go to ${mapped!.view}` : "No data page mapped for this issue"}
            className="
              px-3 py-1.5 text-xs font-medium rounded border transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed
              enabled:hover:bg-muted
            "
          >
            View Data
          </button>

          {/* Take Action — primary dark */}
          <button
            onClick={handleTakeAction}
            disabled={!canAction || executing || status === "done"}
            title={
              status === "done"
                ? "Already marked as done"
                : canAction
                ? `Go to ${mapped!.action}`
                : "No action page mapped for this issue"
            }
            className="
              px-3 py-1.5 text-xs font-semibold rounded transition-all
              bg-foreground text-background
              disabled:opacity-40 disabled:cursor-not-allowed
              enabled:hover:opacity-85 enabled:active:scale-95
            "
          >
            {executing ? "Opening…" : "Take Action →"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────

export default function AILLMInsightsPanel() {
  const { data, loading, error, refetch } = useBrainFetch<LLMResponse>(
    "/api/admin/ai/llm-response",
    "llm_response",
  );

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">🧠</span>
          <h3 className="font-semibold text-sm">AI Analysis</h3>
        </div>
        <p className="text-sm text-muted-foreground">No automated analysis available.</p>
        <button
          onClick={refetch}
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────

  if (!data) {
    return (
      <div className="bg-card border rounded-lg p-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">🧠</span>
          <h3 className="font-semibold text-sm">AI Analysis</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No automated LLM analysis available yet.
        </p>
        <p className="text-xs text-muted-foreground">
          Analysis runs automatically when high-priority issues are detected in the daily cycle.
          Check back after the next brain run.
        </p>
      </div>
    );
  }

  // ── Parse response into issue blocks ──────────────────────────────────────

  const rawSections    = data.response.split(/\*\*ISSUE:/g).filter((s) => s.trim());
  const hasIssueBlocks = rawSections.length > 0 && data.response.includes("**ISSUE:");

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">🧠</span>
          <h3 className="font-semibold text-sm">AI Analysis</h3>
          <span className="text-xs text-muted-foreground">
            {data.date} · {data.issues_analyzed} issue{data.issues_analyzed !== 1 ? "s" : ""} analyzed
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{data.model}</span>
          <span>·</span>
          <span>{data.tokens_used.total.toLocaleString()} tokens</span>
          <span>·</span>
          <span>${data.estimated_cost_usd.toFixed(4)}</span>
        </div>
      </div>

      {/* Issue cards or raw fallback */}
      {hasIssueBlocks ? (
        <div className="space-y-3">
          {rawSections.map((section, i) => (
            <IssueActionCard key={i} content={section} />
          ))}
        </div>
      ) : (
        <div className="bg-muted/30 rounded-md p-4">
          <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">
            {data.response}
          </pre>
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground border-t pt-2">
        Source: {data.prompt_file}
      </p>

    </div>
  );
}
