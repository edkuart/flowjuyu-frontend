"use client";

import { useMemo }  from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type SellerMetrics = {
  id:              number;
  nombre_comercio: string;
  product_count:   number;
  intention_count: number;
  last_active?:    string | null;
};

type SellerData = {
  top_sellers:      SellerMetrics[];
  risky_sellers:    SellerMetrics[];
  inactive_sellers: SellerMetrics[];
  generated_at:     string;
};

// ── Score formula ──────────────────────────────────────────────────────────────
//
// seller_score =
//   product_count_score     (max 15) — listing volume
//   + purchase_intentions   (max 35) — buyer interest
//   + listing_quality       (max 15) — not in risky list (proxy for image quality)
//   + activity_bonus        (max 10) — is in top_sellers
//   - risk_flags_penalty    (max 25) — is in risky_sellers
//   - inactivity_penalty    (max 30) — is in inactive_sellers
//
// Range: 0–100

type ActivityLevel = "highly_active" | "active" | "low" | "dormant";

type ScoredSeller = SellerMetrics & {
  score:         number;
  flags:         string[];
  activityLevel: ActivityLevel;
  breakdown: {
    productCount:      number;
    purchaseIntention: number;
    listingQuality:    number;
    activityBonus:     number;
    riskPenalty:       number;
    inactivityPenalty: number;
  };
};

function activityLevelOf(score: number, isInactive: boolean): ActivityLevel {
  if (isInactive)   return "dormant";
  if (score >= 75)  return "highly_active";
  if (score >= 50)  return "active";
  if (score >= 25)  return "low";
  return "dormant";
}

function computeScore(
  seller:   SellerMetrics,
  topIds:   Set<number>,
  riskyIds: Set<number>,
  inactIds: Set<number>,
  maxProducts: number,
  maxIntents:  number,
): { score: number; flags: string[]; breakdown: ScoredSeller["breakdown"] } {
  const flags: string[] = [];

  const productCount      = maxProducts > 0 ? Math.round((seller.product_count   / maxProducts) * 15) : 0;
  const purchaseIntention = maxIntents  > 0 ? Math.round((seller.intention_count / maxIntents)  * 35) : 0;
  const listingQuality    = riskyIds.has(seller.id) ? 0 : 15; // proxy: not risky = good quality
  const activityBonus     = topIds.has(seller.id)   ? 10 : 0;
  const riskPenalty       = riskyIds.has(seller.id) ? -25 : 0;
  const inactivityPenalty = inactIds.has(seller.id) ? -30 : 0;

  if (topIds.has(seller.id))   flags.push("Top Seller");
  if (riskyIds.has(seller.id)) flags.push("Needs Attention");
  if (inactIds.has(seller.id)) flags.push("Inactive 30d+");

  const raw   = productCount + purchaseIntention + listingQuality + activityBonus + riskPenalty + inactivityPenalty;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  return {
    score,
    flags,
    breakdown: {
      productCount,
      purchaseIntention,
      listingQuality,
      activityBonus,
      riskPenalty,
      inactivityPenalty,
    },
  };
}

// ── Style helpers ──────────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 75) return "text-green-600 dark:text-green-400";
  if (s >= 50) return "text-yellow-600 dark:text-yellow-400";
  if (s >= 30) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function scoreBg(s: number): string {
  if (s >= 75) return "bg-green-500";
  if (s >= 50) return "bg-yellow-400";
  if (s >= 30) return "bg-orange-400";
  return "bg-red-500";
}

