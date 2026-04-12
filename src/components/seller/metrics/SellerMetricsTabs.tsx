"use client";

import {
  BarChart3,
  Layers3,
  Lightbulb,
  Package,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SellerMetricsTabId } from "@/components/seller/metrics/types";

const TAB_META: Array<{
  id: SellerMetricsTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "summary", label: "Resumen", icon: Layers3 },
  { id: "traffic", label: "Trafico", icon: TrendingUp },
  { id: "products", label: "Productos", icon: Package },
  { id: "reputation", label: "Reputacion", icon: ShieldCheck },
  { id: "opportunities", label: "Oportunidades", icon: Lightbulb },
  { id: "advanced", label: "Avanzado", icon: BarChart3 },
];

export function SellerMetricsTabs() {
  return (
    <div className="sticky top-0 z-10 max-w-full overflow-hidden rounded-[24px] border border-neutral-200/80 bg-[#f8f5ef]/95 p-1 backdrop-blur sm:rounded-[28px]">
      <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-3 xl:flex xl:flex-wrap">
        {TAB_META.map(({ id, label, icon: Icon }) => (
          <TabsTrigger
            key={id}
            value={id}
            className="flex h-auto min-w-0 items-center justify-start gap-2 rounded-2xl border border-transparent px-3 py-2 text-left text-sm data-[state=active]:border-[#0F3D3A]/10 data-[state=active]:bg-white data-[state=active]:text-[#0F3D3A] data-[state=active]:shadow-sm sm:justify-center sm:px-4 sm:py-2.5 xl:min-w-fit xl:shrink-0"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
