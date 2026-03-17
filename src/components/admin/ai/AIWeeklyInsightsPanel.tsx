"use client";

import { useMemo, useState }  from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrainFetch } from "./useBrainFetch";

// ── Source types ───────────────────────────────────────────────────────────────

type TrendingProduct  = { product_id: string; nombre: string; intention_count: number };
type TrendingCategory = { categoria_id: number; nombre: string; intention_count: number };

type Intelligence = {
  products_total:          number;
  products_without_images: number;
  products_without_views:  number;
  inactive_sellers:        number;
  trending_products:       TrendingProduct[];
  trending_categories:     TrendingCategory[];
  generated_at:            string;
};

type Severity = "low" | "medium" | "high" | "critical";
type Risk     = { severity: Severity; type: string };
type RiskData = { risks: Risk[]; evaluated_at: string };

type SellerMetrics = { id: number; nombre_comercio: string; intention_count: number; product_count: number };
type SellerData    = {
  top_sellers:      SellerMetrics[];
  inactive_sellers: SellerMetrics[];
  risky_sellers:    SellerMetrics[];
  generated_at:     string;
};

// ── Insight type ───────────────────────────────────────────────────────────────

type InsightCategory = "trend" | "risk" | "health" | "seller" | "quality" | "growth" | "conversion" | "supply";

type Insight = {
  id:          string;
  category:    InsightCategory;
  icon:        string;
  headline:    string;
  detail:      string;
  metric:      string;
  direction:   "up" | "down" | "neutral";
  severity:    "positive" | "warning" | "negative" | "neutral";
};

// ── Category config ────────────────────────────────────────────────────────────

