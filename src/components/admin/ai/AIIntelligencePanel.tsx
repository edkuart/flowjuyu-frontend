"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge }    from "@/components/ui/badge";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type TrendingProduct = {
  product_id:      string;
  nombre:          string;
  intention_count: number;
};

type TrendingCategory = {
  categoria_id:    number;
  nombre:          string;
  intention_count: number;
};

type Intelligence = {
  products_total:          number;
  products_without_images: number;
  products_without_views:  number;
  inactive_sellers:        number;
  trending_products:       TrendingProduct[];
  trending_categories:     TrendingCategory[];
  generated_at:            string;
};

// ── MiniBar ────────────────────────────────────────────────────────────────────

function MiniBar({
  label,
  value,
  total,
  barColor,
  valueColor,
}: {
  label:      string;
  value:      number;
  total:      number;
  barColor:   string;
  valueColor: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground truncate">{label}</span>
        <span className={`text-xs font-semibold tabular-nums ${valueColor}`}>
          {value.toLocaleString()}
          {total > 0 && (
            <span className="font-normal text-muted-foreground ml-1">({pct}%)</span>
          )}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-muted/40 rounded-md p-3 space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold ${accent ?? ""}`}>{value.toLocaleString()}</p>
    </div>
  );
}

// ── CategoryHeatmap ────────────────────────────────────────────────────────────

function CategoryHeatmap({ categories }: { categories: TrendingCategory[] }) {
  if (categories.length === 0) {
    return <p className="text-xs text-muted-foreground">No category data yet.</p>;
  }
  const max = Math.max(...categories.map((c) => c.intention_count), 1);

  // 5-level heat intensity
  function heatColor(val: number): string {
    const pct = val / max;
    if (pct >= 0.8) return "bg-red-500 text-white";
    if (pct >= 0.6) return "bg-orange-400 text-white";
    if (pct >= 0.4) return "bg-yellow-400 text-zinc-900";
    if (pct >= 0.2) return "bg-blue-300 text-zinc-900";
    return "bg-muted text-muted-foreground";
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <div
          key={c.categoria_id}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${heatColor(c.intention_count)}`}
          title={`${c.nombre}: ${c.intention_count} intentions`}
        >
          <span>{c.nombre}</span>
          <span className="ml-1 opacity-75">·{c.intention_count}</span>
        </div>
      ))}
    </div>
  );
}

// ── ConversionBar ──────────────────────────────────────────────────────────────

