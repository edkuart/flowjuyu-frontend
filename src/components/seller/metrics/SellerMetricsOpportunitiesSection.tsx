"use client";

import { SellerAutoInsightsSection } from "@/components/seller/SellerAutoInsightsSection";
import { BaseExpandableCard } from "@/components/ui/BaseExpandableCard";
import {
  DashboardActionCard,
  MetricsSectionIntro,
} from "@/components/seller/metrics/SellerMetricsShared";
import type { SellerMetricsAction } from "@/components/seller/metrics/types";

export function SellerMetricsOpportunitiesSection({
  actions,
}: {
  actions: SellerMetricsAction[];
}) {
  return (
    <div className="space-y-4">
      <MetricsSectionIntro
        eyebrow="Oportunidades"
        title="Acciones sugeridas y detalle"
        description="Pasos concretos para mejorar conversion, visibilidad y reputacion. La senal prioritaria ya aparece arriba del panel principal."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <DashboardActionCard
            key={`${action.href}-${action.label}`}
            action={action}
          />
        ))}
      </div>

      <BaseExpandableCard
        title="Insights automaticos"
        summary="Recomendaciones generadas a partir de la actividad real de tu catalogo."
        defaultExpanded={false}
      >
        <SellerAutoInsightsSection />
      </BaseExpandableCard>
    </div>
  );
}
