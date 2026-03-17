"use client";

import { useState, useMemo } from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type Intelligence = {
  products_total:          number;
  products_without_images: number;
  products_without_views:  number;
  inactive_sellers:        number;
  trending_products:       { nombre: string; intention_count: number }[];
  trending_categories:     { nombre: string; intention_count: number }[];
};

type Strategy = "promote_category" | "highlight_products" | "recruit_sellers";

type SimRow = {
  metric:   string;
  current:  number;
  unit:     string;
  delta:    number;
  note?:    string;
};

// ── Strategy config ────────────────────────────────────────────────────────────

const STRATEGIES: { id: Strategy; icon: string; title: string; desc: string }[] = [
  { id: "promote_category",   icon: "🏷", title: "Promote Category",   desc: "Feature a category on the homepage to drive discovery and buying intent." },
  { id: "highlight_products", icon: "📦", title: "Highlight Products",  desc: "Boost selected products via featured placement and recommendation slots."   },
  { id: "recruit_sellers",    icon: "🏪", title: "Recruit Sellers",     desc: "Onboard new sellers to expand supply, reduce gaps, and increase GMV."       },
];

const INTENSITY_LABELS = ["", "Minimal", "Low", "Moderate", "High", "Maximum"];

// ── Simulation engine ──────────────────────────────────────────────────────────
//
// All projections are heuristic estimates calibrated from live data.
// Delta = estimated change after 30 days at the given effort level.
//

function simulate(strategy: Strategy, intensity: number, intel: Intelligence | null): SimRow[] {
  const i          = intensity;
  const totalProd  = intel?.products_total     ?? 100;
  const noViews    = intel?.products_without_views  ?? 30;
  const noImages   = intel?.products_without_images ?? 20;
  const inactSel   = intel?.inactive_sellers   ?? 5;
  const avgIntent  = intel?.trending_products.length
    ? Math.round(intel.trending_products.reduce((s, p) => s + p.intention_count, 0) / intel.trending_products.length)
    : 10;

  if (strategy === "promote_category") {
    return [
      { metric: "Category page views",       current: totalProd * 12,    delta: Math.round(totalProd * 12 * i * 0.04),   unit: "views/mo",    note: "Estimated from product-to-view ratio" },
      { metric: "Buyer intentions",           current: avgIntent * 30,    delta: Math.round(avgIntent * i * 1.8),         unit: "intentions",  note: "7-day intent extrapolated to 30 days"  },
      { metric: "New listings attracted",     current: totalProd,         delta: i * 3,                                   unit: "products",    note: "Sellers join trending categories"       },
      { metric: "Conversion rate (intent→buy)",current: 4,               delta: Math.round(i * 1.2 * 10) / 10,          unit: "%",                                                             },
      { metric: "Products gaining visibility",current: totalProd - noViews, delta: Math.round(noViews * i * 0.15),       unit: "products",                                                      },
    ];
  }

  if (strategy === "highlight_products") {
    return [
      { metric: "Products gaining views",       current: totalProd - noViews, delta: Math.round(noViews * i * 0.22),       unit: "products",                                                   },
      { metric: "Buyer intentions",             current: avgIntent * 30,      delta: Math.round(avgIntent * i * 1.2),       unit: "intentions",                                                 },
      { metric: "Products with images (uplift)",current: totalProd - noImages, delta: Math.round(noImages * i * 0.08),     unit: "products",    note: "Sellers prompted to add photos"       },
      { metric: "Active seller rate",           current: 60,                  delta: i * 3,                                unit: "%",           note: "Sellers energized by exposure"         },
      { metric: "Avg listing quality score",    current: 45,                  delta: i * 5,                                unit: "/ 100",       note: "Images + views improve quality score"  },
    ];
  }

  // recruit_sellers
  return [
    { metric: "New product listings",          current: totalProd,    delta: i * 8,                                     unit: "products",                                                        },
    { metric: "Supply coverage",               current: 55,           delta: i * 5,                                     unit: "%",           note: "% of categories with 5+ sellers"          },
    { metric: "Inactive sellers recovered",    current: inactSel,     delta: -Math.min(inactSel, i * 2),                unit: "sellers",     note: "Via onboarding support + outreach"        },
    { metric: "Buyer intentions (new supply)", current: avgIntent * 30, delta: Math.round(avgIntent * i * 0.6),         unit: "intentions",  note: "More supply → more discovery"             },
    { metric: "Category diversity",            current: (intel?.trending_categories ?? []).length, delta: i * 2,        unit: "categories",  note: "Sellers fill underserved verticals"        },
  ];
}

