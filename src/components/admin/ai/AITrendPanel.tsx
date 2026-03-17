"use client";

import { useMemo }  from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  trending_products:       TrendingProduct[];
  trending_categories:     TrendingCategory[];
  products_without_views:  number;
  generated_at:            string;
};

type Tier = "hot" | "rising" | "steady" | "fading";

type ScoredItem = {
  id:           string;
  name:         string;
  intentCount:  number;
  trendScore:   number; // 0-100 composite
  growthRate:   number; // 0-100 relative
  recencyWeight:number; // 0-100
  tier:         Tier;
  kind:         "product" | "category";
};

// ── Trend score formula ────────────────────────────────────────────────────────
//
// trend_score = intent_count_score (50%) + growth_rate (30%) + recency_weight (20%)
//
// intent_count_score = normalized intention count vs max
// growth_rate        = rank-position bonus (higher rank = sustained growth signal)
// recency_weight     = inverse rank decay (top items are most recent hot signals)
//

function computeScore(
  intentCount: number,
  rank:        number,        // 1-based
  total:       number,
  maxIntent:   number,
): { trendScore: number; growthRate: number; recencyWeight: number } {
  const intentScore   = maxIntent > 0 ? (intentCount / maxIntent) * 50 : 0;
  const growthRate    = total > 1 ? ((total - rank) / (total - 1)) * 30 : 30;
  const recencyWeight = total > 1 ? ((total - rank + 1) / total) * 20 : 20;
  const trendScore    = Math.round(intentScore + growthRate + recencyWeight);

  return {
    trendScore:    Math.min(100, trendScore),
    growthRate:    Math.round(growthRate),
    recencyWeight: Math.round(recencyWeight),
  };
}

function tierOf(score: number): Tier {
  if (score >= 75) return "hot";
  if (score >= 50) return "rising";
  if (score >= 25) return "steady";
  return "fading";
}

function scoreItems<T extends { intention_count: number }>(
  items:   T[],
  idFn:    (item: T) => string,
  nameFn:  (item: T) => string,
  kind:    ScoredItem["kind"],
): ScoredItem[] {
  const maxIntent = Math.max(...items.map((i) => i.intention_count), 1);
  return items.map((item, idx) => {
    const rank = idx + 1;
    const { trendScore, growthRate, recencyWeight } = computeScore(
      item.intention_count,
      rank,
      items.length,
      maxIntent,
    );
    return {
      id:           idFn(item),
      name:         nameFn(item),
      intentCount:  item.intention_count,
      trendScore,
      growthRate,
      recencyWeight,
      tier:         tierOf(trendScore),
      kind,
    };
  });
}

// ── Tier config ────────────────────────────────────────────────────────────────

