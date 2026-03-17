"use client";

import { useMemo }  from "react";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type Severity = "low" | "medium" | "high" | "critical";

type Risk = {
  type:        string;
  severity:    Severity;
  description: string;
  seller_id?:  number | null;
  product_id?: string | null;
  count?:      number;
};

type RiskData = {
  risks:        Risk[];
  evaluated_at: string;
};

type TrendingProduct = { product_id: string; nombre: string; intention_count: number };

type Intelligence = {
  products_total:         number;
  products_without_views: number;
  trending_products:      TrendingProduct[];
  generated_at:           string;
};

// ── Anomaly model ──────────────────────────────────────────────────────────────

type AnomalyKind =
  | "view_spike"
  | "duplicate_listing"
  | "price_anomaly"
  | "seller_behavior"
  | "spam_listing"
  | "supply_gap";

type Anomaly = {
  id:          string;
  kind:        AnomalyKind;
  title:       string;
  description: string;
  severity:    Severity;
  count?:      number;
  seller_id?:  number | null;
  product_id?: string | null;
};

// ── Risk type → anomaly kind mapping ──────────────────────────────────────────

const RISK_KIND_MAP: Record<string, AnomalyKind> = {
  duplicate_products:  "duplicate_listing",
  duplicate_listings:  "duplicate_listing",
  unusual_price:       "price_anomaly",
  suspicious_price:    "price_anomaly",
  price_anomaly:       "price_anomaly",
  suspicious_seller:   "seller_behavior",
  suspicious_sellers:  "seller_behavior",
  spam_listings:       "spam_listing",
  spam_listing:        "spam_listing",
};

function riskToAnomaly(risk: Risk, i: number): Anomaly {
  const kind = RISK_KIND_MAP[risk.type] ?? "seller_behavior";
  return {
    id:          `risk-${i}`,
    kind,
    title:       risk.type.replace(/_/g, " "),
    description: risk.description,
    severity:    risk.severity,
    count:       risk.count,
    seller_id:   risk.seller_id,
    product_id:  risk.product_id,
  };
}

// ── Derive view spikes from intelligence ───────────────────────────────────────

function deriveViewSpikes(intel: Intelligence | null): Anomaly[] {
  if (!intel) return [];
  const anomalies: Anomaly[] = [];

  // Products with very high intent but potentially insufficient supply = spike signal
  const spikes = intel.trending_products.filter((p) => p.intention_count >= 5);
  if (spikes.length > 0) {
    const top = spikes[0];
    anomalies.push({
      id:          "view-spike-top",
      kind:        "view_spike",
      title:       "View / Intent Spike Detected",
      description: `"${top.nombre}" saw ${top.intention_count} buyer intentions in 7 days — unusually high engagement may indicate a trending viral product.`,
      severity:    top.intention_count >= 20 ? "high" : "medium",
      count:       spikes.length,
      product_id:  top.product_id,
    });
  }

  // Many products without views = visibility anomaly
  const noViewPct = intel.products_total > 0
    ? intel.products_without_views / intel.products_total
    : 0;
  if (noViewPct > 0.5) {
    anomalies.push({
      id:          "no-view-anomaly",
      kind:        "supply_gap",
      title:       "Low-Visibility Anomaly",
      description: `${Math.round(noViewPct * 100)}% of products (${intel.products_without_views.toLocaleString()}) have zero views — may indicate an indexing or surfacing issue.`,
      severity:    noViewPct > 0.7 ? "high" : "medium",
      count:       intel.products_without_views,
    });
  }

  return anomalies;
}

// ── Kind config ────────────────────────────────────────────────────────────────

const KIND_CONFIG: Record<AnomalyKind, { icon: string; label: string; color: string }> = {
  view_spike:       { icon: "📈", label: "View Spike",         color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  duplicate_listing:{ icon: "♊", label: "Duplicate Listing",  color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  price_anomaly:    { icon: "💸", label: "Price Anomaly",      color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"             },
  seller_behavior:  { icon: "⚠", label: "Seller Behavior",    color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"  },
  spam_listing:     { icon: "🚫", label: "Spam Listing",       color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"             },
  supply_gap:       { icon: "📉", label: "Supply Gap",         color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"         },
};

const SEV_BORDER: Record<Severity, string> = {
  critical: "border-l-4 border-red-500",
  high:     "border-l-4 border-orange-500",
  medium:   "border-l-4 border-yellow-400",
  low:      "border-l-4 border-blue-300",
};

const SEV_BADGE: Record<Severity, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0",
  high:     "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 border-0",
  medium:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0",
  low:      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0",
};

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AIAnomalyPanel() {
  const risksRes = useBrainFetch<RiskData>    ("/api/admin/ai/risks",        "risks");
  const intelRes = useBrainFetch<Intelligence>("/api/admin/ai/intelligence", "intelligence");

  const anomalies = useMemo<Anomaly[]>(() => {
    const fromRisks = (risksRes.data?.risks ?? []).map(riskToAnomaly);
    const fromIntel = deriveViewSpikes(intelRes.data);
    // De-duplicate by id, merge lists, sort by severity
    const ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...fromRisks, ...fromIntel].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
  }, [risksRes.data, intelRes.data]);

  const anyLoading = risksRes.loading || intelRes.loading;

  // Group counts for header badges
  const critCount = anomalies.filter((a) => a.severity === "critical" || a.severity === "high").length;

  const byKind = anomalies.reduce<Record<string, number>>((acc, a) => {
    acc[a.kind] = (acc[a.kind] ?? 0) + 1;
    return acc;
  }, {});

  if (anyLoading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-44" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg overflow-hidden">

      {/* Header bar */}
      <div className={`px-4 py-3 flex items-center justify-between gap-3 flex-wrap border-b ${
        critCount > 0 ? "bg-orange-50 dark:bg-orange-950/20" : "bg-card"
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Anomaly Detection</span>
          <Badge variant="secondary">{anomalies.length} anomalies</Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(byKind).map(([kind, count]) => {
            const cfg = KIND_CONFIG[kind as AnomalyKind];
            if (!cfg) return null;
            return (
              <span key={kind} className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                {cfg.icon} {count} {cfg.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {anomalies.length === 0 && (
          <div className="flex items-center gap-2 p-3 rounded-md border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
            <span className="text-green-600 font-bold text-lg">✓</span>
            <p className="text-sm text-green-700 dark:text-green-400">No anomalies detected in this cycle.</p>
          </div>
        )}

        <ul className="space-y-2">
          {anomalies.map((a) => {
            const cfg = KIND_CONFIG[a.kind];
            return (
              <li
                key={a.id}
                className={`p-3 rounded-md bg-muted/10 ${SEV_BORDER[a.severity]}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg leading-none shrink-0 mt-0.5">{cfg.icon}</span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-xs ${SEV_BADGE[a.severity]}`}>
                        {a.severity}
                      </Badge>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="text-xs font-semibold capitalize">
                        {a.title}
                      </span>
                      {a.count !== undefined && (
                        <span className="text-xs text-muted-foreground">{a.count} affected</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a.description}</p>
                    {(a.seller_id != null || a.product_id != null) && (
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        {a.seller_id  != null && <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Seller #{a.seller_id}</span>}
                        {a.product_id != null && <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Product {a.product_id}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {risksRes.data && (
          <p className="text-xs text-muted-foreground text-right">
            Evaluated at {new Date(risksRes.data.evaluated_at).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
