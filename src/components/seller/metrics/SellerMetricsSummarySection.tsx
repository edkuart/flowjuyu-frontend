"use client";

import type { ComponentProps } from "react";

import { SellerHealthScoreCard } from "@/components/seller/SellerHealthScoreCard";
import { SellerKpiHighlights } from "@/components/seller/SellerKpiHighlights";
import { SellerProgressCard } from "@/components/seller/SellerProgressCard";
import { SellerAlertsPanel } from "@/components/seller/SellerAlertsPanel";
import { BaseExpandableCard } from "@/components/ui/BaseExpandableCard";
import {
  MetricsMiniCard,
  MetricsSectionIntro,
} from "@/components/seller/metrics/SellerMetricsShared";
import type { SellerPerfil } from "@/lib/sellerProgress";

export function SellerMetricsSummarySection({
  health,
  highlights,
  alerts,
  sellerValidation,
  sellerProducts,
  sellerProfile,
}: {
  health: ComponentProps<typeof SellerHealthScoreCard>["health"];
  highlights: ComponentProps<typeof SellerKpiHighlights>["highlights"];
  alerts: ComponentProps<typeof SellerAlertsPanel>["alerts"];
  sellerValidation:
    | "pendiente"
    | "en_revision"
    | "aprobado"
    | "rechazado"
    | null;
  sellerProducts: Array<{
    activo?: boolean;
    descripcion?: string;
    imagenes?: Array<{ url?: string | null }>;
    imagen_url?: string | null;
  }>;
  sellerProfile: SellerPerfil | null;
}) {
  return (
    <div className="space-y-4">
      <MetricsSectionIntro
        eyebrow="Resumen"
        title="Estado general del negocio"
        description="Esta vista junta solo el diagnostico sintetico y deja el detalle operativo debajo de expandibles."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SellerHealthScoreCard health={health} />
        <SellerKpiHighlights highlights={highlights} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricsMiniCard
          label="Etapa del negocio"
          value={sellerValidation === "aprobado" ? "Escalar" : "Activar"}
          detail={
            sellerValidation === "aprobado"
              ? "Tu tienda esta aprobada. El foco ahora es mejorar conversion y reputacion."
              : "Completa la activacion para que tu tienda sea visible a compradores."
          }
          tone={sellerValidation === "aprobado" ? "success" : "warning"}
        />
        <MetricsMiniCard
          label="Catalogo"
          value={`${sellerProducts.length}`}
          detail={
            sellerProducts.length === 0
              ? "Sin productos publicados. Agrega al menos uno para empezar a recibir visitas."
              : sellerProducts.filter((p) => p.activo === false).length > 0
                ? `${sellerProducts.filter((p) => p.activo === false).length} producto${sellerProducts.filter((p) => p.activo === false).length === 1 ? "" : "s"} inactivo${sellerProducts.filter((p) => p.activo === false).length === 1 ? "" : "s"} — no son visibles para compradores.`
                : "Todos tus productos estan activos y visibles en la tienda."
          }
        />
        <MetricsMiniCard
          label="Perfil"
          value={
            sellerProfile?.nombre_comercio?.trim() ? "Completo" : "Pendiente"
          }
          detail={
            sellerProfile?.nombre_comercio?.trim()
              ? `Tu negocio aparece como "${sellerProfile.nombre_comercio}" en busquedas y en tu tienda.`
              : "Agrega nombre y logo para que los compradores reconozcan tu marca."
          }
        />
      </div>

      <BaseExpandableCard
        title="Checklist y activacion"
        summary="Abre este bloque si quieres revisar progreso de seller, perfil y pendientes de activacion."
        defaultExpanded={false}
      >
        <SellerProgressCard
          estadoValidacion={sellerValidation}
          productos={sellerProducts}
          perfil={sellerProfile}
        />
      </BaseExpandableCard>

      <BaseExpandableCard
        title="Alertas operativas"
        summary="Mantuvimos las alertas fuera de la vista principal para reducir ruido visual."
        defaultExpanded={false}
      >
        <SellerAlertsPanel alerts={alerts} />
      </BaseExpandableCard>
    </div>
  );
}
