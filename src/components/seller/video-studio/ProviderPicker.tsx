"use client";

import { CheckCircle2, Clock, Star, Zap, Sparkles, FlaskConical } from "lucide-react";
import {
  PROVIDER_MODEL_CONFIGS,
  formatCostGTQ,
  formatEstimatedTime,
} from "@/lib/videoStudioCost";
import type { ProviderModelConfig, SupportedProvider } from "@/types/video-studio";

const BADGE_CONFIG = {
  recommended: { label: "Recomendado", className: "bg-[var(--seller-accent)] text-white", icon: Star },
  cheapest:    { label: "Más económico", className: "bg-emerald-500 text-white", icon: Zap },
  premium:     { label: "Máxima calidad", className: "bg-violet-600 text-white", icon: Sparkles },
  experimental:{ label: "Experimental", className: "bg-amber-500 text-white", icon: FlaskConical },
} as const;

const QUALITY_LABELS = ["", "Básica", "Buena", "Muy buena", "Excelente", "Máxima"];

function QualityDots({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 w-4 rounded-full transition ${
            i < score
              ? "bg-[var(--seller-accent)]"
              : "bg-[var(--seller-line)]"
          }`}
        />
      ))}
      <span className="ml-1.5 text-[11px] text-[var(--seller-faint-text)]">
        {QUALITY_LABELS[score] ?? ""}
      </span>
    </div>
  );
}

interface SelectedProvider {
  provider: SupportedProvider;
  model: string;
}

interface Props {
  selected: SelectedProvider;
  onChange: (value: SelectedProvider) => void;
  durationSeconds?: number;
  hasImages?: boolean;
}

export default function ProviderPicker({
  selected,
  onChange,
  durationSeconds = 10,
  hasImages = false,
}: Props) {
  // Mostrar mock solo en desarrollo
  const isDev = typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const visibleConfigs = PROVIDER_MODEL_CONFIGS.filter(
    (c) => c.provider !== "mock" || isDev
  );

  return (
    <div className="space-y-2.5">
      {visibleConfigs.map((config) => {
        const isSelected =
          selected.provider === config.provider && selected.model === config.model;
        const badge = config.badge ? BADGE_CONFIG[config.badge] : null;
        const BadgeIcon = badge?.icon;
        const needsImage = config.supportsI2V && !hasImages;

        return (
          <button
            key={`${config.provider}:${config.model}`}
            onClick={() => onChange({ provider: config.provider as SupportedProvider, model: config.model })}
            className={`relative w-full rounded-xl border p-3 text-left transition
              ${isSelected
                ? "border-[var(--seller-accent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_7%,white)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--seller-accent)_15%,transparent)]"
                : "border-[var(--seller-line)] bg-white hover:border-[var(--seller-line-strong)] hover:shadow-sm"
              } ${needsImage ? "opacity-60" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Header row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--seller-ink)]">
                    {config.label}
                  </span>
                  {badge && BadgeIcon && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
                      <BadgeIcon className="h-2.5 w-2.5" />
                      {badge.label}
                    </span>
                  )}
                  {needsImage && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                      Requiere imagen de producto
                    </span>
                  )}
                </div>

                {/* Quality dots */}
                <QualityDots score={config.qualityScore} />

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--seller-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    {formatEstimatedTime(config.estimatedSeconds)}
                  </span>
                  <span className="font-semibold text-[var(--seller-ink)]">
                    {formatCostGTQ(config.provider, config.model, durationSeconds)}
                  </span>
                  <span className="text-[var(--seller-faint-text)]">
                    por video
                  </span>
                </div>
              </div>

              {/* Checkmark */}
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition
                ${isSelected
                  ? "text-[var(--seller-accent)]"
                  : "border border-[var(--seller-line)] text-transparent"
                }`}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            {/* Dev-only tag for mock */}
            {config.provider === "mock" && (
              <div className="mt-2 rounded-lg border border-dashed border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-700">
                Solo visible en desarrollo — no genera video real
              </div>
            )}
          </button>
        );
      })}

      <p className="px-1 text-[11px] leading-relaxed text-[var(--seller-faint-text)]">
        Los costos son estimaciones en Quetzales (GTQ) basadas en el precio de los proveedores.
        El costo real puede variar según la duración y el modelo elegido.
      </p>
    </div>
  );
}
