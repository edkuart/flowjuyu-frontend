"use client";

import { useMemo }  from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrainFetch } from "./useBrainFetch";

// ── Source types ───────────────────────────────────────────────────────────────

type AiDecision = {
  date:          string;
  decision_type: string;
  explanation:   string;
};

type AgentStatus = {
  name:              string;
  status:            string;
  last_activity:     string | null;
  tasks_completed:   number;
  reports_generated: number;
};

type SupervisorData = {
  agents:       AgentStatus[];
  evaluated_at: string;
};

type ReportMeta = {
  filename: string;
  type:     string;
  date:     string | null;
  preview?: string;
};

type RiskItem = { severity: string; type: string; description: string };

type RiskData = {
  risks:         RiskItem[];
  tasks_created: number;
  evaluated_at:  string;
};

// ── Unified event type ─────────────────────────────────────────────────────────

type EventKind =
  | "brain_cycle"
  | "strategy_generated"
  | "decision"
  | "agent_run"
  | "report"
  | "risk_scan"
  | "task_created";

type ActivityEvent = {
  id:        string;
  kind:      EventKind;
  timestamp: string;
  title:     string;
  subtitle?: string;
  agent?:    string;
};

// ── Event style config ─────────────────────────────────────────────────────────

const EVENT_CONFIG: Record<EventKind, {
  dot:   string;
  label: string;
  bg:    string;
  icon:  string;
}> = {
  brain_cycle:        { dot: "bg-purple-600", label: "Brain Cycle",        bg: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300", icon: "⚡" },
  strategy_generated: { dot: "bg-green-500",  label: "Strategy Generated", bg: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",     icon: "🎯" },
  decision:           { dot: "bg-violet-500", label: "Decision",           bg: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",  icon: "◈"  },
  agent_run:          { dot: "bg-blue-500",   label: "Agent Run",          bg: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",          icon: "⚙"  },
  report:             { dot: "bg-teal-500",   label: "Report",             bg: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",          icon: "📄" },
  risk_scan:          { dot: "bg-orange-500", label: "Risk Scan",          bg: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",  icon: "⚠"  },
  task_created:       { dot: "bg-sky-500",    label: "Task Created",       bg: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",              icon: "✓"  },
};

// ── Safe field extractors ──────────────────────────────────────────────────────
// All return empty / zero / null instead of crashing on malformed items.

function safeStr(obj: unknown, key: string): string {
  if (obj === null || obj === undefined || typeof obj !== "object") return "";
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "string" ? v : "";
}

function safeNum(obj: unknown, key: string, fallback = 0): number {
  if (obj === null || obj === undefined || typeof obj !== "object") return fallback;
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "number" && isFinite(v) ? v : fallback;
}

function safeArr(obj: unknown, key: string): unknown[] {
  if (obj === null || obj === undefined || typeof obj !== "object") return [];
  const v = (obj as Record<string, unknown>)[key];
  return Array.isArray(v) ? v : [];
}

/**
 * Extract the filename from a report item of unknown shape.
 * Handles: plain string, { filename: "..." }, or anything else (returns "").
 */
function getReportFilename(report: unknown): string {
  if (typeof report === "string") return report;
  return safeStr(report, "filename");
}

function getReportType(report: unknown): string {
  if (typeof report === "string") return "report";
  return safeStr(report, "type") || "report";
}

function getReportDate(report: unknown): string | null {
  if (typeof report === "string") return null;
  const d = safeStr(report, "date");
  return d || null;
}

/**
 * Normalize a raw decision item. Returns null if the shape is unusable.
 */
function toDecision(d: unknown): AiDecision | null {
  if (!d || typeof d !== "object") return null;
  const date          = safeStr(d, "date");
  const decision_type = safeStr(d, "decision_type");
  const explanation   = safeStr(d, "explanation");
  if (!decision_type) return null;               // mandatory field
  return { date: date || new Date().toISOString(), decision_type, explanation };
}

/**
 * Normalize a raw agent item. Returns null if the shape is unusable.
 */
function toAgent(a: unknown): AgentStatus | null {
  if (!a || typeof a !== "object") return null;
  const name = safeStr(a, "name");
  if (!name) return null;                        // mandatory field
  const lastAct = safeStr(a, "last_activity");
  return {
    name,
    status:            safeStr(a, "status"),
    last_activity:     lastAct || null,
    tasks_completed:   safeNum(a, "tasks_completed"),
    reports_generated: safeNum(a, "reports_generated"),
  };
}

/**
 * Normalize a raw risk item. Returns null if malformed.
 */
function toRiskItem(r: unknown): RiskItem | null {
  if (!r || typeof r !== "object") return null;
  const severity = safeStr(r, "severity");
  const type     = safeStr(r, "type");
  if (!severity || !type) return null;
  return { severity, type, description: safeStr(r, "description") };
}

/**
 * Normalize the risks envelope. Returns a safe RiskData or null.
 */
function toRiskData(raw: unknown): RiskData | null {
  if (!raw || typeof raw !== "object") return null;
  const risks = safeArr(raw, "risks")
    .map(toRiskItem)
    .filter((x): x is RiskItem => x !== null);
  const evaluated_at = safeStr(raw, "evaluated_at");
  const tasks_created = safeNum(raw, "tasks_created");
  if (!evaluated_at && risks.length === 0) return null;
  return { risks, tasks_created, evaluated_at: evaluated_at || new Date().toISOString() };
}

// ── Relative time ──────────────────────────────────────────────────────────────

function formatRelative(isoStr: string | null | undefined): string {
  if (!isoStr) return "unknown time";
  const ms = new Date(isoStr).getTime();
  if (isNaN(ms)) return "unknown time";
  const diff = Date.now() - ms;
  const min  = Math.floor(diff / 60_000);
  const hr   = Math.floor(diff / 3_600_000);
  const day  = Math.floor(diff / 86_400_000);
  if (min  <  1) return "just now";
  if (min  < 60) return `${min}m ago`;
  if (hr   < 24) return `${hr}h ago`;
  if (day  <  7) return `${day}d ago`;
  return new Date(isoStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ── Event builders ─────────────────────────────────────────────────────────────

function buildEvents(
  rawDecisions?:  unknown[] | null,
  rawSupervisor?: SupervisorData | unknown | null,
  rawReports?:    unknown[] | null,
  rawRisks?:      unknown | null,
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  const reportList  = Array.isArray(rawReports)    ? rawReports    : [];
  const decList     = Array.isArray(rawDecisions)   ? rawDecisions  : [];
  const agentList   = Array.isArray(safeArr(rawSupervisor, "agents"))
    ? safeArr(rawSupervisor, "agents")
    : [];
  const risks = toRiskData(rawRisks);

  // ── Brain cycle events (reports with "ai-report-" or "brain" in the filename)
  reportList.forEach((r, i) => {
    const filename = getReportFilename(r).toLowerCase();
    if (!filename) return;                        // skip malformed items
    if (!filename.includes("ai-report-") && !filename.includes("brain")) return;

    const date = getReportDate(r);
    const ts   = date ? `${date}T10:00:00Z` : new Date().toISOString();
    events.push({
      id:        `brain-cycle-${i}`,
      kind:      "brain_cycle",
      timestamp: ts,
      title:     "AI Brain cycle completed",
      subtitle:  `Report: ${getReportFilename(r)}`,
    });
  });

  // ── Strategy generated (growth_opportunity decisions)
  decList.forEach((raw, i) => {
    const d = toDecision(raw);
    if (!d) return;
    if (!d.decision_type.includes("growth") && !d.decision_type.includes("opportunity")) return;
    events.push({
      id:        `strat-${i}`,
      kind:      "strategy_generated",
      timestamp: d.date,
      title:     "Growth strategy generated",
      subtitle:  d.explanation.slice(0, 100) + (d.explanation.length > 100 ? "…" : ""),
    });
  });

  // ── All decisions (non-growth)
  decList.forEach((raw, i) => {
    const d = toDecision(raw);
    if (!d) return;
    if (d.decision_type.includes("growth") || d.decision_type.includes("opportunity")) return;
    events.push({
      id:        `dec-${i}`,
      kind:      "decision",
      timestamp: d.date,
      title:     d.decision_type.replace(/_/g, " "),
      subtitle:  d.explanation,
    });
  });

  // ── Agent last-activity events
  agentList.forEach((raw) => {
    const a = toAgent(raw);
    if (!a || !a.last_activity) return;
    events.push({
      id:        `agent-${a.name}`,
      kind:      "agent_run",
      timestamp: a.last_activity,
      title:     `${a.name} executed`,
      subtitle:  `${a.tasks_completed} tasks completed · ${a.reports_generated} reports generated`,
      agent:     a.name,
    });
  });

  // ── Non-brain report events
  reportList.forEach((r, i) => {
    const filename = getReportFilename(r);
    if (!filename) return;                        // skip malformed items
    const fn       = filename.toLowerCase();
    if (fn.includes("ai-report-") || fn.includes("brain")) return;

    const date = getReportDate(r);
    if (!date) return;                            // skip if no date (can't place on timeline)
    events.push({
      id:        `rep-${i}`,
      kind:      "report",
      timestamp: `${date}T12:00:00Z`,
      title:     `Report generated: ${getReportType(r)}`,
      subtitle:  filename,
    });
  });

  // ── Risk scan event
  if (risks?.evaluated_at) {
    const crit = risks.risks.filter((r) => r.severity === "critical" || r.severity === "high").length;
    events.push({
      id:        "risk-scan",
      kind:      "risk_scan",
      timestamp: risks.evaluated_at,
      title:     "Risk scan completed",
      subtitle:  crit > 0
        ? `${crit} high-severity risk${crit > 1 ? "s" : ""} found`
        : `${risks.risks.length} risks evaluated — none critical`,
    });
  }

  // ── Auto-created tasks event
  if (risks && risks.tasks_created > 0) {
    events.push({
      id:        "tasks-created",
      kind:      "task_created",
      timestamp: risks.evaluated_at,
      title:     `${risks.tasks_created} task${risks.tasks_created > 1 ? "s" : ""} auto-created`,
      subtitle:  "Generated by risk detection agent",
    });
  }

  // De-duplicate by id, sort newest first
  const seen = new Set<string>();
  return events
    .filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    })
    .sort((a, b) => {
      const ta = new Date(a.timestamp).getTime();
      const tb = new Date(b.timestamp).getTime();
      // Push invalid timestamps to the bottom
      if (isNaN(ta) && isNaN(tb)) return 0;
      if (isNaN(ta)) return 1;
      if (isNaN(tb)) return -1;
      return tb - ta;
    })
    .slice(0, 50);
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AIActivityFeed() {
  const decisions  = useBrainFetch<unknown[]>    ("/api/admin/ai/decisions", "decisions");
  const supervisor = useBrainFetch<SupervisorData>("/api/admin/ai/agents",    "supervisor");
  const reports    = useBrainFetch<unknown[]>    ("/api/admin/ai/reports",   "reports");
  const risks      = useBrainFetch<unknown>      ("/api/admin/ai/risks",     "risks");

  const anyLoading = decisions.loading || supervisor.loading || reports.loading || risks.loading;
  const anyError   = decisions.error   || supervisor.error   || reports.error   || risks.error;

  const events = useMemo(
    () => buildEvents(
      Array.isArray(decisions.data) ? decisions.data : [],
      supervisor.data,
      Array.isArray(reports.data)   ? reports.data   : [],
      risks.data,
    ),
    [decisions.data, supervisor.data, reports.data, risks.data],
  );

  function refetchAll() {
    decisions.refetch();
    supervisor.refetch();
    reports.refetch();
    risks.refetch();
  }

  // Count by kind for header summary
  const kindCounts = events.reduce<Partial<Record<EventKind, number>>>((acc, e) => {
    acc[e.kind] = (acc[e.kind] ?? 0) + 1;
    return acc;
  }, {});

  if (anyLoading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-3 h-3 rounded-full mt-1 shrink-0" />
              <Skeleton className="flex-1 h-14 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (anyError) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold">Activity Feed</p>
        <p className="text-xs text-red-500">{anyError}</p>
        <button
          onClick={refetchAll}
          className="text-xs px-3 py-1 rounded border hover:bg-muted transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold text-sm">Activity Feed</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(Object.entries(kindCounts) as [EventKind, number][]).map(([kind, n]) => {
            const cfg = EVENT_CONFIG[kind];
            return (
              <span
                key={kind}
                className={`text-xs font-medium px-1.5 py-0.5 rounded ${cfg.bg}`}
              >
                {cfg.icon} {n}
              </span>
            );
          })}
          <span className="text-xs text-muted-foreground ml-1">{events.length} total</span>
        </div>
      </div>

      {events.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No activity recorded yet. Run the AI Brain to generate events.
        </p>
      )}

      {/* Timeline */}
      <div className="max-h-[520px] overflow-y-auto pr-1">
        <ol className="relative space-y-0">
          {events.map((ev, i) => {
            const c    = EVENT_CONFIG[ev.kind];
            const last = i === events.length - 1;
            return (
              <li key={ev.id} className="flex gap-3">
                {/* Spine */}
                <div className="flex flex-col items-center">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${c.dot}`} />
                  {!last && <div className="w-px flex-1 bg-border mt-1" />}
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 space-y-0.5 ${last ? "pb-0" : "pb-4"}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${c.bg}`}>
                      {c.icon} {c.label}
                    </span>
                    {ev.agent && (
                      <span className="text-xs text-muted-foreground font-medium">{ev.agent}</span>
                    )}
                    <time className="text-xs text-muted-foreground ml-auto shrink-0">
                      {formatRelative(ev.timestamp)}
                    </time>
                  </div>
                  <p className="text-sm font-medium capitalize">{ev.title}</p>
                  {ev.subtitle && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{ev.subtitle}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

    </div>
  );
}
