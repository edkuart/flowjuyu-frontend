"use client";

import { MessageSquareQuote, ShieldCheck } from "lucide-react";

import { BaseExpandableCard } from "@/components/ui/BaseExpandableCard";
import {
  MetricsMiniCard,
  MetricsSectionIntro,
  ReviewSnapshotCard,
} from "@/components/seller/metrics/SellerMetricsShared";
import type { ReviewInsights } from "@/components/seller/metrics/types";

export function SellerMetricsReputationSection({
  reviewInsights,
  totalReviews,
}: {
  reviewInsights: ReviewInsights;
  totalReviews: number;
}) {
  const topTerms = reviewInsights.frequent_terms.slice(0, 5);

  return (
    <div className="space-y-4">
      <MetricsSectionIntro
        eyebrow="Reputacion"
        title="Confianza y feedback del cliente"
        description="La reputacion ya no aparece mezclada con trafico ni catalogo. Se lee aparte y con mas calma."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricsMiniCard
          label="Resenas totales"
          value={`${totalReviews}`}
          detail="Cantidad acumulada de feedback publico."
          tone={totalReviews > 0 ? "success" : "warning"}
        />
        <MetricsMiniCard
          label="Promedio"
          value={
            reviewInsights.rating_avg
              ? reviewInsights.rating_avg.toFixed(1)
              : "—"
          }
          detail="Lectura rapida de confianza general."
        />
        <MetricsMiniCard
          label="Riesgo"
          value={`${reviewInsights.low_rating_count}`}
          detail="Cantidad de resenas bajas que ameritan seguimiento."
          tone={reviewInsights.low_rating_count > 0 ? "warning" : "success"}
        />
      </div>

      <ReviewSnapshotCard
        reviewInsights={reviewInsights}
        totalReviews={totalReviews}
      />

      <BaseExpandableCard
        title="Lenguaje recurrente en feedback"
        summary="Ocultamos esta capa porque es util para profundizar, pero no deberia estar visible todo el tiempo."
        defaultExpanded={false}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F3D3A]/8">
                <MessageSquareQuote className="h-5 w-5 text-[#0F3D3A]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Terminos frecuentes
                </p>
                <p className="text-xs text-neutral-500">
                  Palabras que mas se repiten en la experiencia del cliente.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {topTerms.length > 0 ? (
                topTerms.map((term) => (
                  <span
                    key={term.term}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700"
                  >
                    {term.term} · {term.count}
                  </span>
                ))
              ) : (
                <p className="text-sm text-neutral-500">
                  Todavia no hay suficiente feedback para detectar patrones.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F3D3A]/8">
                <ShieldCheck className="h-5 w-5 text-[#0F3D3A]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Lectura recomendada
                </p>
                <p className="text-xs text-neutral-500">
                  Usa esta seccion para detectar confianza, no para seguir
                  trafico o conversion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </BaseExpandableCard>
    </div>
  );
}
