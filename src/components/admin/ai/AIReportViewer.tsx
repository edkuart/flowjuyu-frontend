"use client";

import { useCallback, useState } from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type ReportMeta = {
  filename: string;
  type:     string;
  date:     string | null;
  preview?: string;
};

type ReportContent = {
  content:  string;
  filename: string;
};

// ── Raw-item normalizer ────────────────────────────────────────────────────────
// The /api/admin/ai/reports endpoint may return items in several shapes:
//   • plain string:             "ai-report-2024-01-15.md"
//   • { filename, type, date }: standard shape
//   • { file, type, date }:     backend uses "file" instead of "filename"
//   • { name, ... }:            backend uses "name"
//   • { path, ... }:            full path — basename used as filename
// Returns null for anything that produces no usable filename (skip it).

function normalizeReport(raw: unknown): ReportMeta | null {
  // Plain string — treat the whole string as the filename
  if (typeof raw === "string") {
    const name = raw.trim();
    return name ? { filename: name, type: guessType(name), date: null } : null;
  }

  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;

  // Resolve the filename from several possible field names
  const filename =
    str(obj, "filename") ||
    str(obj, "file")     ||
    str(obj, "name")     ||
    basename(str(obj, "path"));

  if (!filename) return null;

  return {
    filename,
    type:    str(obj, "type") || guessType(filename),
    date:    str(obj, "date") || null,
    preview: str(obj, "preview") || str(obj, "summary") || undefined,
  };
}

// Field helpers
function str(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  return typeof v === "string" ? v.trim() : "";
}

function basename(path: string): string {
  if (!path) return "";
  return path.split(/[\\/]/).pop() ?? "";
}

function guessType(filename: string): string {
  if (filename.includes("intelligence")) return "intelligence";
  if (filename.includes("risk"))         return "risk";
  if (filename.includes("growth"))       return "growth";
  if (filename.includes("seller"))       return "seller";
  if (filename.includes("brain"))        return "brain";
  return "report";
}

// ── Date parsing from filename ─────────────────────────────────────────────────
// Handles patterns like: ai-report-2024-01-15.md, report_20240115.md, brain-2024-01-15T10-30.md

function parseDateFromFilename(filename: string | undefined | null): string | null {
  if (!filename || typeof filename !== "string") return null;
  // ISO date: 2024-01-15
  const isoMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) {
    try {
      return new Date(isoMatch[1]).toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric",
      });
    } catch { /* ignore */ }
  }
  // Compact: 20240115
  const compactMatch = filename.match(/(\d{4})(\d{2})(\d{2})/);
  if (compactMatch) {
    try {
      return new Date(`${compactMatch[1]}-${compactMatch[2]}-${compactMatch[3]}`).toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric",
      });
    } catch { /* ignore */ }
  }
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ── Markdown renderer ──────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function syntaxHighlight(code: string, lang: string): string {
  let html = escapeHtml(code);
  const kw = ["const", "let", "var", "function", "return", "if", "else", "for", "while",
               "import", "export", "from", "type", "interface", "class", "async", "await",
               "null", "undefined", "true", "false", "new", "this", "of", "in"];
  if (["js", "ts", "javascript", "typescript"].includes(lang)) {
    html = html.replace(/(\/\/[^\n]*)/g, '<span class="text-zinc-500 italic">$1</span>');
    html = html.replace(/("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`)/g, '<span class="text-green-400">$1</span>');
    html = html.replace(
      new RegExp(`\\b(${kw.join("|")})\\b`, "g"),
      '<span class="text-purple-400 font-semibold">$1</span>',
    );
    html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="text-blue-400">$1</span>');
  }
  if (lang === "json") {
    html = html.replace(/("(?:\\.|[^"])*")\s*:/g, '<span class="text-blue-300">$1</span>:');
    html = html.replace(/:\s*("(?:\\.|[^"])*")/g, ': <span class="text-green-400">$1</span>');
    html = html.replace(/\b(true|false|null)\b/g, '<span class="text-purple-400">$1</span>');
    html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="text-yellow-400">$1</span>');
  }
  return html;
}

type Block =
  | { type: "code"; lang: string; html: string; raw: string }
  | { type: "text"; lines: string[] };

function parseMarkdown(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = md.split("\n");
  let i = 0;
  let textLines: string[] = [];

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (textLines.length > 0) {
        blocks.push({ type: "text", lines: textLines });
        textLines = [];
      }
      const lang = line.slice(3).trim().toLowerCase();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      const raw = codeLines.join("\n");
      blocks.push({ type: "code", lang, raw, html: syntaxHighlight(raw, lang) });
    } else {
      textLines.push(line);
    }
    i++;
  }
  if (textLines.length > 0) blocks.push({ type: "text", lines: textLines });
  return blocks;
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>');
}