const CAT_CONFIG: Record<InsightCategory, { label: string; badge: string }> = {
  trend:      { label: "Trend",      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"           },
  risk:       { label: "Risk",       badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"                },
  health:     { label: "Health",     badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"        },
  seller:     { label: "Seller",     badge: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"    },
  quality:    { label: "Quality",    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"    },
  growth:     { label: "Growth",     badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"    },
  conversion: { label: "Conversion", badge: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300"            },
  supply:     { label: "Supply",     badge: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300"            },
};

const SEV_STYLES: Record<Insight["severity"], { border: string; bg: string; dir: string }> = {
  positive: { border: "border-green-200 dark:border-green-800",   bg: "bg-green-50/50 dark:bg-green-950/10",   dir: "text-green-600 dark:text-green-400"   },
  warning:  { border: "border-yellow-200 dark:border-yellow-800", bg: "bg-yellow-50/50 dark:bg-yellow-950/10", dir: "text-yellow-600 dark:text-yellow-400" },
  negative: { border: "border-red-200 dark:border-red-800",       bg: "bg-red-50/50 dark:bg-red-950/10",       dir: "text-red-600 dark:text-red-400"       },
  neutral:  { border: "border-border",                            bg: "bg-muted/10",                           dir: "text-muted-foreground"                },
};

const DIRECTION_ARROW: Record<Insight["direction"], string> = {
  up:      "↑",
  down:    "↓",
  neutral: "→",
};

// ── Insight generator ──────────────────────────────────────────────────────────

function generateInsights(
  intel?:   Intelligence | null,
  risks?:   RiskData     | null,
  sellers?: SellerData   | null,
): Insight[] {
  const insights: Insight[] = [];

  // ── 1. Top trending product
  if (intel && intel.trending_products.length > 0) {
    const top    = intel.trending_products[0];
    const topCat = intel.trending_categories[0];
    insights.push({
      id:        "top-product-trend",
      category:  "trend",
      icon:      "🔥",
      headline:  `"${top.nombre}" is your top trending product this week`,
      detail:    `Recorded ${top.intention_count} buyer intentions in the last 7 days.${topCat ? ` Category "${topCat.nombre}" also showing strong demand.` : ""}`,
      metric:    `${top.intention_count} intentions`,
      direction: "up",
      severity:  "positive",
    });
  }

  // ── 2. Category growth & concentration
  if (intel && intel.trending_categories.length >= 2) {
    const cats  = intel.trending_categories;
    const top   = cats[0];
    const total = cats.reduce((s, c) => s + c.intention_count, 0);
    const share = total > 0 ? Math.round((top.intention_count / total) * 100) : 0;

    if (share >= 60) {
      insights.push({
        id:        "category-concentration",
        category:  "growth",
        icon:      "📊",
        headline:  `"${top.nombre}" is over-concentrated — ${share}% of all intent`,
        detail:    `Heavy concentration in one category can indicate an opportunity gap in others. ${cats.length} total categories active this week.`,
        metric:    `${share}% concentration`,
        direction: "neutral",
        severity:  "warning",
      });
    } else {
      insights.push({
        id:        "category-diversity",
        category:  "growth",
        icon:      "📈",
        headline:  `${cats.length} categories are driving demand — healthy diversification`,
        detail:    `"${top.nombre}" leads with ${share}% of intent. Balanced category demand reduces supply risk.`,
        metric:    `${cats.length} active cats`,
        direction: "up",
        severity:  share >= 40 ? "neutral" : "positive",
      });
    }
  }

  // ── 3. Risk / health
  if (risks) {
    const critical = risks.risks.filter((r) => r.severity === "critical").length;
    const high     = risks.risks.filter((r) => r.severity === "high").length;
    const total    = risks.risks.length;

    if (critical > 0) {
      insights.push({
        id:        "critical-risks",
        category:  "risk",
        icon:      "🚨",
        headline:  `${critical} critical risk${critical > 1 ? "s" : ""} require immediate attention`,
        detail:    `${total} total risks detected. Critical risks can affect buyer trust and seller retention if unresolved. Review the Risk Detection panel.`,
        metric:    `${critical} critical · ${high} high`,
        direction: "down",
        severity:  "negative",
      });
    } else if (high > 0) {
      insights.push({
        id:        "high-risks",
        category:  "risk",
        icon:      "⚠",
        headline:  `${high} high-severity risk${high > 1 ? "s" : ""} need review this week`,
        detail:    `No critical risks detected. ${high} high-severity items require attention. ${total - high} lower-severity risks are being monitored.`,
        metric:    `${high} high severity`,
        direction: "neutral",
        severity:  "warning",
      });
    } else if (total === 0) {
      insights.push({
        id:        "no-risks",
        category:  "health",
        icon:      "✅",
        headline:  "Marketplace health is strong — zero risks detected",
        detail:    "Risk scan completed with no anomalies. Sellers, prices, and listings are all within normal parameters.",
        metric:    "0 risks",
        direction: "up",
        severity:  "positive",
      });
    } else {
      insights.push({
        id:        "minor-risks",
        category:  "risk",
        icon:      "🔍",
        headline:  `${total} low-severity risk${total > 1 ? "s" : ""} detected — monitoring`,
        detail:    `No critical or high-severity risks. ${total} minor items are under observation. Review the Risk panel for details.`,
        metric:    `${total} monitored`,
        direction: "neutral",
        severity:  "neutral",
      });
    }
  }

  // ── 4. Conversion quality: intentions vs views
  if (intel && intel.trending_products.length > 0) {
    const totalIntents   = intel.trending_products.reduce((s, p) => s + p.intention_count, 0);
    const viewedProducts = intel.products_total - intel.products_without_views;
    const convSignal     = viewedProducts > 0 ? Math.round((totalIntents / viewedProducts) * 10) / 10 : 0;

    if (convSignal >= 2) {
      insights.push({
        id:        "conversion-signal",
        category:  "conversion",
        icon:      "🎯",
        headline:  `Strong conversion signal — ${convSignal} intentions per viewed product`,
        detail:    `${totalIntents} total buyer intentions across ${viewedProducts} products with views. High intent-to-view ratio indicates strong buyer readiness.`,
        metric:    `${convSignal}× intent/view`,
        direction: "up",
        severity:  "positive",
      });
    } else if (intel.products_without_views > intel.products_total * 0.5) {
      insights.push({
        id:        "conversion-low-visibility",
        category:  "conversion",
        icon:      "📉",
        headline:  "Low product visibility is suppressing buyer conversion",
        detail:    `${Math.round((intel.products_without_views / intel.products_total) * 100)}% of products have no views. Improving discoverability could unlock significant latent demand.`,
        metric:    `${intel.products_without_views} unviewed`,
        direction: "down",
        severity:  "warning",
      });
    }
  }

  // ── 5. Supply gap: trending with missing images
  if (intel && intel.trending_products.length > 0) {
    const imgMissingPct = intel.products_total > 0
      ? Math.round((intel.products_without_images / intel.products_total) * 100)
      : 0;

    if (imgMissingPct >= 15 && intel.trending_products.length > 0) {
      insights.push({
        id:        "supply-image-gap",
        category:  "supply",
        icon:      "📦",
        headline:  `${imgMissingPct}% of listings lack images — reducing buyer confidence`,
        detail:    `${intel.products_without_images.toLocaleString()} products missing photos while demand is active. Sellers should be prompted to upload images for trending items.`,
        metric:    `${intel.products_without_images.toLocaleString()} listings`,
        direction: "down",
        severity:  imgMissingPct >= 30 ? "negative" : "warning",
      });
    } else if (imgMissingPct < 10) {
      insights.push({
        id:        "supply-image-healthy",
        category:  "supply",
        icon:      "✨",
        headline:  "Listing quality is strong — most products have images",
        detail:    `Only ${imgMissingPct}% of products are missing images. High image coverage supports buyer trust and conversion.`,
        metric:    `${100 - imgMissingPct}% with images`,
        direction: "up",
        severity:  "positive",
      });
    }
  }

  // ── 6. Top seller
  if (sellers && sellers.top_sellers.length > 0) {
    const topSeller  = sellers.top_sellers[0];
    const inactCount = sellers.inactive_sellers.length;
    insights.push({
      id:        "top-seller",
      category:  "seller",
      icon:      "⭐",
      headline:  `"${topSeller.nombre_comercio}" is your most active seller this week`,
      detail:    `Leading with ${topSeller.intention_count} buyer intentions and ${topSeller.product_count} active listings. ${inactCount > 0 ? `${inactCount} seller${inactCount > 1 ? "s are" : " is"} inactive (30d+) and may need outreach.` : "All other sellers are active."}`,
      metric:    `${topSeller.intention_count} intentions`,
      direction: "up",
      severity:  "positive",
    });
  }

  // ── 7. Seller reactivation opportunity
  if (sellers && sellers.inactive_sellers.length >= 3) {
    const inactCount     = sellers.inactive_sellers.length;
    const avgProdCount   = sellers.inactive_sellers.length > 0
      ? Math.round(sellers.inactive_sellers.reduce((s, x) => s + x.product_count, 0) / sellers.inactive_sellers.length)
      : 0;
    insights.push({
      id:        "seller-reactivation",
      category:  "seller",
      icon:      "😴",
      headline:  `${inactCount} dormant sellers — reactivation could recover ${inactCount * avgProdCount}+ listings`,
      detail:    `Each inactive seller has an average of ${avgProdCount} products. A targeted reactivation campaign could significantly expand supply and GMV.`,
      metric:    `${inactCount} inactive`,
      direction: "down",
      severity:  inactCount >= 5 ? "negative" : "warning",
    });
  }

  // ── 8. Risky sellers
  if (sellers && sellers.risky_sellers && sellers.risky_sellers.length > 0) {
    const count = sellers.risky_sellers.length;
    insights.push({
      id:        "risky-sellers",
      category:  "risk",
      icon:      "🚩",
      headline:  `${count} seller${count > 1 ? "s" : ""} flagged for quality issues`,
      detail:    `Sellers with low listing quality reduce buyer trust. Review the Seller Score Panel to identify specific issues and take corrective action.`,
      metric:    `${count} flagged`,
      direction: "down",
      severity:  count >= 3 ? "negative" : "warning",
    });
  }

  // ── 9. Trend velocity
  if (intel && intel.trending_products.length > 0) {
    const trendingCount = intel.trending_products.length;
    const totalProducts = intel.products_total;
    const trendPct      = totalProducts > 0 ? Math.round((trendingCount / totalProducts) * 100) : 0;

    if (trendPct >= 10) {
      insights.push({
        id:        "trend-velocity",
        category:  "trend",
        icon:      "⚡",
        headline:  `${trendPct}% of products are actively trending — high market velocity`,
        detail:    `${trendingCount} of ${totalProducts.toLocaleString()} products recorded buying intent this week. Strong demand signals indicate a healthy marketplace.`,
        metric:    `${trendingCount} trending`,
        direction: "up",
        severity:  "positive",
      });
    }
  }

  // ── Sort: negative → warning → positive → neutral
  const SEV_ORDER: Record<Insight["severity"], number> = { negative: 0, warning: 1, positive: 2, neutral: 3 };
  insights.sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);

  return insights;
}

// ── InsightCard ────────────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: Insight }) {
  const cat = CAT_CONFIG[insight.category];
  const sev = SEV_STYLES[insight.severity];
  const arr = DIRECTION_ARROW[insight.direction];

  return (
    <div className={`border rounded-md p-4 space-y-2 ${sev.border} ${sev.bg}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none shrink-0 mt-0.5">{insight.icon}</span>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.badge}`}>{cat.label}</span>
            <span className={`text-xs font-bold ${sev.dir}`}>{arr} {insight.metric}</span>
          </div>
          <p className="text-sm font-semibold leading-snug">{insight.headline}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{insight.detail}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

const ALL_CATS = ["all", "trend", "risk", "health", "seller", "quality", "growth", "conversion", "supply"] as const;
type FilterCat = typeof ALL_CATS[number];

export default function AIWeeklyInsightsPanel() {
  const intelRes   = useBrainFetch<Intelligence>("/api/admin/ai/intelligence", "intelligence");
  const risksRes   = useBrainFetch<RiskData>    ("/api/admin/ai/risks",        "risks");
  const sellersRes = useBrainFetch<SellerData>  ("/api/admin/ai/sellers",      "sellers");

  const [filter, setFilter] = useState<FilterCat>("all");

  const anyLoading = intelRes.loading || risksRes.loading || sellersRes.loading;

  const insights = useMemo(
    () => generateInsights(intelRes.data, risksRes.data, sellersRes.data),
    [intelRes.data, risksRes.data, sellersRes.data],
  );

  const filtered = filter === "all" ? insights : insights.filter((i) => i.category === filter);

  const positiveCount = insights.filter((i) => i.severity === "positive").length;
  const warningCount  = insights.filter((i) => i.severity === "warning").length;
  const negativeCount = insights.filter((i) => i.severity === "negative").length;

  if (anyLoading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-52" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-md" />)}
        </div>
      </div>
    );
  }

  const now     = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const dateRange = `${weekAgo.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;

  // Determine which filter categories actually have insights
  const activeCats = ALL_CATS.filter((c) =>
    c === "all" || insights.some((i) => i.category === c),
  );

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5">
          <h2 className="font-semibold text-sm">Weekly Insights</h2>
          <p className="text-xs text-muted-foreground">{dateRange}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {negativeCount > 0 && (
            <Badge className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0">
              {negativeCount} critical
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0">
              {warningCount} warnings
            </Badge>
          )}
          {positiveCount > 0 && (
            <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
              {positiveCount} positive
            </Badge>
          )}
        </div>
      </div>

      {/* Category filter */}
      {insights.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {activeCats.map((cat) => {
            const count = cat === "all" ? insights.length : insights.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors font-medium capitalize ${
                  filter === cat
                    ? "bg-foreground text-background border-foreground"
                    : "hover:bg-muted/60 border-border text-muted-foreground"
                }`}
              >
                {cat === "all" ? "All" : CAT_CONFIG[cat as InsightCategory].label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      )}

      {insights.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Run the AI Brain cycle to generate weekly insights.
        </p>
      )}

      {/* Insight cards */}
      {filtered.length === 0 && insights.length > 0 && (
        <p className="text-sm text-muted-foreground">No insights in this category.</p>
      )}

      <div className="space-y-3">
        {filtered.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {insights.length > 0 && (
        <p className="text-xs text-muted-foreground text-right border-t pt-2">
          {insights.length} insights · Generated from live marketplace data
        </p>
      )}
    </div>
  );
}
