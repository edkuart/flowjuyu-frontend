"use client";

import { MessageCircle, TrendingUp, UserRound } from "lucide-react";

import { BaseExpandableCard } from "@/components/ui/BaseExpandableCard";
import {
  MetricsMiniCard,
  MetricsSectionIntro,
  TrendChartCard,
} from "@/components/seller/metrics/SellerMetricsShared";
import { SellerGrowthSection } from "@/components/seller/SellerGrowthSection";
import type { Analytics } from "@/components/seller/metrics/types";

export function SellerMetricsTrafficSection({
  analytics,
  totalTrend,
  growthPercent,
  bestDay,
  isMobile,
  conversionPercent,
}: {
  analytics: Analytics;
  totalTrend: number;
  growthPercent: number;
  bestDay: string | null;
  isMobile: boolean;
  conversionPercent: number;
}) {
  return (
    <div className="space-y-4">
      <MetricsSectionIntro
        eyebrow="Trafico"
        title="Visibilidad e interes"
        description="Primero ves el pulso general de trafico. Las lecturas mas profundas quedan dentro de un expandible."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricsMiniCard
          label="Visitas al perfil"
          value={`${analytics.totalProfileViews}`}
          detail="Sirve para distinguir si el interes se queda en la tienda o llega al producto."
        />
        <MetricsMiniCard
          label="Clicks WhatsApp"
          value={`${analytics.totalWhatsappClicks}`}
          detail={`${
            analytics.last30WhatsappClicks > 0
              ? `${analytics.last30WhatsappClicks} en los ultimos 30 dias.`
              : "Todavia no hay contactos directos recientes."
          }`}
          tone={analytics.totalWhatsappClicks > 0 ? "success" : "warning"}
        />
        <MetricsMiniCard
          label="Conversion"
          value={`${conversionPercent}%`}
          detail="Lectura rapida de cuantas visitas terminan mostrando interes real."
        />
      </div>

      <TrendChartCard
        totalTrend={totalTrend}
        growthPercent={growthPercent}
        bestDay={bestDay}
        data={analytics.last30Days}
        isMobile={isMobile}
      />

      <BaseExpandableCard
        title="Lectura avanzada de crecimiento"
        summary="Incluye evolucion y momentum para quienes necesitan revisar la tendencia con mas detalle."
        defaultExpanded={false}
      >
        <SellerGrowthSection />
      </BaseExpandableCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F3D3A]/8">
              <TrendingUp className="h-5 w-5 text-[#0F3D3A]" />
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                Pulso semanal
              </p>
              <p className="text-xs text-neutral-500">
                {growthPercent >= 0
                  ? `Tus visitas crecieron ${growthPercent}% frente a la semana anterior.`
                  : `Tus visitas bajaron ${Math.abs(growthPercent)}% frente a la semana anterior.`}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F3D3A]/8">
              <UserRound className="h-5 w-5 text-[#0F3D3A]" />
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                Ruta del interes
              </p>
              <p className="text-xs text-neutral-500">
                Perfil, productos y WhatsApp quedan separados para entender
                donde se rompe la conversion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
