"use client";

import { Package, Sparkles } from "lucide-react";

import { BaseExpandableCard } from "@/components/ui/BaseExpandableCard";
import {
  MetricsMiniCard,
  MetricsSectionIntro,
} from "@/components/seller/metrics/SellerMetricsShared";
import { SellerProductAnalyticsSection } from "@/components/seller/SellerProductAnalyticsSection";
import type { Analytics } from "@/components/seller/metrics/types";

export function SellerMetricsProductsSection({
  totalProducts,
  activeProducts,
  inactiveProducts,
  analytics,
}: {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  analytics: Analytics;
}) {
  const topViewedProduct = analytics.topProducts[0];
  const topIntentProduct = analytics.topIntentedProducts[0];

  return (
    <div className="space-y-4">
      <MetricsSectionIntro
        eyebrow="Productos"
        title="Catalogo y rendimiento comercial"
        description="Reducimos esta seccion a un resumen operativo y dejamos el analisis producto por producto bajo demanda."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricsMiniCard
          label="Productos totales"
          value={`${totalProducts}`}
          detail="Tu inventario visible para analitica comercial."
        />
        <MetricsMiniCard
          label="Productos activos"
          value={`${activeProducts}`}
          detail="Lo que hoy puede generar visitas e intencion."
          tone={activeProducts > 0 ? "success" : "warning"}
        />
        <MetricsMiniCard
          label="Productos inactivos"
          value={`${inactiveProducts}`}
          detail="Separado del resto para que no contamine la lectura principal."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F3D3A]/8">
              <Package className="h-5 w-5 text-[#0F3D3A]" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-neutral-900">
                Producto con mas vistas
              </p>
              <p className="text-sm text-neutral-600">
                {topViewedProduct
                  ? `${topViewedProduct.nombre} · ${topViewedProduct.total_views} vistas`
                  : "Todavia no hay un producto destacado por trafico."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F3D3A]/8">
              <Sparkles className="h-5 w-5 text-[#0F3D3A]" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-neutral-900">
                Producto con mas intencion
              </p>
              <p className="text-sm text-neutral-600">
                {topIntentProduct
                  ? `${topIntentProduct.nombre} · ${topIntentProduct.total_intentions} intenciones`
                  : "Todavia no hay un producto destacado por interes comercial."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <BaseExpandableCard
        title="Analitica detallada de productos"
        summary="Abre este panel cuando quieras revisar productos top, oportunidad comercial y detalle de interes."
        defaultExpanded={false}
      >
        <SellerProductAnalyticsSection />
      </BaseExpandableCard>
    </div>
  );
}
