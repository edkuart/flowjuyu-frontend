"use client";

import { useMemo }  from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type TrendingProduct  = { product_id: string; nombre: string; intention_count: number };
type TrendingCategory = { categoria_id: number; nombre: string; intention_count: number };

type Intelligence = {
  products_total:      number;
  trending_products:   TrendingProduct[];
  trending_categories: TrendingCategory[];
  generated_at:        string;
};

type Opportunity = {
  type:         string;
  category?:    string;
  seller?:      string;
  demand_score: number;
  supply_score: number;
  suggestion:   string;
};

type GrowthData = { opportunities: Opportunity[] };

type SellerMetrics = {
  id:              number;
  nombre_comercio: string;
  product_count:   number;
  intention_count: number;
};

type SellerData = { top_sellers: SellerMetrics[]; generated_at: string };

// ── Recommendation ─────────────────────────────────────────────────────────────

type RecSection = "product" | "category" | "seller";

type Rec = {
  id:           string;
  section:      RecSection;
  title:        string;
  reason:       string;
  impactScore:  number; // 0-100 composite
  buyerIntent:  number;
  trendScore:   number;
  sellerScore:  number;
  meta?:        string;
};

// ── Impact score formula ───────────────────────────────────────────────────────
//
// impact_score = buyer_intentions (50%) + trend_score (30%) + seller_score (20%)
//
// buyer_intentions = normalized intention count [0,50]
// trend_score      = rank-position bonus [0,30]
// seller_score     = product count bonus [0,20]  (for sellers)
//                    or demand/supply ratio bonus (for categories)
//

function calcImpact(
  intentCount: number,
  maxIntent:   number,
  rank:        number,
  total:       number,
  extra:       number = 0, // category demand_score or seller product_count
  maxExtra:    number = 100,
): { impactScore: number; buyerIntent: number; trendScore: number; sellerScore: number } {
  const buyerIntent  = maxIntent > 0 ? Math.round((intentCount / maxIntent) * 50) : 0;
  const trendScore   = total > 1 ? Math.round(((total - rank) / (total - 1)) * 30) : 30;
  const sellerScore  = maxExtra > 0 ? Math.round((extra / maxExtra) * 20) : 0;
  const impactScore  = Math.min(100, buyerIntent + trendScore + sellerScore);
  return { impactScore, buyerIntent, trendScore, sellerScore };
}

// ── Build recommendations ──────────────────────────────────────────────────────

function buildRecs(
  intel?:   Intelligence | null,
  growth?:  GrowthData   | null,
  sellers?: SellerData   | null,
): Rec[] {
  const recs: Rec[] = [];

  const maxProdIntent = Math.max(...(intel?.trending_products   ?? []).map((p) => p.intention_count), 1);
  const maxCatIntent  = Math.max(...(intel?.trending_categories ?? []).map((c) => c.intention_count), 1);

  // ── Featured products (from trending_products)
  (intel?.trending_products ?? []).slice(0, 5).forEach((p, i) => {
    const { impactScore, buyerIntent, trendScore, sellerScore } = calcImpact(
      p.intention_count, maxProdIntent, i + 1, intel!.trending_products.length,
    );
    recs.push({
      id:          `prod-${p.product_id}`,
      section:     "product",
      title:       p.nombre,
      reason:      `${p.intention_count} buyer intentions in 7 days`,
      impactScore,
      buyerIntent,
      trendScore,
      sellerScore,
      meta:        i === 0 ? "🔥 Top trending" : i === 1 ? "📈 Rising" : undefined,
    });
  });

  // ── Promote categories (from intelligence)
  (intel?.trending_categories ?? []).slice(0, 4).forEach((c, i) => {
    const { impactScore, buyerIntent, trendScore, sellerScore } = calcImpact(
      c.intention_count, maxCatIntent, i + 1, intel!.trending_categories.length,
    );
    recs.push({
      id:          `cat-${c.categoria_id}`,
      section:     "category",
      title:       c.nombre,
      reason:      `${c.intention_count} buyer intentions · high demand`,
      impactScore,
      buyerIntent,
      trendScore,
      sellerScore,
      meta:        i === 0 ? "🔥 Most active" : undefined,
    });
  });

  // ── Category gaps from growth opportunities
  (growth?.opportunities ?? [])
    .filter((o) => o.type === "category_opportunity" && o.category)
    .slice(0, 2)
    .forEach((o) => {
      if (recs.find((r) => r.section === "category" && r.title === o.category)) return;
      const demandExtra = o.demand_score;
      const { impactScore, buyerIntent, trendScore, sellerScore } = calcImpact(
        0, 1, 1, 1, demandExtra, 100,
      );
      recs.push({
        id:          `opp-${o.category}`,
        section:     "category",
        title:       o.category!,
        reason:      `High demand gap · ${o.suggestion}`,
        impactScore: Math.min(95, impactScore + 20), // gap bonus
        buyerIntent,
        trendScore,
        sellerScore,
        meta:        "📈 Supply gap",
      });
    });

  // ── Highlight sellers
  const maxSellerIntent = Math.max(...(sellers?.top_sellers ?? []).map((s) => s.intention_count), 1);
  const maxProductCount = Math.max(...(sellers?.top_sellers ?? []).map((s) => s.product_count), 1);

  (sellers?.top_sellers ?? []).slice(0, 4).forEach((s, i) => {
    const { impactScore, buyerIntent, trendScore, sellerScore } = calcImpact(
      s.intention_count, maxSellerIntent, i + 1, (sellers!.top_sellers ?? []).length,
      s.product_count, maxProductCount,
    );
    recs.push({
      id:          `sel-${s.id}`,
      section:     "seller",
      title:       s.nombre_comercio,
      reason:      `${s.intention_count} intentions · ${s.product_count} listings`,
      impactScore,
      buyerIntent,
      trendScore,
      sellerScore,
      meta:        i === 0 ? "⭐ Best performer" : undefined,
    });
  });

  return recs;
}