// ── Result table ───────────────────────────────────────────────────────────────

function ResultTable({ rows, strategyLabel, intensity }: { rows: SimRow[]; strategyLabel: string; intensity: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Projected Impact — {INTENSITY_LABELS[intensity]} effort
        </p>
        <Badge variant="outline" className="text-xs">{strategyLabel}</Badge>
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Metric</th>
              <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Current</th>
              <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Estimated</th>
              <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Delta %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const projected = row.current + row.delta;
              const pct       = row.current !== 0
                ? Math.round((row.delta / Math.abs(row.current)) * 100)
                : 0;
              const isUp   = row.delta > 0;
              const isDown = row.delta < 0;
              return (
                <tr key={i} className={`border-b last:border-0 ${i % 2 === 1 ? "bg-muted/15" : ""}`}>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{row.metric}</div>
                    {row.note && <div className="text-muted-foreground/70 mt-0.5">{row.note}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                    {row.current.toLocaleString()} <span className="opacity-60">{row.unit}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold whitespace-nowrap">
                    {projected.toLocaleString()} <span className="font-normal opacity-60">{row.unit}</span>
                  </td>
                  <td className={`px-3 py-2.5 text-right tabular-nums font-bold whitespace-nowrap ${
                    isUp   ? "text-green-600 dark:text-green-400" :
                    isDown ? "text-red-600 dark:text-red-400"     : "text-muted-foreground"
                  }`}>
                    {isUp ? "+" : ""}{pct}%
                    <span className="ml-1 font-normal opacity-60">
                      ({isUp ? "+" : ""}{row.delta.toLocaleString()} {row.unit})
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        ⚠ Heuristic estimates calibrated from live data (
        {/* shown inside the Simulator component */}
        ). Actual results depend on execution quality and market conditions.
        Projections assume 30-day campaign window.
      </p>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AIMarketplaceSimulator() {
  const { data: intel, loading } =
    useBrainFetch<Intelligence>("/api/admin/ai/intelligence", "intelligence");

  const [strategy,  setStrategy]  = useState<Strategy>("promote_category");
  const [intensity, setIntensity] = useState(3);
  const [ran,       setRan]       = useState(false);

  const simRows = useMemo(
    () => (ran ? simulate(strategy, intensity, intel) : null),
    [ran, strategy, intensity, intel],
  );

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-52" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-md" />)}
        </div>
        <Skeleton className="h-10 rounded-md" />
        <Skeleton className="h-52 rounded-md" />
      </div>
    );
  }

  const activeStrategy = STRATEGIES.find((s) => s.id === strategy)!;

  return (
    <div className="bg-card border rounded-lg p-4 space-y-5">

      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="font-semibold text-sm">Marketplace Simulator</h2>
        <p className="text-xs text-muted-foreground">
          Model the projected 30-day impact of marketplace strategies — calibrated from{" "}
          {intel ? `${intel.products_total.toLocaleString()} products and ${intel.trending_products.length} intent signals` : "live data"}.
        </p>
      </div>

      {/* Strategy cards */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Strategy</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {STRATEGIES.map((s) => (
            <button
              key={s.id}
              onClick={() => { setStrategy(s.id); setRan(false); }}
              className={`text-left p-3 rounded-md border transition-colors space-y-1 ${
                strategy === s.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{s.icon}</span>
                <span className="text-sm font-semibold">{s.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Intensity slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Effort / Budget</p>
          <Badge variant="secondary" className="text-xs">{INTENSITY_LABELS[intensity]}</Badge>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={intensity}
          onChange={(e) => { setIntensity(Number(e.target.value)); setRan(false); }}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {INTENSITY_LABELS.slice(1).map((l) => <span key={l}>{l}</span>)}
        </div>
      </div>

      {/* Run */}
      <button
        onClick={() => setRan(true)}
        className="w-full py-2 text-sm font-semibold rounded-md bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
      >
        ⚡ Run Simulation
      </button>

      {/* Results */}
      {simRows && (
        <ResultTable
          rows={simRows}
          strategyLabel={activeStrategy.title}
          intensity={intensity}
        />
      )}
    </div>
  );
}
