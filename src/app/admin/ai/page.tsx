"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Existing components
import AIAgentRunner  from "@/components/admin/ai/AIAgentRunner";
import AIInsights     from "@/components/admin/ai/AIInsights";
import AIReportsList  from "@/components/admin/ai/AIReportsList";
import AITasksList    from "@/components/admin/ai/AITasksList";

// Brain panels
import AIIntelligencePanel    from "@/components/admin/ai/AIIntelligencePanel";
import AIGrowthPanel          from "@/components/admin/ai/AIGrowthPanel";
import AISellerInsights       from "@/components/admin/ai/AISellerInsights";
import AIRiskPanel            from "@/components/admin/ai/AIRiskPanel";
import AIDecisionsPanel       from "@/components/admin/ai/AIDecisionsPanel";
import AIAgentsSupervisor     from "@/components/admin/ai/AIAgentsSupervisor";

// Extended panels
import AIMarketplaceHealthScore from "@/components/admin/ai/AIMarketplaceHealthScore";
import AISellerScorePanel       from "@/components/admin/ai/AISellerScorePanel";
import AITaskInspector          from "@/components/admin/ai/AITaskInspector";
import AIReportViewer           from "@/components/admin/ai/AIReportViewer";
import AIActivityFeed           from "@/components/admin/ai/AIActivityFeed";
import AIStrategyPanel          from "@/components/admin/ai/AIStrategyPanel";

// Business intelligence panels
import AIHomepageStrategyPanel from "@/components/admin/ai/AIHomepageStrategyPanel";
import AIMarketplaceSimulator  from "@/components/admin/ai/AIMarketplaceSimulator";
import AITrendPanel            from "@/components/admin/ai/AITrendPanel";
import AIAnomalyPanel          from "@/components/admin/ai/AIAnomalyPanel";
import AIWeeklyInsightsPanel   from "@/components/admin/ai/AIWeeklyInsightsPanel";

// ── Types ──────────────────────────────────────────────────────────────────────

type Report = {
  filename: string;
  type:     string;
  date:     string | null;
  preview?: string;
};

type Agent = {
  name:    string;
  enabled: boolean;
  role?:   string;
};

type Task = {
  file:  string;
  stage: string;
  task: {
    id:           string;
    title:        string;
    description?: string;
    priority?:    string;
    status?:      string;
  } | null;
};

type AIOverview = {
  status: {
    ai:        string;
    scheduler: string;
    agents:    Agent[];
    timestamp: string;
    sessions?: { last_run?: string };
  };
  reports: Report[];
  tasks: {
    inbox:       Task[];
    in_progress: Task[];
    done:        Task[];
  };
  memory: {
    bugs?: unknown[];
    [key: string]: unknown;
  };
};

type AlertSeverity = "healthy" | "warning" | "critical";

type HealthAlert = {
  id:       string;
  severity: AlertSeverity;
  message:  string;
};

// ── Toast ──────────────────────────────────────────────────────────────────────