// ── Impact bar ─────────────────────────────────────────────────────────────────

function ImpactBar({ rec }: { rec: Rec }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Impact</span>
        <span className={`font-bold tabular-nums ${
          rec.impactScore >= 70 ? "text-green-600 dark:text-green-400" :
          rec.impactScore >= 40 ? "text-yellow-600 dark:text-yellow-400" :
                                  "text-muted-foreground"
        }`}>{rec.impactScore}/100</span>
      </div>
      {/* Stacked bar: intent + trend + seller */}
      <div className="h-2 rounded-full bg-muted overflow-hidden flex">
        <div className="h-full bg-blue-500"   style={{ width: `${rec.buyerIntent}%` }} />
        <div className="h-full bg-green-500"  style={{ width: `${rec.trendScore}%` }} />
        <div className="h-full bg-violet-400" style={{ width: `${rec.sellerScore}%` }} />
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span><span className="inline-block w-2 h-2 rounded-sm bg-blue-500 mr-1" />intent</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-green-500 mr-1" />trend</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-violet-400 mr-1" />score</span>
      </div>
    </div>
  );
}

// ── RecCard ────────────────────────────────────────────────────────────────────

function RecCard({ rec }: { rec: Rec }) {
  return (
    <div className="border rounded-md p-3 space-y-2.5 hover:bg-muted/30 transition-colors">
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold truncate">{rec.title}</span>
          {rec.meta && <span className="text-xs text-muted-foreground shrink-0">{rec.meta}</span>}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
      </div>
      <ImpactBar rec={rec} />
    </div>
  );
}

// ── Column ─────────────────────────────────────────────────────────────────────

function RecColumn({
  label, icon, recs, emptyText,
}: {
  label: string; icon: string; recs: Rec[]; emptyText: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
        <Badge variant="secondary" className="text-xs ml-auto">{recs.length}</Badge>
      </div>
      {recs.length === 0
        ? <p className="text-xs text-muted-foreground">{emptyText}</p>
        : <div className="space-y-2">{recs.map((r) => <RecCard key={r.id} rec={r} />)}</div>
      }
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AIHomepageStrategyPanel() {
  const intelRes   = useBrainFetch<Intelligence>("/api/admin/ai/intelligence",  "intelligence");
  const growthRes  = useBrainFetch<GrowthData>  ("/api/admin/ai/opportunities", "growth");
  const sellersRes = useBrainFetch<SellerData>  ("/api/admin/ai/sellers",       "sellers");

  const anyLoading = intelRes.loading || growthRes.loading || sellersRes.loading;

  const recs = useMemo(
    () => buildRecs(intelRes.data, growthRes.data, sellersRes.data),
    [intelRes.data, growthRes.data, sellersRes.data],
  );

  const products   = recs.filter((r) => r.section === "product");
  const categories = recs.filter((r) => r.section === "category");
  const sellers    = recs.filter((r) => r.section === "seller");

  if (anyLoading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-52" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-md" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5">
          <h2 className="font-semibold text-sm">Homepage AI Engine</h2>
          <p className="text-xs text-muted-foreground">
            impact_score = buyer_intent (50%) + trend_score (30%) + seller_score (20%)
          </p>
        </div>
        <Badge variant="secondary">{recs.length} recommendations</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
        <RecColumn label="Feature Products"   icon="📦" recs={products}   emptyText="No trending products yet." />
        <RecColumn label="Promote Categories" icon="🏷" recs={categories} emptyText="No category signals yet." />
        <RecColumn label="Highlight Sellers"  icon="🏪" recs={sellers}    emptyText="No seller data yet."       />
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500" /> Buyer intent</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500" /> Trend score</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-violet-400" /> Seller/supply score</span>
      </div>
    </div>
  );
}
