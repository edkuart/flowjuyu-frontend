"use client";

import Link from "next/link";
import type { ElementType } from "react";
import {
  Plus,
  Clapperboard,
  Loader2,
  Film,
  ImagePlus,
  MessageSquareText,
  Sparkles,
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
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[18px] border border-[var(--seller-line)] bg-white shadow-[var(--seller-shadow-panel)]">
        <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
          <div className="p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:color-mix(in_srgb,var(--seller-accent)_10%,white)] text-[var(--seller-accent)]">
                <Clapperboard className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-faint-text)]">
                  Video Studio
                </p>
                <h1 className="text-lg font-semibold tracking-tight text-[var(--seller-ink)] sm:text-xl">
                  Videos de producto con brief inteligente
                </h1>
              </div>
            </div>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[var(--seller-muted)] sm:text-sm">
              Crea videos sociales con producto, referencias visuales y un brief corto que se convierte en prompt profesional.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/seller/video-studio/new"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--seller-accent)] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90 sm:text-sm"
              >
                <Plus className="h-4 w-4" />
                Nuevo video
              </Link>
              {latestProject && (
                <Link
                  href={`/seller/video-studio/${latestProject.id}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--seller-line)] bg-white px-3 py-2 text-[11px] font-semibold text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
                >
                  Continuar último
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--seller-line)] bg-[var(--seller-panel)] px-3 py-2 text-[11px] font-semibold text-[var(--seller-muted)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--seller-accent)]" />
                Prompt profesional automatico
              </span>
            </div>
          </div>

          <div className="border-t border-[var(--seller-line)] bg-[var(--seller-panel)] p-3 lg:border-l lg:border-t-0">
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
