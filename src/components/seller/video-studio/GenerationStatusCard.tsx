"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2, CheckCircle2, AlertCircle, XCircle, Clock, Download, Eye, RefreshCw,
  Trash2,
} from "lucide-react";
import {
  pollVideoGeneration,
  cancelVideoGeneration,
  deleteVideoGeneration,
  downloadVideoGeneration,
} from "@/services/sellerVideoStudio";
import type { VideoGeneration } from "@/types/video-studio";

const STATUS_LABELS: Record<string, string> = {
  queued: "En cola…",
  validating: "Validando assets…",
  generating: "Generando video con IA…",
  processing_output: "Procesando resultado…",
  completed: "¡Video listo!",
  failed: "Falló la generación",
  cancelled: "Cancelado",
  expired: "Expirado",
};

const ACTIVE_STATUSES = new Set(["queued", "validating", "generating", "processing_output"]);

const POLL_INTERVALS = [3000, 3000, 5000, 5000, 8000, 10000, 15000, 30000];

interface Props {
  generation: VideoGeneration;
  onComplete?: (g: VideoGeneration) => void;
  onDelete?: (id: string) => void;
}

export default function GenerationStatusCard({ generation: initial, onComplete, onDelete }: Props) {
  const [gen, setGen] = useState<VideoGeneration>(initial);
  const [pollStopped, setPollStopped] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const pollRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startPolling(current: VideoGeneration) {
    pollRef.current = 0;
    setPollStopped(false);

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      try {
        const updated = await pollVideoGeneration(current.id);
        if (cancelled) return;
        setGen(updated);
        if (!ACTIVE_STATUSES.has(updated.status)) {
          onComplete?.(updated);
          return;
        }
      } catch (err: any) {
        const msg: string = err?.message ?? "";
        if (/\b(401|403|404)\b/.test(msg)) {
          if (!cancelled) setPollStopped(true);
          return;
        }
      }
      const delay = POLL_INTERVALS[Math.min(pollRef.current, POLL_INTERVALS.length - 1)];
      pollRef.current++;
      timerRef.current = setTimeout(poll, delay);
    };

    timerRef.current = setTimeout(poll, POLL_INTERVALS[0]);
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }

  useEffect(() => {
    if (!ACTIVE_STATUSES.has(gen.status)) return;
    return startPolling(gen);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gen.id, gen.status]);

  const isActive = ACTIVE_STATUSES.has(gen.status);

  const isImageUrl = (url: string) => /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url);

  async function handleDownload() {
    setDownloading(true);
    setActionError(null);
    try {
      const blob = await downloadVideoGeneration(gen.id);
      const ext = blob.type.includes("webm")
        ? "webm"
        : blob.type.includes("image/")
          ? blob.type.split("/")[1]
          : "mp4";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `flowjuyu-video-${gen.id}.${ext}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e: any) {
      setActionError(e.message ?? "No se pudo descargar");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    setActionError(null);
    try {
      await deleteVideoGeneration(gen.id);
      onDelete?.(gen.id);
    } catch (e: any) {
      setActionError(e.message ?? "No se pudo eliminar");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--seller-line)] bg-white p-3 shadow-[var(--seller-shadow-panel)]">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
          ${gen.status === "completed" ? "bg-emerald-50 text-emerald-600" :
            gen.status === "failed" || gen.status === "cancelled" || gen.status === "expired" ? "bg-red-50 text-red-500" :
            "bg-amber-50 text-amber-600"}`}>
          {gen.status === "completed" ? <CheckCircle2 className="h-5 w-5" /> :
           gen.status === "failed" || gen.status === "expired" ? <AlertCircle className="h-5 w-5" /> :
           gen.status === "cancelled" ? <XCircle className="h-5 w-5" /> :
           <Loader2 className="h-5 w-5 animate-spin" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--seller-ink)]">
            {STATUS_LABELS[gen.status] ?? gen.status}
          </p>
          {gen.prompt_snapshot && (
            <p className="mt-0.5 text-xs text-[var(--seller-muted)] line-clamp-2">
              "{gen.prompt_snapshot}"
            </p>
          )}
          {gen.error_message && (
            <p className="mt-1 text-xs text-red-500">{gen.error_message}</p>
          )}

          {/* Progress bar */}
          {isActive && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--seller-panel)]">
              <div
                className="h-full rounded-full bg-[var(--seller-accent)] transition-all duration-700"
                style={{
                  width: gen.status === "queued" ? "12%" :
                         gen.status === "validating" ? "28%" :
                         gen.status === "generating" ? "62%" :
                         gen.status === "processing_output" ? "88%" : "100%",
                }}
              />
            </div>
          )}

          {/* Output media for completed generations */}
          {gen.status === "completed" && gen.output_url && (
            <div className="mt-3 overflow-hidden rounded-xl border border-[var(--seller-line)] bg-black">
              {isImageUrl(gen.output_url) ? (
                <img src={gen.output_url} alt="Resultado" className="w-full object-contain max-h-64" />
              ) : (
                <video
                  src={gen.output_url}
                  controls
                  playsInline
                  className="w-full max-h-64 object-contain"
                  poster={gen.preview_url ?? undefined}
                />
              )}
            </div>
          )}

          {/* Fallback: preview image when no output */}
          {gen.status === "completed" && !gen.output_url && gen.preview_url && (
            <div className="mt-3 overflow-hidden rounded-xl border border-[var(--seller-line)]">
              <img src={gen.preview_url} alt="Preview" className="w-full object-cover" />
            </div>
          )}

          {/* Actions */}
          {gen.status === "completed" && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {gen.output_url && (
                <a
                  href={gen.output_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--seller-line)] bg-white px-3 py-2 text-xs font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
                >
                  <Eye className="h-3.5 w-3.5" /> Ver
                </a>
              )}
              {gen.output_url && (
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--seller-accent)] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  Descargar
                </button>
              )}
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                  confirmDelete
                    ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-[var(--seller-line)] bg-white text-[var(--seller-muted)] hover:bg-red-50 hover:text-red-600"
                }`}
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                {confirmDelete ? "Confirmar" : "Borrar"}
              </button>
              {gen.storage_path && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  CDN propio
                </span>
              )}
              {gen.file_size_bytes && (
                <span className="text-[10px] text-[var(--seller-faint-text)]">
                  {(gen.file_size_bytes / (1024 * 1024)).toFixed(1)} MB
                </span>
              )}
            </div>
          )}

          {gen.status !== "completed" && !isActive && (
            <div className="mt-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                  confirmDelete
                    ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-[var(--seller-line)] bg-white text-[var(--seller-muted)] hover:bg-red-50 hover:text-red-600"
                }`}
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                {confirmDelete ? "Confirmar borrado" : "Borrar"}
              </button>
            </div>
          )}

          {actionError && (
            <p className="mt-2 text-xs text-red-500">{actionError}</p>
          )}

          {isActive && (
            <div className="mt-3 flex items-center gap-3">
              {pollStopped ? (
                <button
                  onClick={() => { setPollStopped(false); startPolling(gen); }}
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--seller-accent)] underline underline-offset-2 transition hover:opacity-80"
                >
                  <RefreshCw className="h-3 w-3" /> Reintentar conexión
                </button>
              ) : null}
              <button
                onClick={() => {
                  const cancelled = { ...gen, status: "cancelled" as const };
                  cancelVideoGeneration(gen.id).then(() => {
                    setGen(cancelled);
                    onComplete?.(cancelled);
                  });
                }}
                className="text-xs text-[var(--seller-muted)] underline underline-offset-2 transition hover:text-red-500"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[var(--seller-faint-text)]">
          <Clock className="h-3 w-3" />
          {new Date(gen.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
