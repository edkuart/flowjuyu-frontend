"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type Severity = "low" | "medium" | "high" | "critical";
type Risk     = { severity: Severity; type: string };

type RiskData = {
  risks:        Risk[];
  evaluated_at: string;
};

type Intelligence = {
  products_total:          number;
  products_without_images: number;
  products_without_views:  number;
  inactive_sellers:        number;
  trending_products:       unknown[];
  trending_categories:     unknown[];
  generated_at:            string;
};

// ── Health score formula ───────────────────────────────────────────────────────
//
// health_score = 100
//   − critical_risk_penalty  (each critical: −15, cap −30)
//   − high_risk_penalty      (each high:     −10, cap −20)
//   − medium_risk_penalty    (each medium:   − 5, cap −10)
//   − inactive_sellers_penalty  (> 5 inactive: −10)
//   − visibility_penalty     (> 40% no views: −5)
//   − image_quality_penalty  (> 20% no images: −8)
//   + trending_bonus         (> 0 trending products: +5)
//
// Bands: 80-100 Healthy | 60-79 Fair | 40-59 At Risk | 0-39 Critical
//

type FactorRow = {
  label:    string;
  delta:    number;
  reason:   string;
  severity: "positive" | "warning" | "negative" | "neutral";
};

type Band = "healthy" | "fair" | "at_risk" | "critical";

type HealthResult = {
  score:   number;
  band:    Band;
  factors: FactorRow[];
};

function computeHealth(risks: RiskData | null, intel: Intelligence | null): HealthResult {
  let score = 100;
  const factors: FactorRow[] = [];

  // ── Risk penalties
  if (risks) {
    const crit = risks.risks.filter((r) => r.severity === "critical").length;
    const high = risks.risks.filter((r) => r.severity === "high").length;
    const med  = risks.risks.filter((r) => r.severity === "medium").length;
    const low  = risks.risks.filter((r) => r.severity === "low").length;

    if (crit > 0) {
      const d = -Math.min(30, crit * 15);
      score += d;
      factors.push({ label: "Critical Risks",  delta: d, reason: `${crit} critical risk${crit > 1 ? "s" : ""} detected`, severity: "negative" });
    }
    if (high > 0) {
      const d = -Math.min(20, high * 10);
      score += d;
      factors.push({ label: "High Risks",      delta: d, reason: `${high} high-severity risk${high > 1 ? "s" : ""} detected`, severity: "negative" });
    }
    if (med > 0) {
      const d = -Math.min(10, med * 5);
      score += d;
      factors.push({ label: "Medium Risks",    delta: d, reason: `${med} medium risk${med > 1 ? "s" : ""}`, severity: "warning" });
    }
    if (low > 0) {
      factors.push({ label: "Low Risks",       delta: 0, reason: `${low} low-severity risk${low > 1 ? "s" : ""} — monitoring`, severity: "neutral" });
    }
    if (crit === 0 && high === 0 && med === 0 && low === 0) {
      factors.push({ label: "Risk Detection",  delta: 0, reason: "No risks detected this cycle", severity: "positive" });
    }
  }

  // ── Intelligence penalties / bonuses
  if (intel) {
    const total = intel.products_total || 1;

    // Inactive sellers
    if (intel.inactive_sellers > 5) {
      const d = -10;
      score += d;
      factors.push({ label: "Inactive Sellers",   delta: d, reason: `${intel.inactive_sellers} sellers inactive 30d+`, severity: "warning" });
    } else {
      factors.push({ label: "Seller Activity",    delta: 0, reason: `Only ${intel.inactive_sellers} inactive sellers`, severity: "positive" });
    }

    // Visibility
    const noViewPct = intel.products_without_views / total;
    if (noViewPct > 0.4) {
      const d = -5;
      score += d;
      factors.push({ label: "Low Visibility",     delta: d, reason: `${Math.round(noViewPct * 100)}% of products have no views`, severity: "warning" });
    } else {
      factors.push({ label: "Product Visibility", delta: 0, reason: `${Math.round((1 - noViewPct) * 100)}% of products have views`, severity: "positive" });
    }

    // Image quality
    const imgMissingPct = intel.products_without_images / total;
    if (imgMissingPct > 0.2) {
      const d = -8;
      score += d;
      factors.push({ label: "Image Quality",      delta: d, reason: `${Math.round(imgMissingPct * 100)}% of products missing images`, severity: "warning" });
    } else {
      factors.push({ label: "Image Quality",      delta: 0, reason: `Only ${Math.round(imgMissingPct * 100)}% missing images — healthy`, severity: "positive" });
    }

    // Trending bonus
    const trendCount = (intel.trending_products as unknown[]).length;
    if (trendCount > 0) {
      const d = +5;
      score += d;
      factors.push({ label: "Trending Activity",  delta: d, reason: `${trendCount} trending products driving demand`, severity: "positive" });
    }
  }

  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const band: Band =
    clamped >= 80 ? "healthy"  :
    clamped >= 60 ? "fair"     :
    clamped >= 40 ? "at_risk"  : "critical";

  return { score: clamped, band, factors };
}

