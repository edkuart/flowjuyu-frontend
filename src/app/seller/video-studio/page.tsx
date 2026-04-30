"use client";

import Link from "next/link";
import type { ElementType } from "react";
import {
  Plus,
  Loader2,
  Film,
  ImagePlus,
  MessageSquareText,
  ArrowRight,
} from "lucide-react";
import { useVideoProjects } from "@/hooks/useVideoProjects";
import VideoProjectCard from "@/components/seller/video-studio/VideoProjectCard";
import { StudioBadge } from "@/components/seller/video-studio/StudioPrimitives";

export default function VideoStudioPage() {
  const { projects, loading, error } = useVideoProjects();
  const completedCount = projects.filter((p) => p.last_generation?.status === "completed").length;
  const activeCount = projects.filter((p) =>
    ["queued", "validating", "generating", "processing_output"].includes(p.last_generation?.status ?? "")
  ).length;
  const latestProject = projects[0];

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--seller-accent)] uppercase">
              Video Studio · Flowjuyu Seller
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--seller-ink)] sm:text-[28px] sm:leading-[1.05]">
              Videos de producto
            </h1>
            <p className="mt-1.5 max-w-[48ch] text-sm leading-relaxed text-[var(--seller-muted)]">
              Crea videos sociales con producto, referencias visuales y un brief corto que se convierte en prompt profesional.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/seller/video-studio/new"
                className="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-2xl bg-[var(--seller-accent)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_-14px_rgba(15,61,58,0.5)] transition-all hover:shadow-[0_14px_28px_-12px_rgba(15,61,58,0.6)] active:scale-[0.99]"
              >
                <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Plus className="h-4 w-4" />
                Nuevo video
              </Link>
              {latestProject && (
                <Link
                  href={`/seller/video-studio/${latestProject.id}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-[var(--seller-line-strong)] px-4 py-2.5 text-sm font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
                >
                  Continuar último
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>

          <div className="w-full rounded-2xl border border-[var(--seller-line)] bg-white p-4 sm:w-60 sm:shrink-0">
            <div className="grid grid-cols-3 gap-2">
              <MetricCard label="Proyectos" value={projects.length} tone="text-[var(--seller-accent)]" />
              <MetricCard label="Listos" value={completedCount} tone="text-emerald-600" />
              <MetricCard label="En proceso" value={activeCount} tone="text-amber-600" />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <StudioBadge tone="accent">Plantillas</StudioBadge>
              <StudioBadge>Visuales</StudioBadge>
              <StudioBadge>Generaciones</StudioBadge>
            </div>
          </div>
        </div>

      <div className="grid gap-2 md:grid-cols-3">
        <WorkflowCard
          icon={ImagePlus}
          title="1. Visuales"
          text="Productos, fotos de ambiente, empaque o logo."
          tone="bg-teal-50 text-teal-700 border-teal-100"
        />
        <WorkflowCard
          icon={MessageSquareText}
          title="2. Brief"
          text="Audiencia, beneficio, gancho, camara y CTA."
          tone="bg-amber-50 text-amber-700 border-amber-100"
        />
        <WorkflowCard
          icon={Film}
          title="3. Generacion"
          text="Proveedor, costo estimado y previews guardados."
          tone="bg-violet-50 text-violet-700 border-violet-100"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[var(--seller-faint-text)]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--seller-ink)]">Proyectos recientes</p>
              <p className="text-xs text-[var(--seller-muted)]">Abre un proyecto para revisar generaciones o ajustar el brief.</p>
            </div>
            <Link
              href="/seller/video-studio/new"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--seller-line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <VideoProjectCard key={p.id} project={p} />
            ))}
          </div>
        </>
      )}

      <div className="rounded-2xl border border-[var(--seller-line)] bg-[var(--seller-panel)] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-faint-text)]">
          Video Studio · Fase MVP
        </p>
        <p className="mt-1 text-xs text-[var(--seller-muted)] leading-relaxed">
          En esta fase el video se genera como simulación visual. La integración real con proveedores de IA (Luma, Runway, fal) se activará en la siguiente fase. Los proyectos y assets que guardes ahora se migrarán automáticamente.
        </p>
      </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-[var(--seller-line)] bg-white px-2.5 py-2">
      <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--seller-faint-text)] sm:text-[10px]">
        {label}
      </p>
      <p className={`mt-0.5 text-lg font-semibold leading-none sm:text-xl ${tone}`}>{value}</p>
    </div>
  );
}

function WorkflowCard({
  icon: Icon,
  title,
  text,
  tone,
}: {
  icon: ElementType;
  title: string;
  text: string;
  tone: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--seller-line)] bg-white p-3 shadow-[var(--seller-shadow-panel)]">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight text-[var(--seller-ink)]">{title}</p>
        <p className="mt-0.5 text-xs leading-snug text-[var(--seller-muted)]">{text}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-[28px] border border-dashed border-[var(--seller-line)] bg-[var(--seller-panel)] py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)] text-[var(--seller-accent)]">
        <Film className="h-7 w-7" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-semibold text-[var(--seller-ink)]">Aún no tienes proyectos de video</p>
        <p className="max-w-xs text-sm text-[var(--seller-muted)]">
          Crea tu primer video promocional eligiendo una plantilla y tus productos.
        </p>
      </div>
      <Link
        href="/seller/video-studio/new"
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--seller-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        Crear primer video
      </Link>
    </div>
  );
}