function MarkdownBlock({ block }: { block: Block }) {
  if (block.type === "code") {
    return (
      <div className="rounded-md overflow-hidden border border-zinc-700 my-3">
        {block.lang && (
          <div className="bg-zinc-800 px-3 py-1 text-xs text-zinc-400 font-mono border-b border-zinc-700">
            {block.lang}
          </div>
        )}
        <pre className="bg-zinc-900 p-3 overflow-x-auto text-xs font-mono leading-relaxed">
          <code
            dangerouslySetInnerHTML={{ __html: block.html || escapeHtml(block.raw) }}
          />
        </pre>
      </div>
    );
  }

  return (
    <div>
      {block.lines.map((line, i) => {
        if (line.startsWith("# ")) {
          return (
            <h1
              key={i}
              className="text-xl font-bold mt-5 mb-2"
              dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }}
            />
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="text-base font-bold mt-4 mb-1.5 pb-1 border-b"
              dangerouslySetInnerHTML={{ __html: renderInline(line.slice(3)) }}
            />
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3
              key={i}
              className="text-sm font-semibold mt-3 mb-1"
              dangerouslySetInnerHTML={{ __html: renderInline(line.slice(4)) }}
            />
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li
              key={i}
              className="text-sm text-muted-foreground ml-4 list-disc leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }}
            />
          );
        }
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }
        return (
          <p
            key={i}
            className="text-sm text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderInline(line) }}
          />
        );
      })}
    </div>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  const blocks = parseMarkdown(content);
  return (
    <div className="space-y-0.5">
      {blocks.map((b, i) => <MarkdownBlock key={i} block={b} />)}
    </div>
  );
}

// ── Download helper ────────────────────────────────────────────────────────────

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Report list item ───────────────────────────────────────────────────────────

function ReportListItem({
  report, selected, onClick,
}: {
  report: ReportMeta; selected: boolean; onClick: () => void;
}) {
  const parsedDate = report.date ?? parseDateFromFilename(report.filename);

  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full text-left px-4 py-3 border-b text-sm transition-colors hover:bg-muted/60 ${
          selected ? "bg-muted" : ""
        }`}
      >
        <p className="font-medium truncate text-xs">{report.filename}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground capitalize">{report.type}</span>
          {parsedDate && (
            <span className="text-xs text-muted-foreground">· {parsedDate}</span>
          )}
        </div>
        {report.preview && (
          <p className="text-xs text-muted-foreground/70 mt-1 truncate">{report.preview}</p>
        )}
      </button>
    </li>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

export default function AIReportViewer() {
  const { data: rawReports, loading, error, refetch } =
    useBrainFetch<unknown[]>("/api/admin/ai/reports", "reports");

  // Normalize every raw item — skip anything that yields no usable filename
  const reports: ReportMeta[] = (Array.isArray(rawReports) ? rawReports : [])
    .map(normalizeReport)
    .filter((r): r is ReportMeta => r !== null);

  const [selected,  setSelected]  = useState<ReportMeta | null>(null);
  const [content,   setContent]   = useState<string | null>(null);
  const [fetching,  setFetching]  = useState(false);
  const [fetchErr,  setFetchErr]  = useState<string | null>(null);

  const loadReport = useCallback(async (meta: ReportMeta) => {
    setSelected(meta);
    setContent(null);
    setFetchErr(null);
    setFetching(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token.");
      const res = await fetch(`${API_BASE}/api/admin/ai/reports/${encodeURIComponent(meta.filename)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const body = await res.json() as { ok: boolean; content?: string; report?: ReportContent };
      const text = body.content ?? (body.report as ReportContent | undefined)?.content ?? null;
      if (!text) throw new Error("Empty report content");
      setContent(text);
    } catch (e) {
      setFetchErr(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setFetching(false);
    }
  }, []);

  // ── Loading ──
  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-md" />)}
        </div>
      </div>
    );
  }

  if (error || !rawReports) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold">Report Viewer</p>
        <p className="text-xs text-red-500">{error ?? "No data available."}</p>
        <button onClick={refetch} className="text-xs px-3 py-1 rounded border hover:bg-muted transition-colors">
          Retry
        </button>
      </div>
    );
  }

  // Derived content stats
  const contentBytes = content ? new TextEncoder().encode(content).length : null;
  const contentWords = content ? wordCount(content) : null;
  const readingMins  = contentWords ? Math.max(1, Math.round(contentWords / 200)) : null;

  return (
    <div className="bg-card border rounded-lg overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-sm">Report Viewer</h2>
        <Badge variant="secondary">{reports.length} report{reports.length !== 1 ? "s" : ""}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] divide-y md:divide-y-0 md:divide-x">

        {/* Report list */}
        <div className="overflow-y-auto max-h-[520px]">
          {reports.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No reports yet.</p>
          ) : (
            <ul>
              {reports.map((r, i) => (
                <ReportListItem
                  key={r.filename || i}
                  report={r}
                  selected={selected?.filename === r.filename}
                  onClick={() => loadReport(r)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Report content */}
        <div className="flex flex-col min-h-[320px]">
          {!selected && (
            <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground text-sm">
              Select a report to preview its contents.
            </div>
          )}

          {selected && (
            <>
              {/* Content toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30 shrink-0 gap-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-xs font-medium truncate">{selected.filename}</p>
                  {contentBytes !== null && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatFileSize(contentBytes)}
                    </span>
                  )}
                  {readingMins !== null && (
                    <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                      · ~{readingMins} min read
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {contentWords !== null && (
                    <span className="text-xs text-muted-foreground hidden md:block">
                      {contentWords.toLocaleString()} words
                    </span>
                  )}
                  {content && (
                    <button
                      onClick={() => downloadText(content, selected.filename)}
                      className="text-xs px-3 py-1 rounded border hover:bg-muted transition-colors"
                    >
                      ↓ Download
                    </button>
                  )}
                </div>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto p-4 max-h-[460px]">
                {fetching && (
                  <div className="space-y-3 animate-pulse">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className={`h-3 rounded bg-muted ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
                    ))}
                  </div>
                )}
                {fetchErr && (
                  <p className="text-sm text-red-500">{fetchErr}</p>
                )}
                {content && !fetching && (
                  <MarkdownRenderer content={content} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
