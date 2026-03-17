"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge }    from "@/components/ui/badge";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type AgentStatus = {
  name:              string;
  enabled:           boolean;
  role:              string;
  status:            "active" | "idle" | "disabled";
  tasks_completed:   number;
  reports_generated: number;
  last_activity:     string | null;
};

type SupervisorData = {
  agents:        AgentStatus[];
  total_tasks:   number;
  total_reports: number;
  evaluated_at:  string;
};

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AgentStatus["status"], {
  dot:    string;
  pulse:  boolean;
  badge:  string;
  label:  string;
  border: string;
}> = {
  active: {
    dot:    "bg-green-500",
    pulse:  true,
    badge:  "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0",
    label:  "Active",
    border: "border-green-200 dark:border-green-800",
  },
  idle: {
    dot:    "bg-yellow-400",
    pulse:  false,
    badge:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0",
    label:  "Idle",
    border: "",
  },
  disabled: {
    dot:    "bg-muted-foreground/40",
    pulse:  false,
    badge:  "bg-muted text-muted-foreground border-0",
    label:  "Disabled",
    border: "",
  },
};

// ── Metric bar ──────────────────────────────────────────────────────────────────

function MetricBar({ label, value, max, color }: {
  label: string;
  value: number;
  max:   number;
  color: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums font-medium text-foreground">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AIAgentsSupervisor() {
  const { data, loading, error, refetch } =
    useBrainFetch<SupervisorData>("/api/admin/ai/agents", "supervisor");

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-44" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold">Agent Supervisor</p>
        <p className="text-xs text-red-500">{error ?? "No data available."}</p>
        <button onClick={refetch} className="text-xs px-3 py-1 rounded border hover:bg-muted transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const activeCount = data.agents.filter((a) => a.status === "active").length;
  const maxTasks    = Math.max(...data.agents.map((a) => a.tasks_completed),   1);
  const maxReports  = Math.max(...data.agents.map((a) => a.reports_generated), 1);

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold text-sm">Agent Supervisor</h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {activeCount} active
          </span>
          <span>·</span>
          <span>{data.agents.length} total</span>
          <span>·</span>
          <span>{data.total_reports} reports</span>
          <span>·</span>
          <span>{data.total_tasks} tasks</span>
        </div>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {data.agents.map((agent) => {
          const s = STATUS_CONFIG[agent.status];
          return (
            <div
              key={agent.name}
              className={`border rounded-md p-3 space-y-3 ${s.border} ${
                agent.status === "disabled" ? "opacity-55" : ""
              }`}
            >
              {/* Agent name + status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    {s.pulse && (
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${s.dot} opacity-60`} />
                    )}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${s.dot}`} />
                  </span>
                  <span className="text-sm font-semibold truncate">{agent.name}</span>
                </div>
                <Badge className={`text-xs shrink-0 ${s.badge}`}>{s.label}</Badge>
              </div>

              {/* Role */}
              <p className="text-xs text-muted-foreground capitalize -mt-1">
                {agent.role.replace(/-/g, " ")}
              </p>

              {/* Metric bars */}
              <div className="space-y-2">
                <MetricBar
                  label="Tasks"
                  value={agent.tasks_completed}
                  max={maxTasks}
                  color="bg-blue-400"
                />
                <MetricBar
                  label="Reports"
                  value={agent.reports_generated}
                  max={maxReports}
                  color="bg-violet-400"
                />
              </div>

              {/* Last activity */}
              <p className="text-xs text-muted-foreground/70 truncate">
                {agent.last_activity
                  ? `Last active ${new Date(agent.last_activity).toLocaleString()}`
                  : "No activity recorded"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-right">
        Evaluated at {new Date(data.evaluated_at).toLocaleTimeString()}
      </p>

    </div>
  );
}