type Toast = {
  id:      number;
  message: string;
  type:    "success" | "error" | "info";
};

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm
            pointer-events-auto transition-all
            ${t.type === "success" ? "bg-green-600 text-white"  : ""}
            ${t.type === "error"   ? "bg-red-600 text-white"    : ""}
            ${t.type === "info"    ? "bg-zinc-800 text-white"   : ""}
          `}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Constants ──────────────────────────────────────────────────────────────────

const API_BASE            = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";
const REFRESH_INTERVAL_MS = 30_000;

// ── Health check cards ─────────────────────────────────────────────────────────

type CheckStatus = "green" | "yellow" | "red";

type HealthCheck = {
  label:  string;
  value:  string;
  status: CheckStatus;
};

const CHECK_STYLES: Record<CheckStatus, {
  dot:   string;
  bg:    string;
  text:  string;
  value: string;
}> = {
  green:  { dot: "bg-green-500",  bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",   text: "text-green-700 dark:text-green-400",   value: "text-green-600 dark:text-green-400"   },
  yellow: { dot: "bg-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800", text: "text-yellow-700 dark:text-yellow-400", value: "text-yellow-600 dark:text-yellow-400" },
  red:    { dot: "bg-red-500",    bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",           text: "text-red-700 dark:text-red-400",       value: "text-red-600 dark:text-red-400"       },
};

function buildHealthChecks(
  overview:      AIOverview,
  inboxCount:    number,
): HealthCheck[] {
  const now      = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // 1. Analytics report today
  const analyticsToday = overview.reports.some(
    (r) => r.type === "analytics" && r.date === todayStr
  );

  // 2. Brain cycle recency
  const lastRun = overview.status.sessions?.last_run;
  let brainStatus: CheckStatus = "red";
  let brainValue  = "Never run";
  if (lastRun) {
    const hours = (now.getTime() - new Date(lastRun).getTime()) / (1_000 * 60 * 60);
    if (hours < 24)      { brainStatus = "green";  brainValue = `${Math.floor(hours)}h ago`; }
    else if (hours < 48) { brainStatus = "yellow"; brainValue = `${Math.floor(hours)}h ago`; }
    else                 { brainStatus = "red";    brainValue = `${Math.floor(hours)}h ago`; }
  }

  // 3. Task backlog
  let backlogStatus: CheckStatus;
  if      (inboxCount === 0)  backlogStatus = "green";
  else if (inboxCount <= 5)   backlogStatus = "yellow";
  else                        backlogStatus = "red";

  // 4. Active agents
  const agentCount   = overview.status.agents.length;
  const agentStatus: CheckStatus = agentCount > 0 ? "green" : "red";

  return [
    {
      label:  "Analytics Today",
      value:  analyticsToday ? "Generated" : "Missing",
      status: analyticsToday ? "green" : "red",
    },
    {
      label:  "Brain Cycle",
      value:  brainValue,
      status: brainStatus,
    },
    {
      label:  "Task Backlog",
      value:  `${inboxCount} pending`,
      status: backlogStatus,
    },
    {
      label:  "Active Agents",
      value:  `${agentCount} registered`,
      status: agentStatus,
    },
  ];
}

// ── Health alerts (detailed) ───────────────────────────────────────────────────

function evaluateHealth(overview: AIOverview, inboxCount: number): HealthAlert[] {
  const alerts: HealthAlert[] = [];
  const now      = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const lastRun = overview.status.sessions?.last_run;
  if (lastRun) {
    const hoursSince = (now.getTime() - new Date(lastRun).getTime()) / (1_000 * 60 * 60);
    if (hoursSince > 24) {
      alerts.push({
        id:       "scheduler-inactivity",
        severity: "warning",
        message:  `Scheduler has not run in ${Math.floor(hoursSince)} hours`,
      });
    }
  }

  const hasAnalyticsToday = overview.reports.some(
    (r) => r.type === "analytics" && r.date === todayStr
  );
  if (!hasAnalyticsToday) {
    alerts.push({
      id:       "no-analytics-today",
      severity: "warning",
      message:  `No analytics report generated today (${todayStr})`,
    });
  }

  if (inboxCount > 5) {
    alerts.push({
      id:       "task-backlog",
      severity: "warning",
      message:  `Task backlog detected (${inboxCount} pending inbox tasks)`,
    });
  }

  if (overview.status.agents.length === 0) {
    alerts.push({
      id:       "no-agents",
      severity: "critical",
      message:  "No active AI agents registered",
    });
  }

  const bugs = overview.memory.bugs;
  if (Array.isArray(bugs) && bugs.length > 0) {
    alerts.push({
      id:       "memory-errors",
      severity: "warning",
      message:  `${bugs.length} memory error${bugs.length === 1 ? "" : "s"} detected`,
    });
  }

  return alerts;
}

// ── HealthMonitor ──────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<
  AlertSeverity,
  { border: string; bg: string; icon: string; text: string }
> = {
  healthy:  { border: "border-green-200 dark:border-green-800",   bg: "bg-green-50 dark:bg-green-950/30",   icon: "✓", text: "text-green-700 dark:text-green-400"  },
  warning:  { border: "border-yellow-200 dark:border-yellow-800", bg: "bg-yellow-50 dark:bg-yellow-950/30", icon: "⚠", text: "text-yellow-700 dark:text-yellow-400" },
  critical: { border: "border-red-200 dark:border-red-800",       bg: "bg-red-50 dark:bg-red-950/30",       icon: "✕", text: "text-red-700 dark:text-red-400"       },
};

function HealthMonitor({
  checks,
  alerts,
}: {
  checks: HealthCheck[];
  alerts: HealthAlert[];
}) {
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount  = alerts.filter((a) => a.severity === "warning").length;
  const isHealthy     = alerts.length === 0;

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold text-sm">AI Health Monitor</h2>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
              {warningCount} warning{warningCount > 1 ? "s" : ""}
            </span>
          )}
          {isHealthy && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              All systems healthy
            </span>
          )}
        </div>
      </div>

      {/* Status indicator cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {checks.map((c) => {
          const s = CHECK_STYLES[c.status];
          return (
            <div key={c.label} className={`border rounded-md p-3 space-y-2 ${s.bg}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                <span className={`text-xs font-medium ${s.text}`}>{c.label}</span>
              </div>
              <p className={`text-sm font-semibold ${s.value}`}>{c.value}</p>
            </div>
          );
        })}
      </div>

      {/* Alert list */}
      {!isHealthy && (
        <ul className="space-y-2">
          {[...alerts]
            .sort((a, b) => a.severity === "critical" ? -1 : b.severity === "critical" ? 1 : 0)
            .map((alert) => {
              const s = SEVERITY_STYLES[alert.severity];
              return (
                <li key={alert.id} className={`flex items-center gap-2.5 p-3 rounded-md border ${s.border} ${s.bg}`}>
                  <span className={`font-bold text-base leading-none ${s.text}`}>{s.icon}</span>
                  <p className={`text-sm ${s.text}`}>{alert.message}</p>
                </li>
              );
            })}
        </ul>
      )}

    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function statusColor(value: string): string {
  if (value === "ok" || value === "active" || value === "running") return "text-green-500";
  if (value === "idle") return "text-yellow-500";
  return "text-red-500";
}