function ConversionAnalyzer({ intel }: { intel: Intelligence }) {
  const total    = intel.products_total || 1;
  const withView = intel.products_total - intel.products_without_views;
  const viewPct  = Math.round((withView / total) * 100);
  const imgPct   = Math.round(((intel.products_total - intel.products_without_images) / total) * 100);

  const rows = [
    { label: "Products with views",     value: withView,                                          pct: viewPct, color: "bg-green-500"  },
    { label: "Products with images",    value: intel.products_total - intel.products_without_images, pct: imgPct,  color: "bg-blue-500"   },
    { label: "Products missing images", value: intel.products_without_images,                     pct: 100 - imgPct,  color: "bg-yellow-400" },
    { label: "Products without views",  value: intel.products_without_views,                      pct: 100 - viewPct, color: "bg-red-400"    },
  ];

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="font-medium tabular-nums">{r.value.toLocaleString()} ({r.pct}%)</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all ${r.color}`} style={{ width: `${r.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── DemandDetector ─────────────────────────────────────────────────────────────

function DemandDetector({ intel }: { intel: Intelligence }) {
  const topProducts   = intel.trending_products.slice(0, 5);
  const topCategories = intel.trending_categories.slice(0, 5);

  if (topProducts.length === 0 && topCategories.length === 0) {
    return <p className="text-xs text-muted-foreground">No demand signals detected yet.</p>;
  }

  const maxProd = Math.max(...topProducts.map((p) => p.intention_count),   1);
  const maxCat  = Math.max(...topCategories.map((c) => c.intention_count), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Product demand */}
      {topProducts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Product Demand (7d)
          </p>
          <div className="space-y-2">
            {topProducts.map((p) => {
              const pct = Math.round((p.intention_count / maxProd) * 100);
              return (
                <div key={p.product_id} className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="truncate text-sm font-medium">{p.nombre}</span>
                    <Badge variant="secondary" className="ml-2 shrink-0">{p.intention_count}</Badge>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category demand */}
      {topCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Category Demand (7d)
          </p>
          <div className="space-y-2">
            {topCategories.map((c) => {
              const pct = Math.round((c.intention_count / maxCat) * 100);
              return (
                <div key={c.categoria_id} className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="truncate text-sm font-medium">{c.nombre}</span>
                    <Badge variant="secondary" className="ml-2 shrink-0">{c.intention_count}</Badge>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Telemetry context hints (optional) ─────────────────────────────────────────
//
// The parent page passes these after it fetches the telemetry artifact,
// so AIIntelligencePanel does not need a second useBrainFetch call.
//

type TelemetryHints = {
  testSellerCount: number;  // how many test/demo accounts exist in raw metrics
  dataChanged:     boolean | null; // null = first run, false = no change since last cycle
};

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AIIntelligencePanel({
  telemetryHints,
}: {
  telemetryHints?: TelemetryHints;
}) {
  const { data, loading, error, refetch } =
    useBrainFetch<Intelligence>("/api/admin/ai/intelligence", "intelligence");

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 rounded-md" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold">Marketplace Intelligence</p>
        <p className="text-xs text-red-500">{error ?? "No data available."}</p>
        <button onClick={refetch} className="text-xs px-3 py-1 rounded border hover:bg-muted transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const total = data.products_total;

  return (
    <div className="bg-card border rounded-lg p-4 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">Marketplace Intelligence</h2>
        <span className="text-xs text-muted-foreground">
          {new Date(data.generated_at).toLocaleTimeString()}
        </span>
      </div>

      {/* Telemetry context banners */}
      {telemetryHints && (
        <div className="space-y-2">
          {telemetryHints.testSellerCount > 0 && (
            <p className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded px-3 py-1.5">
              ⚠ Counts include {telemetryHints.testSellerCount} test/demo account{telemetryHints.testSellerCount > 1 ? "s" : ""}.
              See Telemetry section for filtered numbers.
            </p>
          )}
          {telemetryHints.dataChanged === false && (
            <p className="text-xs text-muted-foreground bg-muted/40 border rounded px-3 py-1.5">
              ↺ Metrics unchanged since last cycle — data may be stale.
            </p>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Active Products"   value={data.products_total} />
        <StatCard label="Missing Images"    value={data.products_without_images} accent={data.products_without_images > 10 ? "text-yellow-500" : ""} />
        <StatCard label="Without Views"     value={data.products_without_views}  accent={data.products_without_views > 20  ? "text-yellow-500" : ""} />
        <StatCard label="Inactive Sellers"  value={data.inactive_sellers}        accent={data.inactive_sellers > 5         ? "text-red-500"    : ""} />
      </div>

      {/* Product health bars */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Product Health Overview
        </p>
        <div className="space-y-3">
          <MiniBar label="Active Products"   value={data.products_total}          total={data.products_total} barColor="bg-blue-500"   valueColor="text-foreground" />
          <MiniBar label="Missing Images"    value={data.products_without_images} total={total} barColor={data.products_without_images > 10 ? "bg-yellow-400" : "bg-green-400"} valueColor={data.products_without_images > 10 ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"} />
          <MiniBar label="Without Views"     value={data.products_without_views}  total={total} barColor={data.products_without_views > 20  ? "bg-orange-400" : "bg-green-400"} valueColor={data.products_without_views > 20  ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"} />
          <MiniBar label="Inactive Sellers"  value={data.inactive_sellers}        total={Math.max(data.inactive_sellers, 20)} barColor={data.inactive_sellers > 5 ? "bg-red-400" : "bg-green-400"} valueColor={data.inactive_sellers > 5 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"} />
        </div>
      </div>

      {/* Demand Detector */}
      <div className="space-y-3 pt-1 border-t">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">
          Demand Detector
        </p>
        <DemandDetector intel={data} />
      </div>

      {/* Conversion Analyzer */}
      <div className="space-y-3 pt-1 border-t">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">
          Conversion Analyzer
        </p>
        <ConversionAnalyzer intel={data} />
      </div>

      {/* Category Heatmap */}
      <div className="space-y-3 pt-1 border-t">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">
          Category Heatmap (7d)
        </p>
        <CategoryHeatmap categories={data.trending_categories} />
        <p className="text-xs text-muted-foreground">
          Color intensity = relative buying intent (🔴 hottest → 🔵 cool → grey = minimal)
        </p>
      </div>

    </div>
  );
}