const TIER: Record<Tier, { label: string; badge: string; bar: string; arrow: string }> = {
  hot:    { label: "Hot",    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",         bar: "bg-red-500",                   arrow: "↑↑" },
  rising: { label: "Rising", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300", bar: "bg-orange-400",            arrow: "↑"  },
  steady: { label: "Steady", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",     bar: "bg-blue-400",                  arrow: "→"  },
  fading: { label: "Fading", badge: "bg-muted text-muted-foreground",                                    bar: "bg-muted-foreground/40",       arrow: "↓"  },
};

// ── TrendRow ───────────────────────────────────────────────────────────────────

function TrendRow({ item, maxIntent }: { item: ScoredItem; maxIntent: number }) {
  const t    = TIER[item.tier];
  const pct  = maxIntent > 0 ? Math.round((item.intentCount / maxIntent) * 100) : 0;
  return (
    <li className="flex items-center gap-3 py-2.5 border-b last:border-0">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate flex-1">{item.name}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${t.badge}`}>
            {t.arrow} {t.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground shrink-0 w-16 text-right">
            {item.intentCount} intent · <span className="font-semibold text-foreground">{item.trendScore}</span>
          </span>
        </div>
      </div>
    </li>
  );
}

// ── FastestGrowing ─────────────────────────────────────────────────────────────

function FastestGrowing({ items }: { items: ScoredItem[] }) {
  const top = [...items].sort((a, b) => b.trendScore - a.trendScore).slice(0, 6);
  if (top.length === 0) return <p className="text-xs text-muted-foreground">No trend data yet.</p>;

  return (
    <ul className="space-y-3">
      {top.map((item, i) => {
        const t = TIER[item.tier];
        return (
          <li key={item.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono w-4 shrink-0">{i + 1}</span>
              <span className="text-sm font-medium truncate flex-1">{item.name}</span>
              <Badge variant="outline" className="text-xs shrink-0">{item.kind}</Badge>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold shrink-0 ${t.badge}`}>
                {item.trendScore}
              </span>
            </div>
            {/* Score breakdown mini-bars */}
            <div className="pl-6 grid grid-cols-3 gap-1">
              {([
                { label: "Intent",   value: item.intentCount,   color: "bg-blue-400",   max: 50 },
                { label: "Growth",   value: item.growthRate,    color: "bg-green-400",  max: 30 },
                { label: "Recency",  value: item.recencyWeight, color: "bg-violet-400", max: 20 },
              ] as const).map((bar) => (
                <div key={bar.label} className="space-y-0.5">
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${bar.color}`}
                      style={{ width: `${Math.round((bar.value / bar.max) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground/70">{bar.label}</p>
                </div>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AITrendPanel() {
  const { data, loading, error, refetch } =
    useBrainFetch<Intelligence>("/api/admin/ai/intelligence", "intelligence");

  const { scoredProds, scoredCats, allItems } = useMemo(() => {
    const prods = scoreItems(
      data?.trending_products   ?? [],
      (p) => p.product_id,
      (p) => p.nombre,
      "product",
    );
    const cats = scoreItems(
      data?.trending_categories ?? [],
      (c) => String(c.categoria_id),
      (c) => c.nombre,
      "category",
    );
    return { scoredProds: prods, scoredCats: cats, allItems: [...prods, ...cats] };
  }, [data]);

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-md" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold">Trend Engine</p>
        <p className="text-xs text-red-500">{error ?? "No data available."}</p>
        <button onClick={refetch} className="text-xs px-3 py-1 rounded border hover:bg-muted transition-colors">Retry</button>
      </div>
    );
  }

  const maxProd  = Math.max(...(data.trending_products   ?? []).map((p) => p.intention_count), 1);
  const maxCat   = Math.max(...(data.trending_categories ?? []).map((c) => c.intention_count), 1);
  const hotCount = allItems.filter((i) => i.tier === "hot" || i.tier === "rising").length;

  return (
    <div className="bg-card border rounded-lg p-4 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5">
          <h2 className="font-semibold text-sm">Trend Engine</h2>
          <p className="text-xs text-muted-foreground">
            trend_score = intent (50%) + growth_rate (30%) + recency (20%)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hotCount > 0 && (
            <Badge className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0">
              {hotCount} hot
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(data.generated_at).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Top Products (7d)</p>
          {scoredProds.length === 0
            ? <p className="text-xs text-muted-foreground">No product trends yet.</p>
            : <ul>{scoredProds.slice(0, 8).map((p) => <TrendRow key={p.id} item={p} maxIntent={maxProd} />)}</ul>
          }
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Top Categories (7d)</p>
          {scoredCats.length === 0
            ? <p className="text-xs text-muted-foreground">No category trends yet.</p>
            : <ul>{scoredCats.slice(0, 8).map((c) => <TrendRow key={c.id} item={c} maxIntent={maxCat} />)}</ul>
          }
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fastest Growing</p>
          <FastestGrowing items={allItems} />
          <p className="text-xs text-muted-foreground pt-1 border-t">
            Score breakdown: intent · growth rate · recency
          </p>
        </div>

      </div>
    </div>
  );
}