function StatusDot({ value }: { value: string }) {
  const color =
    value === "ok" || value === "active" || value === "running" ? "bg-green-500" :
    value === "idle" ? "bg-yellow-400" : "bg-red-500";
  return <span className={`inline-block w-2 h-2 rounded-full ${color} mr-1.5`} />;
}

// ── Section divider ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        {children}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin h-3.5 w-3.5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
    </svg>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-36 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-48 rounded-lg" />
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AdminAIPage() {
  const [overview,     setOverview]     = useState<AIOverview | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null);
  const [brainRunning, setBrainRunning] = useState(false);
  const [toasts,       setToasts]       = useState<Toast[]>([]);
  const toastId = useRef(0);

  // ── Toast helper ───────────────────────────────────────────────────────────

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // ── Overview fetch ─────────────────────────────────────────────────────────

  const fetchOverview = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found. Please log in again.");

      const res = await fetch(`${API_BASE}/api/admin/ai/overview`, {
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed (${res.status}): ${text}`);
      }

      const body = await res.json();
      if (!body.ok || !body.ai) throw new Error("Unexpected response shape from /overview");

      setOverview(body.ai as AIOverview);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load AI overview";
      console.error("[AdminAIPage]", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOverview]);

  // ── Brain cycle trigger ────────────────────────────────────────────────────

  const handleRunBrain = useCallback(async () => {
    if (brainRunning) return;
    setBrainRunning(true);
    addToast("AI Brain cycle starting…", "info");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found.");

      const res = await fetch(`${API_BASE}/api/admin/ai/brain`, {
        method:  "POST",
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Brain cycle failed (${res.status}): ${text}`);
      }

      const body  = await res.json();
      const cycle = body.cycle ?? {};

      addToast(
        `Brain cycle completed in ${cycle.duration_ms ?? "?"}ms. ` +
        `Report: ${cycle.report_file ?? "none"}`,
        "success"
      );

      fetchOverview();
    } catch (err: unknown) {
      addToast(
        err instanceof Error ? err.message : "Brain cycle failed",
        "error"
      );
    } finally {
      setBrainRunning(false);
    }
  }, [brainRunning, addToast, fetchOverview]);

  // ── Render states ──────────────────────────────────────────────────────────

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="border border-red-300 bg-red-50 dark:bg-red-950/30 rounded-lg p-5 flex flex-col gap-3">
          <span className="text-red-600 font-semibold text-sm">Error loading AI Control Center</span>
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchOverview(); }}
            className="self-start px-4 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  // ── Derived data ───────────────────────────────────────────────────────────

  const { status, reports, tasks } = overview;

  const inboxTasks      = tasks?.inbox       ?? [];
  const inProgressTasks = tasks?.in_progress ?? [];
  const doneTasks       = tasks?.done        ?? [];
  const allTasks        = [...inboxTasks, ...inProgressTasks, ...doneTasks];
  const totalTasks      = allTasks.length;

  const latestReports = reports.slice(0, 5);
  const latestTasks   = allTasks.slice(0, 5);

  const healthChecks = buildHealthChecks(overview, inboxTasks.length);
  const healthAlerts = evaluateHealth(overview, inboxTasks.length);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">

        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Flowjuyu AI Control Center
            </h1>
            <p className="text-muted-foreground text-sm">
              Monitor and control marketplace AI agents
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}

            {/* Brain cycle trigger */}
            <button
              onClick={handleRunBrain}
              disabled={brainRunning}
              className={`
                inline-flex items-center gap-1.5 px-4 py-1.5 text-xs rounded font-medium transition-colors
                ${brainRunning
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                }
              `}
            >
              {brainRunning && <Spinner />}
              {brainRunning ? "Running Brain…" : "⚡ Run AI Brain"}
            </button>

            {/* Overview refresh */}
            <button
              onClick={() => { setLoading(true); fetchOverview(); }}
              className="px-3 py-1.5 text-xs rounded border hover:bg-muted transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* ── HEALTH MONITOR ───────────────────────────────────────────────── */}
        <HealthMonitor checks={healthChecks} alerts={healthAlerts} />

        {/* ── MARKETPLACE HEALTH SCORE ──────────────────────────────────────── */}
        <AIMarketplaceHealthScore />

        {/* ── STATUS CARDS ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="bg-card border rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">AI Engine</p>
            <p className={`text-lg font-semibold flex items-center ${statusColor(status.ai)}`}>
              <StatusDot value={status.ai} />{status.ai}
            </p>
          </div>

          <div className="bg-card border rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Scheduler</p>
            <p className={`text-lg font-semibold flex items-center ${statusColor(status.scheduler)}`}>
              <StatusDot value={status.scheduler} />{status.scheduler}
            </p>
          </div>

          <div className="bg-card border rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Agents</p>
            <p className="text-2xl font-bold">{status.agents.length}</p>
            <p className="text-xs text-muted-foreground">registered</p>
          </div>

          <div className="bg-card border rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Task Queue</p>
            <p className="text-2xl font-bold">{totalTasks}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{inboxTasks.length} inbox</span>
              <span>·</span>
              <span>{inProgressTasks.length} active</span>
            </div>
          </div>

        </div>

        {/* ── TASKS + REPORTS PREVIEW ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Task Queue</h2>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary">{inboxTasks.length} inbox</Badge>
                <Badge variant="outline">{inProgressTasks.length} active</Badge>
              </div>
            </div>
            {latestTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending tasks</p>
            ) : (
              <ul className="space-y-1.5">
                {latestTasks.map((t) => (
                  <li key={t.file} className="flex items-center gap-2 text-sm">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      t.stage === "in_progress" ? "bg-yellow-400" :
                      t.stage === "done"        ? "bg-green-400"  : "bg-blue-400"
                    }`} />
                    <span className="truncate">{t.task?.title ?? t.file}</span>
                  </li>
                ))}
                {totalTasks > 5 && (
                  <p className="text-xs text-muted-foreground pt-1">
                    +{totalTasks - 5} more tasks
                  </p>
                )}
              </ul>
            )}
          </div>

          <div className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Latest Reports</h2>
              <Badge variant="secondary">{reports.length} total</Badge>
            </div>
            {latestReports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reports yet</p>
            ) : (
              <ul className="space-y-1.5">
                {latestReports.map((r) => (
                  <li key={r.filename} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                    <span className="truncate">{r.filename}</span>
                    {r.date && (
                      <span className="text-xs text-muted-foreground shrink-0 ml-auto">{r.date}</span>
                    )}
                  </li>
                ))}
                {reports.length > 5 && (
                  <p className="text-xs text-muted-foreground pt-1">
                    +{reports.length - 5} more reports
                  </p>
                )}
              </ul>
            )}
          </div>

        </div>

        {/* ── REGISTERED AGENTS ────────────────────────────────────────────── */}
        <div className="bg-card border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-sm">Registered Agents</h2>
          <div className="flex flex-wrap gap-2">
            {status.agents.map((agent) => (
              <Badge key={agent.name} variant="outline" className="text-xs">
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${agent.enabled ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                {agent.name}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Last heartbeat: {new Date(status.timestamp).toLocaleString()}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        <SectionLabel>AI Brain — Intelligence</SectionLabel>
        <AIIntelligencePanel />

        <SectionLabel>AI Brain — Growth</SectionLabel>
        <AIGrowthPanel />

        <SectionLabel>AI Brain — Sellers</SectionLabel>
        <AISellerInsights />
        <AISellerScorePanel />

        <SectionLabel>AI Brain — Risks</SectionLabel>
        <AIRiskPanel />

        <SectionLabel>AI Brain — Decisions</SectionLabel>
        <AIDecisionsPanel />

        <SectionLabel>AI Brain — Supervisor</SectionLabel>
        <AIAgentsSupervisor />

        {/* ══════════════════════════════════════════════════════════════════ */}
        <SectionLabel>Task Inspector</SectionLabel>
        <AITaskInspector />

        <SectionLabel>Report Viewer</SectionLabel>
        <AIReportViewer />

        <SectionLabel>Activity Feed</SectionLabel>
        <AIActivityFeed />

        <SectionLabel>Strategy</SectionLabel>
        <AIStrategyPanel />

        {/* ══════════════════════════════════════════════════════════════════ */}
        <SectionLabel>Weekly Insights</SectionLabel>
        <AIWeeklyInsightsPanel />

        <SectionLabel>Trend Engine</SectionLabel>
        <AITrendPanel />

        <SectionLabel>Anomaly Detection</SectionLabel>
        <AIAnomalyPanel />

        <SectionLabel>Homepage AI Engine</SectionLabel>
        <AIHomepageStrategyPanel />

        <SectionLabel>Marketplace Simulator</SectionLabel>
        <AIMarketplaceSimulator />

        {/* ══════════════════════════════════════════════════════════════════ */}
        <SectionLabel>Existing Tools</SectionLabel>

        <AIInsights />
        <AIAgentRunner />
        <AIReportsList />
        <AITasksList />

      </div>

      <ToastContainer toasts={toasts} />
    </>
  );
}
