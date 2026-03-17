"use client";

import { useMemo }  from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type TrendingProduct  = { product_id: string; nombre: string; intention_count: number };
type TrendingCategory = { categoria_id: number; nombre: string; intention_count: number };

type Intelligence = {
  products_total:          number;
  products_without_images: number;
  products_without_views:  number;
  inactive_sellers:        number;
  trending_products:       TrendingProduct[];
  trending_categories:     TrendingCategory[];
};

type Opportunity = {
  type:         string;
  category?:    string;
  seller?:      string;
  demand_score: number;
  supply_score: number;
  suggestion:   string;
};

type GrowthData = {
  opportunities: Opportunity[];
};

type StrategySuggestion = {
  id:       string;
  icon:     string;
  title:    string;
  body:     string;
  action:   string;
  priority: "high" | "medium" | "low";
};

// ── Suggestion builder ─────────────────────────────────────────────────────────

function buildSuggestions(
  intel: Intelligence | null,
  growth: GrowthData  | null,
): StrategySuggestion[] {
  const suggestions: StrategySuggestion[] = [];

  if (intel) {
    const total      = intel.products_total || 1;
    const missingPct = intel.products_without_images / total;
    const noViewPct  = intel.products_without_views  / total;

    // Missing images → promote quality
    if (missingPct > 0.15) {
      suggestions.push({
        id:       "fix-images",
        icon:     "🖼",
        title:    "Improve Product Image Coverage",
        body:     `${Math.round(missingPct * 100)}% of products are missing images. Listings with images convert 3× better.`,
        action:   "Contact sellers to upload product photos",
        priority: missingPct > 0.3 ? "high" : "medium",
      });
    }

    // No views → increase discoverability
    if (noViewPct > 0.3) {
      suggestions.push({
        id:       "boost-visibility",
        icon:     "🔍",
        title:    "Boost Low-Visibility Products",
        body:     `${Math.round(noViewPct * 100)}% of products have zero views. Consider featuring them on the homepage.`,
        action:   "Feature underperforming products in discovery sections",
        priority: "medium",
      });
    }

    // Inactive sellers → retention
    if (intel.inactive_sellers > 3) {
      suggestions.push({
        id:       "reactivate-sellers",
        icon:     "📣",
        title:    `Reactivate ${intel.inactive_sellers} Inactive Sellers`,
        body:     "Sellers who haven't listed in 30+ days may churn. Outreach now has high ROI.",
        action:   "Send reactivation campaign to inactive seller accounts",
        priority: "high",
      });
    }

    // Trending categories → recruit sellers
    if (intel.trending_categories.length > 0) {
      const top = intel.trending_categories[0];
      suggestions.push({
        id:       "recruit-category",
        icon:     "🎯",
        title:    `Recruit Sellers for "${top.nombre}"`,
        body:     `"${top.nombre}" is trending with ${top.intention_count} buyer intentions but limited supply. Recruit sellers to fill the gap.`,
        action:   "Launch seller recruitment campaign for this category",
        priority: "medium",
      });
    }

    // Trending products → promote
    if (intel.trending_products.length > 0) {
      const top = intel.trending_products[0];
      suggestions.push({
        id:       "promote-trending",
        icon:     "🚀",
        title:    `Promote "${top.nombre}"`,
        body:     `This product has ${top.intention_count} buyer intentions in the last 7 days — feature it on the homepage banner.`,
        action:   "Add to homepage featured products",
        priority: "high",
      });
    }
  }

  if (growth) {
    // Category gap opportunities
    const catGaps = growth.opportunities.filter((o) => o.type === "category_opportunity");
    if (catGaps.length > 0) {
      const best = catGaps.sort((a, b) => b.demand_score - a.demand_score)[0];
      suggestions.push({
        id:       "feature-category",
        icon:     "📦",
        title:    `Feature Category: "${best.category ?? "Unknown"}"`,
        body:     `Demand score ${best.demand_score} with supply score ${best.supply_score}. Significant unmet demand.`,
        action:   best.suggestion,
        priority: best.demand_score > 50 ? "high" : "medium",
      });
    }

    // High-growth sellers
    const growthSellers = growth.opportunities.filter((o) => o.type === "high_growth_seller");
    if (growthSellers.length > 0) {
      suggestions.push({
        id:       "reward-sellers",
        icon:     "⭐",
        title:    `Reward ${growthSellers.length} High-Growth Seller${growthSellers.length > 1 ? "s" : ""}`,
        body:     "These sellers are experiencing rapid growth. Rewarding them increases retention and listing frequency.",
        action:   "Enroll in seller rewards or featured seller program",
        priority: "low",
      });
    }
  }

  // Sort: high → medium → low
  const ORDER = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => ORDER[a.priority] - ORDER[b.priority]);

  return suggestions;
}

// ── Priority badge ─────────────────────────────────────────────────────────────

const PRIORITY_STYLE: Record<StrategySuggestion["priority"], string> = {
  high:   "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  low:    "bg-muted text-muted-foreground",
};

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AIStrategyPanel() {
  const intelResult  = useBrainFetch<Intelligence>("/api/admin/ai/intelligence",  "intelligence");
  const growthResult = useBrainFetch<GrowthData>  ("/api/admin/ai/opportunities", "growth");

  const suggestions = useMemo(
    () => buildSuggestions(intelResult.data, growthResult.data),
    [intelResult.data, growthResult.data],
  );

  const anyLoading = intelResult.loading || growthResult.loading;

  if (anyLoading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-52" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">AI Strategy Suggestions</h2>
        <span className="text-xs text-muted-foreground">{suggestions.length} actions</span>
      </div>

      {suggestions.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-md border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
          <span className="text-green-600 font-bold">✓</span>
          <p className="text-sm text-green-700 dark:text-green-400">
            No strategic actions recommended. Marketplace looks healthy!
          </p>
        </div>
      )}

      {/* Suggestion cards */}
      <div className="space-y-3">
        {suggestions.map((s) => (
          <div key={s.id} className="border rounded-md p-4 space-y-2 hover:bg-muted/30 transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none shrink-0 mt-0.5">{s.icon}</span>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{s.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLE[s.priority]}`}>
                    {s.priority}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            </div>

            {/* Action line */}
            <div className="flex items-center gap-2 pl-8">
              <span className="text-xs text-muted-foreground">→</span>
              <p className="text-xs font-medium">{s.action}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
