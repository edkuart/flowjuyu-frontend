"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, ShieldCheck, Star } from "lucide-react";
import {
  Area,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { BaseCard } from "@/components/ui/BaseCard";
import { Button } from "@/components/ui/button";
import { SellerDetailPanel, SellerIconBadge, SellerPill, SellerSurfaceCard } from "@/components/seller/ui/SellerPrimitives";
import {
  interpretMetric,
  type MetricInterpretation,
} from "@/lib/metricInterpreter";
import type { ExecutiveSummary, PerformanceAlert } from "@/lib/sellerPerformance";
import type {
  Analytics,
  PriorityInsight,
  ReviewInsights,
  SellerMetricsAction,
  SellerMetricsStat,
} from "@/components/seller/metrics/types";

const BADGE_CLASSES: Record<"red" | "amber" | "green", string> = {
  red: "border border-red-100 bg-red-50 text-red-600",
  amber: "border border-amber-100 bg-amber-50 text-amber-600",
  green: "border border-emerald-100 bg-emerald-50 text-emerald-600",
};

const SEVERITY_STYLES: Record<
  PriorityInsight["severity"],
  { border: string; badge: string }
> = {
  critical: {
    border: "border-2 border-red-300",
    badge: "border border-red-100 bg-red-50 text-red-600",
  },
  high: {
    border: "border-2 border-amber-300",
    badge: "border border-amber-100 bg-amber-50 text-amber-700",
  },
  medium: {
    border: "border-2 border-blue-200",
    badge: "border border-blue-100 bg-blue-50 text-blue-600",
  },
  ok: {
    border: "border border-emerald-200",
    badge: "border border-emerald-100 bg-emerald-50 text-emerald-700",
  },
};

const SEVERITY_LABELS: Record<PriorityInsight["severity"], string> = {
  critical: "Punto clave",
  high: "Lectura principal",
  medium: "Senal destacada",
  ok: "Ritmo del negocio",
};

type DateFormat = "day" | "short" | "long";

export function formatChartDate(
  label: unknown,
  format: DateFormat = "short",
): string {
  const raw = typeof label === "string" ? label : String(label ?? "");
  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) return raw;
  if (format === "day") return String(date.getDate());

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    ...(format === "short"
      ? { month: "2-digit" }
      : { month: "long", year: "numeric" }),
  });
}

