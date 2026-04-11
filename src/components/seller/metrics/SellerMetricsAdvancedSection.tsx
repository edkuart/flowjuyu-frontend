"use client";

import { SellerAutoInsightsSection } from "@/components/seller/SellerAutoInsightsSection";
import { SellerGrowthSection } from "@/components/seller/SellerGrowthSection";
import { SellerProductAnalyticsSection } from "@/components/seller/SellerProductAnalyticsSection";
import { BaseExpandableCard } from "@/components/ui/BaseExpandableCard";
import { MetricsSectionIntro } from "@/components/seller/metrics/SellerMetricsShared";

export function SellerMetricsAdvancedSection() {
  return (
    <div className="space-y-4">
      <MetricsSectionIntro
        eyebrow="Avanzado"
        title="Capas profundas bajo demanda"
        description="Aqui viven los bloques mas pesados. Todos empiezan cerrados para que mobile y desktop se sientan mas ordenados."
      />

      <BaseExpandableCard
        title="Analitica avanzada de productos"
        summary="Top productos, oportunidad comercial y concentracion de interes."
        defaultExpanded={false}
      >
        <SellerProductAnalyticsSection />
      </BaseExpandableCard>

      <BaseExpandableCard
        title="Crecimiento y momentum"
        summary="Profundiza en traccion y evolucion reciente cuando quieras ir mas alla del resumen."
        defaultExpanded={false}
      >
        <SellerGrowthSection />
      </BaseExpandableCard>

      <BaseExpandableCard
        title="Motor de insights automaticos"
        summary="Recomendaciones generadas automaticamente a partir de actividad y senales del negocio."
        defaultExpanded={false}
      >
        <SellerAutoInsightsSection />
      </BaseExpandableCard>
    </div>
  );
}