const ACTIVITY_CONFIG: Record<ActivityLevel, { label: string; badge: string }> = {
  highly_active: { label: "Highly Active", badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"    },
  active:        { label: "Active",        badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"          },
  low:           { label: "Low Activity",  badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  dormant:       { label: "Dormant",       badge: "bg-muted text-muted-foreground"                                        },
};

const FLAG_BADGE: Record<string, string> = {
  "Top Seller":      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  "Needs Attention": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "Inactive 30d+":   "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

// ── Seller Card ────────────────────────────────────────────────────────────────

function SellerCard({ seller }: { seller: ScoredSeller }) {
  const act = ACTIVITY_CONFIG[seller.activityLevel];
  const bd  = seller.breakdown;

  return (
    <div className="flex items-start gap-3 p-3 rounded-md border hover:bg-muted/30 transition-colors">
      {/* Score ring */}
      <div className="relative shrink-0 w-12 h-12 flex items-center justify-center">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/40" />
          <circle
            cx="18" cy="18" r="15" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            strokeDasharray={`${(seller.score / 100) * 94.2} 94.2`}
            className={scoreColor(seller.score)}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute text-xs font-bold ${scoreColor(seller.score)}`}>{seller.score}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold truncate">{seller.nombre_comercio}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${act.badge}`}>
            {act.label}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{seller.intention_count} intentions</span>
          <span>·</span>
          <span>{seller.product_count} products</span>
        </div>

        {/* Score bar breakdown */}
        <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
          <div className="h-full bg-blue-400"   title={`Products: +${bd.productCount}`}      style={{ width: `${bd.productCount}%` }} />
          <div className="h-full bg-green-500"  title={`Intent: +${bd.purchaseIntention}`}   style={{ width: `${bd.purchaseIntention}%` }} />
          <div className="h-full bg-violet-400" title={`Quality: +${bd.listingQuality}`}     style={{ width: `${bd.listingQuality}%` }} />
          <div className="h-full bg-yellow-400" title={`Activity bonus: +${bd.activityBonus}`} style={{ width: `${bd.activityBonus}%` }} />
        </div>

        {/* Risk / flag badges */}
        {seller.flags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {seller.flags.map((f) => (
              <span key={f} className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${FLAG_BADGE[f] ?? "bg-muted text-muted-foreground"}`}>
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Penalty indicator */}
        {(bd.riskPenalty < 0 || bd.inactivityPenalty < 0) && (
          <p className="text-xs text-red-500">
            Penalty: {bd.riskPenalty < 0 ? `risk (${bd.riskPenalty})` : ""}
            {bd.riskPenalty < 0 && bd.inactivityPenalty < 0 ? " · " : ""}
            {bd.inactivityPenalty < 0 ? `inactive (${bd.inactivityPenalty})` : ""}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AISellerScorePanel() {
  const { data, loading, error, refetch } =
    useBrainFetch<SellerData>("/api/admin/ai/sellers", "sellers");

  const scored = useMemo<ScoredSeller[]>(() => {
    if (!data) return [];

    const topIds   = new Set(data.top_sellers.map      ((s) => s.id));
    const riskyIds = new Set(data.risky_sellers.map    ((s) => s.id));
    const inactIds = new Set(data.inactive_sellers.map ((s) => s.id));

    // De-duplicate across all three lists
    const seen = new Set<number>();
    const all: SellerMetrics[] = [];
    for (const s of [...data.top_sellers, ...data.risky_sellers, ...data.inactive_sellers]) {
      if (!seen.has(s.id)) { seen.add(s.id); all.push(s); }
    }

    const maxProducts = Math.max(...all.map((s) => s.product_count),   1);
    const maxIntents  = Math.max(...all.map((s) => s.intention_count), 1);

    return all
      .map((s) => {
        const { score, flags, breakdown } = computeScore(s, topIds, riskyIds, inactIds, maxProducts, maxIntents);
        return {
          ...s,
          score,
          flags,
          breakdown,
          activityLevel: activityLevelOf(score, inactIds.has(s.id)),
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [data]);

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-44" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold">Seller Score Panel</p>
        <p className="text-xs text-red-500">{error ?? "No data available."}</p>
        <button onClick={refetch} className="text-xs px-3 py-1 rounded border hover:bg-muted transition-colors">Retry</button>
      </div>
    );
  }

  const avgScore  = scored.length > 0 ? Math.round(scored.reduce((s, x) => s + x.score, 0) / scored.length) : 0;
  const topCount  = scored.filter((s) => s.activityLevel === "highly_active").length;
  const riskCount = scored.filter((s) => s.activityLevel === "dormant" || s.flags.includes("Needs Attention")).length;

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5">
          <h2 className="font-semibold text-sm">Seller Score Panel</h2>
          <p className="text-xs text-muted-foreground">
            score = products (15) + intent (35) + quality (15) + activity (10) − risks (25) − inactivity (30)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${scoreColor(avgScore)}`}>Avg {avgScore}/100</span>
          {topCount  > 0 && <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">{topCount} top</Badge>}
          {riskCount > 0 && <Badge className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0">{riskCount} at risk</Badge>}
        </div>
      </div>

      {/* Bar legend */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span><span className="inline-block w-2 h-2 rounded-sm bg-blue-400 mr-1" />Products</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-green-500 mr-1" />Intent</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-violet-400 mr-1" />Quality</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-yellow-400 mr-1" />Activity</span>
      </div>

      {/* Seller list */}
      {scored.length === 0 ? (
        <p className="text-sm text-muted-foreground">No seller data available.</p>
      ) : (
        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {scored.map((s) => <SellerCard key={s.id} seller={s} />)}
        </div>
      )}

    </div>
  );
}
