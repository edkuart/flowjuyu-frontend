"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast }    from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

// ── Types ─────────────────────────────────────────────────────────────────────

type Scores = {
  generation_score:      number | null;
  score_specificity:     number | null;
  score_brand_alignment: number | null;
  score_readability:     number | null;
  score_seo_coverage:    number | null;
};

type PublishedItem = {
  variant_id:   string;
  content_body: string;
  content_type: string | null;
  language:     string;
  word_count:   number;
  status:       string;
  generated_at: string;
  scores:       Scores;
  item: {
    id:           string;
    subject_type: string;
    content_type: string;
    status:       string;
  } | null;
  product: {
    id:       string;
    nombre:   string;
    precio:   number;
    categoria: string | null;
    region:   string | null;
  } | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(s: number | null): string {
  return s == null ? "—" : (s * 100).toFixed(0);
}

function scoreColor(s: number | null): string {
  if (s == null) return "text-muted-foreground";
  if (s >= 0.75) return "text-green-600 dark:text-green-400";
  if (s >= 0.50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-GT", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="border rounded-md p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-4 w-10 ml-auto" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md ml-auto" />
      </div>
    </div>
  );
}

// ── Content card ──────────────────────────────────────────────────────────────

function ContentCard({
  item,
  onUsed,
}: {
  item:   PublishedItem;
  onUsed: (variantId: string) => void;
}) {
  const [expanded, setExpanded]   = useState(false);
  const [marking,  setMarking]    = useState(false);

  const score    = item.scores.generation_score;
  const typeLabel = (item.content_type ?? "contenido").replace(/_/g, " ");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(item.content_body);
      toast.success("Copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar");
    }
  }, [item.content_body]);

  const handleMarkUsed = useCallback(async () => {
    setMarking(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/ai/mark-used`, {
        method:  "POST",
        headers: authHeaders(),
        body:    JSON.stringify({ variant_id: item.variant_id, platform: "tiktok" }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      toast.success("Marcado como usado en TikTok");
      onUsed(item.variant_id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast.error(`No se pudo marcar: ${msg}`);
    } finally {
      setMarking(false);
    }
  }, [item.variant_id, onUsed]);

  return (
    <div className="border rounded-md p-4 space-y-3 text-sm bg-card">

      {/* ── Row 1: badges + score ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-xs capitalize">
          {typeLabel}
        </Badge>
        <Badge
          variant="secondary"
          className={`text-xs capitalize ${
            item.status === "published"
              ? "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300 border-0"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border-0"
          }`}
        >
          {item.status}
        </Badge>

        <span className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>{item.word_count}w</span>
          <span className={`font-semibold tabular-nums ${scoreColor(score)}`}>
            {fmt(score)}
          </span>
          <span>{fmtDate(item.generated_at)}</span>
        </span>
      </div>

      {/* ── Row 2: product name ── */}
      {item.product && (
        <p className="text-xs text-muted-foreground font-medium truncate">
          {item.product.nombre}
          {item.product.categoria && (
            <span className="ml-1 text-muted-foreground/60">· {item.product.categoria}</span>
          )}
        </p>
      )}

      {/* ── Row 3: content body ── */}
      <div>
        <p
          className={`leading-relaxed text-foreground/80 ${expanded ? "" : "line-clamp-3"}`}
        >
          {item.content_body}
        </p>
        {item.content_body.length > 180 && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        )}
      </div>

      {/* ── Row 4: score breakdown ── */}
      <div className="grid grid-cols-4 gap-1 pt-0.5">
        {([
          ["Esp",   item.scores.score_specificity],
          ["Brand", item.scores.score_brand_alignment],
          ["Lect",  item.scores.score_readability],
          ["SEO",   item.scores.score_seo_coverage],
        ] as [string, number | null][]).map(([label, val]) => (
          <div key={label} className="text-center">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-xs font-semibold tabular-nums ${scoreColor(val)}`}>
              {fmt(val)}
            </p>
          </div>
        ))}
      </div>

      {/* ── Row 5: actions ── */}
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copiar
        </button>

        <button
          onClick={handleMarkUsed}
          disabled={marking}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-black text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {marking ? (
            <svg
              className="w-3.5 h-3.5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
              />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {marking ? "Marcando…" : "Usado en TikTok"}
        </button>

        {item.product && (
          <a
            href={`/product/${item.product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Ver producto
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function AIPublishedContentPanel() {
  const [items,   setItems]   = useState<PublishedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const fetchedOnce = useRef(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/ai/published-content`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      const body = await res.json();
      if (!body.ok) throw new Error("Respuesta inesperada del servidor");
      setItems(body.content ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar contenido";
      console.error("[AIPublishedContentPanel]", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    fetchContent();
  }, [fetchContent]);

  const handleUsed = useCallback((variantId: string) => {
    // Optimistically remove from list after marking used
    setItems((prev) => prev.filter((i) => i.variant_id !== variantId));
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <section className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Contenido listo para publicar
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Variantes aprobadas y publicadas — listas para distribución
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!loading && items.length > 0 && (
            <Badge variant="secondary" className="text-xs tabular-nums">
              {items.length}
            </Badge>
          )}
          <button
            onClick={fetchContent}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="rounded-md border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No hay contenido listo para publicar
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Aprueba variantes en la cola de revisión para que aparezcan aquí
          </p>
        </div>
      )}

      {/* Content list */}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
          {items.map((item) => (
            <ContentCard
              key={item.variant_id}
              item={item}
              onUsed={handleUsed}
            />
          ))}
        </div>
      )}

    </section>
  );
}
