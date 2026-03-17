"use client";

import { useState } from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type TaskInner = {
  id:           string;
  title:        string;
  description?: string;
  priority?:    string;
  status?:      string;
  created_at?:  string;
  agent?:       string;
  tags?:        string[];
};

type TaskFile = {
  file:  string;
  stage: string;
  task:  TaskInner | null;
};

type TasksData = {
  inbox:       TaskFile[];
  in_progress: TaskFile[];
  done:        TaskFile[];
};

type StageFilter = "all" | "in_progress" | "inbox" | "done";

// ── Style maps ─────────────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  high:     "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  medium:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  low:      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
};

const STAGE_CONFIG: Record<string, { badge: string; dot: string; label: string; ring: string }> = {
  inbox:       { dot: "bg-blue-400",   ring: "border-blue-300",   badge: "bg-muted text-muted-foreground",                                                  label: "Inbox"       },
  in_progress: { dot: "bg-yellow-400", ring: "border-yellow-400", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",            label: "In Progress" },
  done:        { dot: "bg-green-500",  ring: "border-green-400",  badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",                label: "Done"        },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Task Drawer ────────────────────────────────────────────────────────────────

function TaskDrawer({ entry, onClose }: { entry: TaskFile; onClose: () => void }) {
  const t = entry.task;
  const s = STAGE_CONFIG[entry.stage] ?? STAGE_CONFIG.inbox;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-background border-l shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
            <h2 className="font-semibold text-sm">Task Details</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {!t ? (
            <p className="text-sm text-muted-foreground">No task data available for this file.</p>
          ) : (
            <>
              {/* Title */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Title</p>
                <p className="text-sm font-semibold leading-relaxed">{t.title}</p>
              </div>

              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs border-0 ${s.badge}`}>{s.label}</Badge>
                {t.priority && (
                  <Badge className={`text-xs border-0 ${PRIORITY_STYLES[t.priority] ?? "bg-muted text-muted-foreground"}`}>
                    {t.priority} priority
                  </Badge>
                )}
                {t.status && (
                  <Badge variant="outline" className="text-xs">{t.status}</Badge>
                )}
                {t.tags && t.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>

              {/* Task ID */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Task ID</p>
                <p className="text-xs font-mono bg-muted px-2 py-1.5 rounded break-all select-all">{t.id}</p>
              </div>

              {/* Description */}
              {t.description && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.description}</p>
                </div>
              )}

              {/* Agent + Created row */}
              <div className="grid grid-cols-2 gap-4">
                {t.agent && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Assigned Agent</p>
                    <p className="text-sm font-medium">{t.agent}</p>
                  </div>
                )}
                {t.created_at && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Created</p>
                    <p className="text-sm">{new Date(t.created_at).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{relativeTime(t.created_at)}</p>
                  </div>
                )}
              </div>

              {/* Stage timeline */}
              <div className="space-y-2 pt-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Pipeline Stage</p>
                <div className="flex items-center gap-0">
                  {(["inbox", "in_progress", "done"] as const).map((stage, idx) => {
                    const sc = STAGE_CONFIG[stage];
                    const stageOrder = ["inbox", "in_progress", "done"];
                    const currentIdx = stageOrder.indexOf(entry.stage);
                    const isPast    = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={stage} className="flex items-center">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          isCurrent ? `${sc.badge} ${sc.ring} border` :
                          isPast    ? "bg-muted/40 text-muted-foreground border-border" :
                                      "bg-muted/20 text-muted-foreground/50 border-border/50"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isCurrent || isPast ? sc.dot : "bg-muted-foreground/30"}`} />
                          {sc.label}
                        </div>
                        {idx < 2 && (
                          <div className={`w-4 h-px mx-0.5 ${isPast || isCurrent ? "bg-border" : "bg-border/30"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Source file */}
              <div className="space-y-1 pt-2 border-t">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Source File</p>
                <p className="text-xs font-mono bg-muted px-2 py-1.5 rounded break-all">{entry.file}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Task Row ───────────────────────────────────────────────────────────────────

function TaskRow({ entry, onClick }: { entry: TaskFile; onClick: () => void }) {
  const s = STAGE_CONFIG[entry.stage] ?? STAGE_CONFIG.inbox;
  const t = entry.task;
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 p-3 rounded-md border hover:bg-muted/60 transition-colors group"
    >
      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${s.dot}`} />
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">{t?.title ?? entry.file}</span>
          {t?.priority && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${PRIORITY_STYLES[t.priority] ?? "bg-muted text-muted-foreground"}`}>
              {t.priority}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {t?.description && (
            <p className="text-xs text-muted-foreground truncate flex-1">{t.description}</p>
          )}
          {t?.created_at && (
            <span className="text-xs text-muted-foreground/70 shrink-0 hidden sm:block">
              {relativeTime(t.created_at)}
            </span>
          )}
          {t?.agent && (
            <span className="text-xs text-muted-foreground/70 shrink-0 hidden md:block">
              {t.agent}
            </span>
          )}
        </div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${s.badge}`}>{s.label}</span>
    </button>
  );
}

// ── Stage filter tab ────────────────────────────────────────────────────────────

function FilterTab({
  label, count, active, onClick,
}: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-full border transition-colors font-medium ${
        active
          ? "bg-foreground text-background border-foreground"
          : "hover:bg-muted/60 border-border text-muted-foreground"
      }`}
    >
      {label} ({count})
    </button>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AITaskInspector() {
  const { data, loading, error, refetch } =
    useBrainFetch<TasksData>("/api/admin/ai/tasks", "tasks");

  const [selected, setSelected] = useState<TaskFile | null>(null);
  const [filter,   setFilter]   = useState<StageFilter>("all");

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-36" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold">Task Inspector</p>
        <p className="text-xs text-red-500">{error ?? "No data available."}</p>
        <button onClick={refetch} className="text-xs px-3 py-1 rounded border hover:bg-muted transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const inboxTasks      = data.inbox       ?? [];
  const inProgressTasks = data.in_progress ?? [];
  const doneTasks       = data.done        ?? [];

  // in_progress first so active tasks appear at top
  const all: TaskFile[] = [...inProgressTasks, ...inboxTasks, ...doneTasks];

  const filtered = filter === "all"        ? all
    : filter === "in_progress" ? inProgressTasks
    : filter === "inbox"       ? inboxTasks
    :                            doneTasks;

  return (
    <>
      <div className="bg-card border rounded-lg p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-0.5">
            <h2 className="font-semibold text-sm">Task Inspector</h2>
            <p className="text-xs text-muted-foreground">{all.length} task{all.length !== 1 ? "s" : ""} in pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            {inProgressTasks.length > 0 && (
              <Badge className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0">
                {inProgressTasks.length} active
              </Badge>
            )}
            {inboxTasks.length > 0 && (
              <Badge variant="secondary">{inboxTasks.length} inbox</Badge>
            )}
            {doneTasks.length > 0 && (
              <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
                {doneTasks.length} done
              </Badge>
            )}
          </div>
        </div>

        {/* Stage filter */}
        {all.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <FilterTab label="All"         count={all.length}              active={filter === "all"}         onClick={() => setFilter("all")}         />
            <FilterTab label="In Progress" count={inProgressTasks.length}  active={filter === "in_progress"} onClick={() => setFilter("in_progress")} />
            <FilterTab label="Inbox"       count={inboxTasks.length}       active={filter === "inbox"}       onClick={() => setFilter("inbox")}       />
            <FilterTab label="Done"        count={doneTasks.length}        active={filter === "done"}        onClick={() => setFilter("done")}        />
          </div>
        )}

        {/* Task list */}
        {all.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks in queue.</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks in this stage.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filtered.map((entry, i) => (
              <TaskRow key={i} entry={entry} onClick={() => setSelected(entry)} />
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">Click any task to inspect its details.</p>
      </div>

      {/* Drawer portal */}
      {selected && (
        <TaskDrawer entry={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
