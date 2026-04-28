"use client";

import Link from "next/link";
import { Clapperboard, Clock, CheckCircle2, AlertCircle, Loader2, Film } from "lucide-react";
import type { VideoProject } from "@/types/video-studio";

const OBJECTIVE_LABELS: Record<string, string> = {
  product: "Producto",
  promo: "Promoción",
  live: "Live",
  collection: "Colección",
};

const FORMAT_LABELS: Record<string, string> = {
  "9:16": "9:16 · Stories",
  "1:1": "1:1 · Feed",
  "16:9": "16:9 · Landscape",
};

function GenerationBadge({ status }: { status?: string }) {
  if (!status) return null;

  if (status === "completed")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Listo
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
        <AlertCircle className="h-3 w-3" /> Error
      </span>
    );
  if (["queued", "validating", "generating", "processing_output"].includes(status))
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
        <Loader2 className="h-3 w-3 animate-spin" /> Generando
      </span>
    );
  return null;
}

export default function VideoProjectCard({ project }: { project: VideoProject }) {
  const hasPreview = project.last_generation?.preview_url || project.thumbnail_url;
  const genStatus = project.last_generation?.status;
  const timeAgo = new Date(project.updated_at).toLocaleDateString("es-MX", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <Link
      href={`/seller/video-studio/${project.id}`}
      className="group flex flex-col overflow-hidden rounded-[16px] border border-[var(--seller-line)] bg-white shadow-[var(--seller-shadow-panel)] transition hover:border-[var(--seller-line-strong)] hover:shadow-[0_8px_32px_-12px_rgba(15,61,58,0.18)]"
    >
      {/* Thumbnail */}
      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-[var(--seller-panel)] sm:h-36">
        {hasPreview ? (
          <img
            src={project.last_generation?.preview_url ?? project.thumbnail_url ?? ""}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[var(--seller-faint-text)]">
            <Film className="h-8 w-8" />
            <span className="text-xs">Sin preview</span>
          </div>
        )}
        <div className="absolute left-2.5 top-2.5">
          <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {FORMAT_LABELS[project.format] ?? project.format}
          </span>
        </div>
        {genStatus && (
          <div className="absolute right-2.5 top-2.5">
            <GenerationBadge status={genStatus} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug text-[var(--seller-ink)] line-clamp-2">
            {project.title}
          </p>
          <span className="shrink-0 rounded-full border border-[var(--seller-line)] px-2 py-0.5 text-[10px] font-medium text-[var(--seller-muted)]">
            {OBJECTIVE_LABELS[project.objective] ?? project.objective}
          </span>
        </div>
        {project.template_name && (
          <p className="text-[11px] text-[var(--seller-faint-text)]">{project.template_name}</p>
        )}
        <div className="mt-auto flex items-center gap-1 pt-1.5 text-[11px] text-[var(--seller-faint-text)]">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </div>
      </div>
    </Link>
  );
}
