"use client";

import { MessageSquareQuote, ShieldCheck } from "lucide-react";

import { BaseExpandableCard } from "@/components/ui/BaseExpandableCard";
import { SellerDetailPanel, SellerPill } from "@/components/seller/ui/SellerPrimitives";
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
          <SellerDetailPanel
            icon={<MessageSquareQuote className="h-5 w-5" />}
            title="Terminos frecuentes"
            description="Palabras que mas se repiten en la experiencia del cliente."
          >
            <div className="mt-4 flex flex-wrap gap-2">
              {topTerms.length > 0 ? (
                topTerms.map((term) => (
                  <SellerPill
                    key={term.term}
                    tone="neutral"
                    className="px-3 py-1 text-xs font-medium text-[var(--seller-text)]"
                  >
                    {term.term} · {term.count}
                  </SellerPill>
                ))
              ) : (
                <p className="text-sm text-[var(--seller-muted)]">
                  Todavia no hay suficiente feedback para detectar patrones.
                </p>
              )}
            </div>
          </SellerDetailPanel>

          <SellerDetailPanel
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Lectura recomendada"
            description="Usa esta seccion para detectar confianza, no para seguir trafico o conversion."
          />
        </div>
      </BaseExpandableCard>
    </div>
  );
}