// ── Band config ────────────────────────────────────────────────────────────────

const BAND_CFG: Record<Band, { label: string; ring: string; text: string; card: string }> = {
  healthy:  { label: "Healthy",  ring: "#22c55e", text: "text-green-600 dark:text-green-400",   card: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"    },
  fair:     { label: "Fair",     ring: "#eab308", text: "text-yellow-600 dark:text-yellow-400", card: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800" },
  at_risk:  { label: "At Risk",  ring: "#f97316", text: "text-orange-600 dark:text-orange-400", card: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800" },
  critical: { label: "Critical", ring: "#ef4444", text: "text-red-600 dark:text-red-400",       card: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"             },
};

const FACTOR_SEV: Record<FactorRow["severity"], { delta: string; dot: string }> = {
  positive: { delta: "text-green-600 dark:text-green-400",   dot: "bg-green-500"   },
  warning:  { delta: "text-yellow-600 dark:text-yellow-400", dot: "bg-yellow-400"  },
  negative: { delta: "text-red-600 dark:text-red-400",       dot: "bg-red-500"     },
  neutral:  { delta: "text-muted-foreground",                dot: "bg-muted-foreground/50" },
};

// ── Gauge SVG ──────────────────────────────────────────────────────────────────

function GaugeRing({ score, color }: { score: number; color: string }) {
  const r    = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <svg width="128" height="128" viewBox="0 0 128 128" className="shrink-0">
      <circle cx="64" cy="64" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
      <circle
        cx="64" cy="64" r={r}
        fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 64 64)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="64" y="58" textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: "28px", fontWeight: 700, fill: color }}>
        {score}
      </text>
      <text x="64" y="78" textAnchor="middle" dominantBaseline="middle"
        className="text-muted-foreground fill-current"
        style={{ fontSize: "11px" }}>
        / 100
      </text>
    </svg>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AIMarketplaceHealthScore({
  realSellerCount,
}: {
  /** When provided (from telemetry filtered_metrics), shown as a note alongside the raw count. */
  realSellerCount?: number;
}) {
  const risksRes = useBrainFetch<RiskData>    ("/api/admin/ai/risks",        "risks");
  const intelRes = useBrainFetch<Intelligence>("/api/admin/ai/intelligence", "intelligence");

  const health = useMemo(
    () => computeHealth(risksRes.data, intelRes.data),
    [risksRes.data, intelRes.data],
  );

  if (risksRes.loading || intelRes.loading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-52" />
        <div className="flex gap-6">
          <Skeleton className="w-28 h-28 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 pt-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  const cfg = BAND_CFG[health.band];

  return (
    <div className={`border rounded-lg p-4 space-y-4 ${cfg.card}`}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5">
          <h2 className="font-semibold text-sm">Marketplace Health Score</h2>
          <p className="text-xs text-muted-foreground">
            100 − risk_penalty − inactive_penalty − visibility_penalty + trending_bonus
          </p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.card} ${cfg.text}`}>
          {cfg.label}
        </span>
      </div>

      {/* Score + factors */}
      <div className="flex items-start gap-6 flex-wrap">
        <GaugeRing score={health.score} color={cfg.ring} />

        <div className="flex-1 min-w-[200px] space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Score Breakdown</p>
          <ul className="space-y-2">
            {health.factors.map((f, i) => {
              const s = FACTOR_SEV[f.severity];
              return (
                <li key={i} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                    <span className="text-muted-foreground truncate">{f.label}</span>
                  </div>
                  <span className="text-muted-foreground/70 hidden md:block truncate max-w-[160px]">
                    {f.reason}
                  </span>
                  <span className={`font-bold tabular-nums shrink-0 ${s.delta}`}>
                    {f.delta > 0 ? `+${f.delta}` : f.delta === 0 ? "—" : f.delta}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Telemetry hint: real seller count */}
          {realSellerCount !== undefined && intelRes.data && (
            <p className="text-xs text-muted-foreground pt-1 border-t">
              Seller count (filtered): <span className="font-semibold text-foreground">{realSellerCount}</span> real
              {" "}vs {intelRes.data.inactive_sellers} raw — score computed from raw data.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