export function InterpBadge({ interp }: { interp: MetricInterpretation }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${BADGE_CLASSES[interp.color]}`}
    >
      {interp.label}
    </span>
  );
}

export function MetricsSectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <SellerSurfaceCard tone="soft" className="p-5">
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--seller-muted)] uppercase">
          {eyebrow}
        </p>
        <h2 className="text-lg font-semibold text-[var(--seller-ink)]">{title}</h2>
        <p className="text-sm leading-relaxed text-[var(--seller-text)]">
          {description}
        </p>
      </div>
    </SellerSurfaceCard>
  );
}

export function SellerMetricsExecutiveHeader({
  totalViews,
  totalIntentions,
  conversionPercent,
  totalReviews,
}: {
  totalViews: number;
  totalIntentions: number;
  conversionPercent: number;
  totalReviews: number;
}) {
  const chips = [
    {
      label: "Visibilidad",
      value: `${totalViews}`,
      note: totalViews > 0 ? "Movimiento detectado" : "Sin trafico aun",
    },
    {
      label: "Interacciones",
      value: `${totalIntentions}`,
      note: totalIntentions > 0 ? "Interes activo" : "Todavia sin senales",
    },
    {
      label: "Conversion",
      value: `${conversionPercent}%`,
      note: conversionPercent > 0 ? "Lectura comercial" : "Etapa inicial",
    },
    {
      label: "Resenas",
      value: `${totalReviews}`,
      note: totalReviews > 0 ? "Confianza visible" : "Aun sin feedback",
    },
  ];

  const businessRead =
    totalViews === 0
      ? "La tienda esta en fase de arranque y todavia necesitamos primeras senales de visibilidad."
      : conversionPercent >= 5
        ? "El negocio ya muestra interes real y la lectura ejecutiva se centra en sostener el ritmo."
        : "Ya existe movimiento en la tienda, y la prioridad es convertir esa atencion en interes mas claro.";

  return (
    <BaseCard
      className="relative overflow-hidden border border-[#0F3D3A]/10 bg-[linear-gradient(135deg,#0F3D3A_0%,#14544f_52%,#1d756d_100%)] text-white shadow-[0_24px_60px_rgba(15,61,58,0.18)]"
      contentClassName="relative space-y-6 p-4 sm:space-y-8 sm:p-5"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-[-5%] h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-[-3rem] h-48 w-48 rounded-full bg-emerald-200/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.05))]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] xl:items-end">
        <div className="min-w-0 space-y-4">
          <div className="inline-flex max-w-full self-start rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-white/72 uppercase backdrop-blur sm:text-[11px]">
            Metricas seller
          </div>

          <div className="min-w-0 space-y-2.5 sm:space-y-3">
            <h1 className="max-w-3xl text-[1.8rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-4xl">
              Una lectura ejecutiva para seguir el pulso de tu tienda
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/82 sm:text-[15px]">
              {businessRead}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 sm:gap-2.5">
            {chips.map((chip) => (
              <div
                key={chip.label}
                className="min-w-0 rounded-[1.15rem] border border-white/14 bg-white/9 px-3.5 py-3 backdrop-blur sm:rounded-[1.35rem] sm:px-4"
              >
                <p className="text-[10px] font-semibold tracking-[0.14em] text-white/62 uppercase">
                  {chip.label}
                </p>
                <div className="mt-1.5 min-w-0 space-y-0.5">
                  <p className="text-[1.45rem] leading-none font-semibold text-white sm:text-2xl">
                    {chip.value}
                  </p>
                  <span className="block text-[11px] leading-relaxed text-white/55">
                    {chip.note}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-[1.5rem] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.07))] p-4 backdrop-blur-md sm:rounded-[2rem] sm:p-5">
          <div className="min-w-0 space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-white/62 uppercase">
              Contexto corto
            </p>
            <p className="text-base leading-snug font-semibold text-white sm:text-lg">
              El panel abre con perspectiva general y deja el detalle para una
              segunda capa.
            </p>
            <p className="text-sm leading-relaxed text-white/74">
              La idea es ayudarte a leer primero la historia del negocio y solo
              despues entrar al detalle por seccion.
            </p>
          </div>
        </div>
      </div>
    </BaseCard>
  );
}

export function SellerMetricsOnboardingBanner({
  label,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  label: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <BaseCard
      className="border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-emerald-50"
      contentClassName="space-y-4"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-2">
          <span className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-amber-700 uppercase">
            {label}
          </span>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">
              {title}
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-neutral-600">
              {description}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
          <Link href={ctaHref} className="w-full sm:w-auto">
            <Button className="min-h-10 w-full px-4 sm:w-auto">
              {ctaLabel}
            </Button>
          </Link>
          <Link href="/seller/products/new" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="min-h-10 w-full px-4 sm:w-auto"
            >
              Publicar producto
            </Button>
          </Link>
        </div>
      </div>
    </BaseCard>
  );
}

export function PriorityInsightBanner({
  insight,
  summary,
}: {
  insight: PriorityInsight;
  summary?: ExecutiveSummary;
}) {
  const styles = SEVERITY_STYLES[insight.severity];
  const summaryTone = summary
    ? summary.tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : summary.tone === "warning"
        ? "bg-amber-50 text-amber-700"
        : "bg-neutral-100 text-neutral-600"
    : "";
  const summaryLabel = summary
    ? summary.tone === "success"
      ? "Saludable"
      : summary.tone === "warning"
        ? "Atencion"
        : "Contexto"
    : "";

  return (
    <BaseCard
      hover
      className={`overflow-hidden ${styles.border} bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_68%)]`}
      contentClassName="space-y-4 p-4 sm:space-y-5 sm:p-5"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="hidden h-10 w-1.5 shrink-0 rounded-full bg-[#0F3D3A]/14 sm:block" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex self-start rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase ${styles.badge}`}
            >
              {SEVERITY_LABELS[insight.severity]}
            </span>
            {summary && (
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${summaryTone}`}
              >
                {summaryLabel}
              </span>
            )}
            <span className="text-[11px] font-medium text-neutral-400">
              Señal prioritaria del panel
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base leading-snug font-semibold text-neutral-900 sm:text-[1.65rem]">
              {insight.title}
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-neutral-600 sm:text-[15px]">
              {insight.description}
            </p>
            {summary && (
              <p className="max-w-3xl text-xs leading-relaxed text-neutral-500 sm:text-sm">
                {summary.title}. {summary.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-neutral-100/80 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-xs leading-relaxed text-neutral-500 sm:text-sm">
          Un solo foco visible para leer el momento del negocio sin duplicar
          mensajes en la parte superior.
        </p>
        {insight.cta.href !== "#" && (
          <Link
            href={insight.cta.href}
            className="inline-flex w-full sm:w-auto"
          >
            <Button
              size="sm"
              className="min-h-10 w-full rounded-full bg-[#0F3D3A] px-4 hover:bg-[#0c2f2c] sm:w-auto"
            >
              {insight.cta.label}
            </Button>
          </Link>
        )}
      </div>
    </BaseCard>
  );
}

export function SellerTopSignalPanel({
  summary,
  insight,
  actions,
}: {
  summary: ExecutiveSummary;
  insight: PriorityInsight;
  actions: SellerMetricsAction[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
      <div className="min-w-0">
        <PriorityInsightBanner insight={insight} summary={summary} />
      </div>

      <SellerNextStepsPanel actions={actions} />
    </div>
  );
}

export function SellerMetricsKpiIntro() {
  return (
    <div className="flex items-center gap-2 px-1 pt-1 sm:gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#0F3D3A]/18 to-[#0F3D3A]/10" />
      <p className="shrink-0 text-[10px] font-semibold tracking-[0.16em] text-neutral-500 uppercase sm:text-[11px]">
        Senales clave
      </p>
      <div className="h-px flex-1 bg-gradient-to-r from-[#0F3D3A]/10 via-[#0F3D3A]/18 to-transparent" />
    </div>
  );
}

export function DashboardStatCard({
  title,
  value,
  context,
  icon,
  interpretation,
}: SellerMetricsStat) {
  const valueColor = interpretation
    ? interpretation.color === "red"
      ? "text-red-500"
      : interpretation.color === "amber"
        ? "text-amber-600"
        : "text-emerald-700"
    : "text-neutral-900";

  return (
    <BaseCard
      hover
      className="h-full border-white/80 bg-white/90 shadow-[0_14px_30px_rgba(15,23,42,0.04)]"
      padding="none"
      contentClassName="flex h-full flex-col gap-2.5 p-3 sm:gap-4 sm:p-5"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-neutral-50 md:h-12 md:w-12">
          {icon}
        </div>
        <p className="min-w-0 text-[10px] font-semibold tracking-[0.12em] text-neutral-500 uppercase sm:text-[11px]">
          {title}
        </p>
      </div>
      <div className="space-y-1.5 sm:space-y-2.5">
        <p
          className={`text-[1.65rem] leading-none font-semibold sm:text-[2rem] ${valueColor}`}
        >
          {value}
        </p>
      </div>
      {interpretation && interpretation.color !== "green" && (
        <div className="hidden sm:block">
          <InterpBadge interp={interpretation} />
        </div>
      )}
      <p className="line-clamp-1 text-[11px] leading-snug text-neutral-600 sm:line-clamp-3 sm:text-sm sm:leading-relaxed">
        {context}
      </p>
    </BaseCard>
  );
}

export function MetricsMiniCard({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50"
      : tone === "warning"
        ? "border-amber-100 bg-amber-50"
        : "border-[var(--seller-line)] bg-[var(--seller-panel-soft)]";

  return (
    <div className={`rounded-[var(--seller-radius-xl)] border px-4 py-4 ${toneClass}`}>
      <p className="text-[11px] font-semibold tracking-[0.12em] text-[var(--seller-muted)] uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[var(--seller-ink)]">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--seller-text)]">{detail}</p>
    </div>
  );
}

export function SellerNextStepsPanel({
  actions,
}: {
  actions: SellerMetricsAction[];
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleActions = actions.slice(0, 3);
  const previewActions = visibleActions.slice(0, 2);
  const hiddenCount = Math.max(visibleActions.length - previewActions.length, 0);

  return (
    <div className="relative">
      <div className="absolute inset-x-4 top-0 h-16 rounded-full bg-[radial-gradient(circle,_rgba(15,61,58,0.08),_transparent_72%)] blur-2xl sm:inset-x-8" />
      <BaseCard
        className="relative overflow-hidden border-white/80 bg-white/82 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur"
        contentClassName="space-y-4 p-4 sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
              Próximos pasos
            </p>
            <h2 className="text-base font-semibold text-neutral-900">
              {visibleActions.length} acciones sugeridas
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600">
              Acciones para mejorar tu tienda ordenadas por prioridad e impacto.
            </p>
          </div>
          <SellerPill tone="neutral" className="px-2.5 py-1 text-[11px]">
            {visibleActions.length} pasos
          </SellerPill>
        </div>

        <div className="space-y-2.5">
          {previewActions.map((action) => (
            <Link
              key={`${action.href}-${action.label}`}
              href={action.href}
              className="group flex items-center gap-3 rounded-[1.2rem] border border-neutral-100 bg-white/80 px-3 py-3 transition hover:border-[#0F3D3A]/12 hover:bg-white"
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  action.priority === "high"
                    ? "bg-red-400"
                    : action.priority === "medium"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                }`}
              />
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900 group-hover:text-[#0F3D3A]">
                {action.label}
              </p>
              <ArrowRight className="h-4 w-4 shrink-0 text-neutral-400 transition group-hover:text-[#0F3D3A]" />
            </Link>
          ))}
        </div>

        {visibleActions.length > 0 && (
          <div className="space-y-3 border-t border-neutral-100 pt-3">
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="flex w-full items-center justify-between rounded-[1.1rem] bg-neutral-50 px-3 py-2.5 text-left transition hover:bg-neutral-100"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {expanded ? "Ocultar detalle" : "Ver más acciones"}
                </p>
                <p className="text-xs text-neutral-500">
                  {expanded
                    ? "Cierra el panel para volver al resumen compacto."
                    : hiddenCount > 0
                      ? `${hiddenCount} acción${hiddenCount === 1 ? "" : "es"} más con contexto y prioridad.`
                      : "Abre el panel para ver contexto y prioridad."}
                </p>
              </div>
              <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[var(--seller-accent)]">
                {expanded ? "Menos" : "Abrir"}
              </span>
            </button>

            {expanded && (
              <div className="space-y-2">
                {visibleActions.map((action) => (
                  <Link
                    key={`expanded-${action.href}-${action.label}`}
                    href={action.href}
                    className="group flex items-start gap-3 rounded-[1.1rem] border border-neutral-100 bg-white/88 px-3 py-3 transition hover:border-[#0F3D3A]/12 hover:bg-white"
                  >
                    <span
                      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        action.priority === "high"
                          ? "bg-red-50 text-red-600"
                          : action.priority === "medium"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {action.priority === "high"
                        ? "Alta"
                        : action.priority === "medium"
                          ? "Siguiente"
                          : "Sugerida"}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium break-words text-neutral-900 group-hover:text-[#0F3D3A]">
                        {action.label}
                      </p>
                      <p className="text-xs leading-relaxed text-neutral-500">
                        {actionDescription(action)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </BaseCard>
    </div>
  );
}

export function DashboardActionCard({
  action,
}: {
  action: SellerMetricsAction;
}) {
  const badgeClass =
    action.priority === "high"
      ? "border-red-100 bg-red-50 text-red-600"
      : action.priority === "medium"
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : "border-neutral-200 bg-neutral-50 text-neutral-600";

  return (
    <BaseCard
      hover
      className="h-full"
      contentClassName="flex h-full flex-col gap-4"
    >
      <SellerIconBadge className="md:h-11 md:w-11">
        <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
      </SellerIconBadge>
      <div className="space-y-2.5">
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClass}`}>
          {action.priority === "high"
            ? "Alta prioridad"
            : action.priority === "medium"
              ? "Siguiente paso"
              : "Accion recomendada"}
        </span>
        <h3 className="line-clamp-2 text-base leading-snug font-semibold text-neutral-900">
          {action.label}
        </h3>
        <p className="text-sm leading-relaxed text-neutral-600">
          {actionDescription(action)}
        </p>
      </div>
      <div className="pt-1">
        <Link href={action.href} className="inline-flex">
          <Button variant="outline" className="min-h-10 px-4">
            Ir ahora
          </Button>
        </Link>
      </div>
    </BaseCard>
  );
}

export function TrendChartCard({
  totalTrend,
  growthPercent,
  bestDay,
  data,
  isMobile,
}: {
  totalTrend: number;
  growthPercent: number;
  bestDay: string | null;
  data: Analytics["last30Days"];
  isMobile: boolean;
}) {
  return (
    <BaseCard hover contentClassName="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
            Tendencia 30 dias
          </p>
          <h3 className="text-lg leading-snug font-semibold text-neutral-900">
            Evolucion de visibilidad
          </h3>
          <p className="text-sm leading-relaxed text-neutral-600">
            {bestDay
              ? `Mejor dia: ${formatChartDate(bestDay, "long")}.`
              : "Todavia no hay un pico claro en el periodo."}
          </p>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl bg-neutral-50 px-4 py-3">
          <span className="text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
            Acumulado
          </span>
          <span className="text-2xl font-bold text-neutral-900">
            {totalTrend}
          </span>
          <InterpBadge interp={interpretMetric("growth", growthPercent)} />
        </div>
      </div>

      {data.length > 0 ? (
        <div className="h-[260px] sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 12, left: -16, bottom: 18 }}
            >
              <defs>
                <linearGradient
                  id="productGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                interval={isMobile ? 5 : 0}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  formatChartDate(value, isMobile ? "day" : "short")
                }
              />
              <YAxis
                tick={{ fontSize: 11 }}
                width={35}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                }}
                labelFormatter={(label) => formatChartDate(label, "long")}
                formatter={(value, name) => [`${value}`, String(name)]}
              />
              <Area
                type="natural"
                dataKey="product_views"
                stroke="none"
                fill="url(#productGradient)"
                legendType="none"
              />
              <Line
                type="natural"
                dataKey="product_views"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
                name="Vistas productos"
                animationDuration={800}
              />
              <Line
                type="natural"
                dataKey="profile_views"
                stroke="#6b7280"
                strokeWidth={1.5}
                opacity={0.5}
                dot={false}
                name="Visitas perfil"
              />
              {!isMobile && <Legend wrapperStyle={{ fontSize: 12 }} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="rounded-2xl bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-400">
          Aun no hay datos suficientes para mostrar tendencia.
        </p>
      )}
    </BaseCard>
  );
}

export function ReviewSnapshotCard({
  reviewInsights,
  totalReviews,
}: {
  reviewInsights: ReviewInsights;
  totalReviews: number;
}) {
  return (
    <BaseCard hover contentClassName="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
            Reputacion
          </p>
          <h3 className="text-lg leading-snug font-semibold text-neutral-900">
            Snapshot de confianza
          </h3>
          <p className="text-sm leading-relaxed text-neutral-600">
            {totalReviews === 0
              ? "Aun no tienes resenas. Cuando empiecen a llegar, aqui veras confianza y riesgo sin saturacion."
              : `${reviewInsights.recent_reviews_count} resenas en los ultimos 30 dias.`}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3">
          <Star className="h-5 w-5 text-amber-500" />
          <div className="min-w-0">
            <p className="text-2xl font-bold text-neutral-900">
              {reviewInsights.rating_avg
                ? reviewInsights.rating_avg.toFixed(1)
                : "—"}
            </p>
            <p className="text-xs text-neutral-500">
              {totalReviews} resena{totalReviews !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InfoTile
          icon={<Star className="h-4 w-4 text-amber-500" />}
          label="Calificacion promedio"
          value={
            reviewInsights.rating_avg
              ? `${reviewInsights.rating_avg.toFixed(1)} / 5`
              : "Sin datos"
          }
          detail="Se actualiza a partir del feedback real de tus clientes."
        />
        <InfoTile
          icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
          label="Feedback reciente"
          value={`${reviewInsights.recent_reviews_count}`}
          detail="Resenas publicadas durante los ultimos 30 dias."
        />
        <InfoTile
          icon={<BarChart3 className="h-4 w-4 text-red-500" />}
          label="Resenas negativas"
          value={`${reviewInsights.low_rating_count}`}
          detail={
            reviewInsights.low_rating_count > 0
              ? "Hay senales que vale la pena revisar pronto."
              : "No se detectan alertas recientes."
          }
        />
      </div>

      {reviewInsights.top_products_by_reviews.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-neutral-800">
            Productos con mas feedback
          </p>
          <div className="space-y-2">
            {reviewInsights.top_products_by_reviews
              .slice(0, 3)
              .map((product) => (
                <div
                  key={product.product_id}
                  className="rounded-2xl bg-neutral-50 px-4 py-3"
                >
                  <p className="line-clamp-2 text-sm leading-snug font-medium text-neutral-900">
                    {product.producto_nombre}
                  </p>
                  <p className="mt-1 text-xs text-neutral-600">
                    {product.review_count} resenas ·{" "}
                    {product.rating_avg.toFixed(1)} / 5
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </BaseCard>
  );
}

export function actionDescription(action: SellerMetricsAction): string {
  const priority =
    action.priority === "high"
      ? "Alta prioridad"
      : action.priority === "medium"
        ? "Prioridad media"
        : "Baja prioridad";

  const impact =
    action.impact === "high"
      ? "alto impacto"
      : action.impact === "medium"
        ? "impacto medio"
        : "impacto gradual";

  const effort =
    action.effort === "low"
      ? "esfuerzo bajo"
      : action.effort === "medium"
        ? "esfuerzo moderado"
        : "mas trabajo";

  return `${priority}. Accion de ${impact} con ${effort}.`;
}

function InfoTile({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl bg-neutral-50 px-4 py-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white">
        {icon}
      </div>
      <p className="text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
        {label}
      </p>
      <p className="mt-2 text-lg leading-snug font-semibold text-neutral-900">
        {value}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-neutral-600">{detail}</p>
    </div>
  );
}

/* ──────────────────────────────────────────
   SELLER ALERTS STRIP
   Superficie de señales activas — aparece
   solo cuando existen alertas, entre los
   stat cards y los tabs de detalle.
────────────────────────────────────────── */

const STRIP_DOT: Record<PerformanceAlert["type"], string> = {
  warning: "bg-amber-400",
  info: "bg-sky-400",
  success: "bg-emerald-400",
};

function AlertStripRow({ alert }: { alert: PerformanceAlert }) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className={`mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full ${STRIP_DOT[alert.type]}`}
      />
      <div className="min-w-0 flex-1 flex items-baseline gap-2 flex-wrap">
        <span className="text-sm font-medium text-neutral-800 leading-snug">
          {alert.title}
        </span>
        {alert.actionLabel && alert.actionHref && (
          <Link
            href={alert.actionHref}
            className="text-xs font-semibold text-amber-700 hover:underline shrink-0"
          >
            {alert.actionLabel} →
          </Link>
        )}
      </div>
    </div>
  );
}

export function SellerAlertsStrip({
  alerts,
}: {
  alerts: PerformanceAlert[];
}) {
  if (alerts.length === 0) return null;

  const topAlerts = alerts.slice(0, 3);
  const hasWarning = alerts.some((a) => a.type === "warning");

  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 space-y-2.5 ${
        hasWarning
          ? "border-amber-200 bg-amber-50/60"
          : "border-sky-100 bg-sky-50/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <p
          className={`text-[11px] font-semibold tracking-[0.14em] uppercase ${
            hasWarning ? "text-amber-700" : "text-sky-700"
          }`}
        >
          Señales activas
        </p>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
            hasWarning
              ? "border-amber-200 bg-white text-amber-700"
              : "border-sky-100 bg-white text-sky-700"
          }`}
        >
          {alerts.length}
        </span>
      </div>

      <div className="space-y-2">
        {topAlerts.map((alert) => (
          <AlertStripRow key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}
