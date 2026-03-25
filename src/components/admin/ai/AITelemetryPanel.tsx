"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useBrainFetch } from "./useBrainFetch";

// ── Types ──────────────────────────────────────────────────────────────────────

type TrendResult =
  | {
      insufficient_history: true;
      distinct_days:        number;
      note:                 string;
    }
  | {
      insufficient_history?: false;
      first_date:            string;
      last_date:             string;
      first_value:           number;
      last_value:            number;
      delta:                 number;
      direction:             "up" | "down" | "stable";
      distinct_days:         number;
    }
  | null;

type DailyHistory = {
  distinct_days:      number;
  first_day:          string | null;
  last_day:           string | null;
  history_sufficient: boolean;
};

type FilteredMetrics = {
  real_seller_count:           number;
  test_seller_count:           number;
  real_sellers_with_products:  number;
  real_dead_products_count:    number;
  test_dead_products_count:    number;
  real_seller_names:           string[];
  real_dead_product_names:     string[];
  note:                        string;
};

type MetricConflict = {
  metric:             string;
  analytics_value:    number;
  intelligence_value: number;
  delta:              number;
  warning:            boolean;
};

type TelemetryArtifact = {
  schema_version:  string;
  date:            string;
  data_changed:    boolean | null;
  daily_history:   DailyHistory;
  trends: {
    inactive_sellers:        TrendResult;
    products_without_views:  TrendResult;
    products_missing_images: TrendResult;
    products_total:          TrendResult;
  };
  filtered_metrics: FilteredMetrics;
  metric_conflicts: MetricConflict[];
};

// ── Direction arrow + color ─────────────────────────────────────────────────

function directionLabel(direction: "up" | "down" | "stable", metric: string) {
  // For "bad" metrics, up = deteriorating (red), down = improving (green)
  const badMetrics = ["inactive_sellers", "products_without_views", "products_missing_images"];
  const isBad = badMetrics.includes(metric);

  if (direction === "stable") return { arrow: "→", color: "text-muted-foreground" };
  if (direction === "up")
    return isBad
      ? { arrow: "↑", color: "text-red-600 dark:text-red-400" }
      : { arrow: "↑", color: "text-green-600 dark:text-green-400" };
  // down
  return isBad
    ? { arrow: "↓", color: "text-green-600 dark:text-green-400" }
    : { arrow: "↓", color: "text-red-600 dark:text-red-400" };
}

// ── Section heading ─────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </p>
  );
}

// ── 1. Daily History ────────────────────────────────────────────────────────

function DailyHistorySection({ history, dataChanged }: {
  history:     DailyHistory;
  dataChanged: boolean | null;
}) {
  const sufficiencyColor = history.history_sufficient
    ? "text-green-600 dark:text-green-400"
    : "text-yellow-600 dark:text-yellow-400";

  return (
    <div className="space-y-2">
      <SectionHeading>Daily History</SectionHeading>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        <div className="bg-muted/40 rounded-md p-3 space-y-0.5">
          <p className="text-xs text-muted-foreground">Distinct Days</p>
          <p className="text-xl font-bold">{history.distinct_days}</p>
        </div>

        <div className="bg-muted/40 rounded-md p-3 space-y-0.5">
          <p className="text-xs text-muted-foreground">Coverage</p>
          <p className="text-sm font-medium tabular-nums">
            {history.first_day ?? "—"} → {history.last_day ?? "—"}
          </p>
        </div>

        <div className="bg-muted/40 rounded-md p-3 space-y-0.5">
          <p className="text-xs text-muted-foreground">Trend Quality</p>
          <p className={`text-sm font-semibold ${sufficiencyColor}`}>
            {history.history_sufficient ? "Sufficient" : "Insufficient"}
          </p>
        </div>

        <div className="bg-muted/40 rounded-md p-3 space-y-0.5">
          <p className="text-xs text-muted-foreground">Data Freshness</p>
          <p className={`text-sm font-semibold ${
            dataChanged === null  ? "text-muted-foreground"              :
            dataChanged           ? "text-green-600 dark:text-green-400" :
                                    "text-yellow-600 dark:text-yellow-400"
          }`}>
            {dataChanged === null ? "First run" : dataChanged ? "Updated" : "Unchanged"}
          </p>
        </div>

      </div>
    </div>
  );
}

// ── 2. Trends ───────────────────────────────────────────────────────────────

const TREND_LABELS: Record<string, string> = {
  inactive_sellers:        "Inactive Sellers",
  products_without_views:  "Products Without Views",
};

function TrendCard({ metricKey, trend }: { metricKey: string; trend: TrendResult }) {
  const label = TREND_LABELS[metricKey] ?? metricKey;

  if (!trend) {
    return (
      <div className="bg-muted/40 rounded-md p-3 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground/60">No data</p>
      </div>
    );
  }

  if (trend.insufficient_history) {
    return (
      <div className="bg-muted/40 rounded-md p-3 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          Insufficient history ({trend.distinct_days} day)
        </p>
      </div>
    );
  }

  const { arrow, color } = directionLabel(trend.direction, metricKey);
  const sign = trend.delta > 0 ? "+" : "";

  return (
    <div className="bg-muted/40 rounded-md p-3 space-y-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className={`flex items-baseline gap-1.5 ${color}`}>
        <span className="text-xl font-bold tabular-nums">
          {trend.first_value} → {trend.last_value}
        </span>
        <span className="text-sm font-semibold">
          ({sign}{trend.delta}) {arrow}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {trend.first_date} → {trend.last_date} · {trend.distinct_days} days
      </p>
    </div>
  );
}

function TrendsSection({ trends }: { trends: TelemetryArtifact["trends"] }) {
  return (
    <div className="space-y-2">
      <SectionHeading>Marketplace Trends</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TrendCard metricKey="inactive_sellers"       trend={trends.inactive_sellers} />
        <TrendCard metricKey="products_without_views" trend={trends.products_without_views} />
      </div>
    </div>
  );
}

// ── 3. Filtered Metrics ─────────────────────────────────────────────────────

function FilteredMetricsSection({ fm }: { fm: FilteredMetrics }) {
  const totalSellers     = fm.real_seller_count + fm.test_seller_count;
  const testSellerPct    = totalSellers > 0
    ? Math.round((fm.test_seller_count / totalSellers) * 100)
    : 0;

  return (
    <div className="space-y-2">
      <SectionHeading>Real vs Test Data</SectionHeading>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

        <div className="bg-muted/40 rounded-md p-3 space-y-0.5">
          <p className="text-xs text-muted-foreground">Real Sellers</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {fm.real_seller_count}
          </p>
        </div>

        <div className="bg-muted/40 rounded-md p-3 space-y-0.5">
          <p className="text-xs text-muted-foreground">Test Accounts</p>
          <p className={`text-xl font-bold ${fm.test_seller_count > 0 ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"}`}>
            {fm.test_seller_count}
            {testSellerPct > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-1">({testSellerPct}%)</span>
            )}
          </p>
        </div>

        <div className="bg-muted/40 rounded-md p-3 space-y-0.5">
          <p className="text-xs text-muted-foreground">Dead Products (real)</p>
          <p className="text-xl font-bold">{fm.real_dead_products_count}</p>
        </div>

      </div>

      {fm.test_seller_count > 0 && (
        <p className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded px-3 py-2">
          ⚠ {fm.test_seller_count} test/demo accounts are included in raw metric counts.
          Health scores above use unfiltered numbers.
        </p>
      )}
    </div>
  );
}

// ── 4. Metric Conflicts ─────────────────────────────────────────────────────

const CONFLICT_LABELS: Record<string, string> = {
  products_without_views:  "Products Without Views",
  inactive_sellers:        "Inactive Sellers",
  products_total:          "Products Total",
};

function MetricConflictsSection({ conflicts }: { conflicts: MetricConflict[] }) {
  if (conflicts.length === 0) {
    return (
      <div className="space-y-2">
        <SectionHeading>Metric Conflicts</SectionHeading>
        <p className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded px-3 py-2">
          ✓ No metric conflicts detected — analytics and intelligence sources agree.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <SectionHeading>Metric Conflicts</SectionHeading>
      <div className="space-y-2">
        {conflicts.map((c) => (
          <div
            key={c.metric}
            className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 rounded-md p-3 space-y-1.5"
          >
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
              ⚠ {CONFLICT_LABELS[c.metric] ?? c.metric} mismatch
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground">Analytics (CLI)</p>
                <p className="font-bold text-sm tabular-nums">{c.analytics_value}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Intelligence (DB)</p>
                <p className="font-bold text-sm tabular-nums">{c.intelligence_value}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Delta: {c.delta > 0 ? `+${c.delta}` : c.delta} — requires human review to determine authoritative source.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

export default function AITelemetryPanel() {
  const { data, loading, error, refetch } =
    useBrainFetch<TelemetryArtifact>("/api/admin/ai/telemetry", "telemetry");

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-4 animate-pulse">
        <Skeleton className="h-5 w-48" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-md" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold">Telemetry</p>
        <p className="text-xs text-muted-foreground">
          {error
            ? `Error: ${error}`
            : "No telemetry artifact found. Run the telemetry collector to generate one."}
        </p>
        {error && (
          <button
            onClick={refetch}
            className="text-xs px-3 py-1 rounded border hover:bg-muted transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-4 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5">
          <h2 className="font-semibold text-sm">Telemetry</h2>
          <p className="text-xs text-muted-foreground">
            Multi-day trends · real vs test data · conflict detection
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{data.date}</span>
      </div>

      {/* 1. Daily History */}
      <DailyHistorySection
        history={data.daily_history}
        dataChanged={data.data_changed}
      />

      {/* 2. Trends */}
      <div className="border-t pt-4">
        <TrendsSection trends={data.trends} />
      </div>

      {/* 3. Filtered Metrics */}
      <div className="border-t pt-4">
        <FilteredMetricsSection fm={data.filtered_metrics} />
      </div>

      {/* 4. Metric Conflicts */}
      <div className="border-t pt-4">
        <MetricConflictsSection conflicts={data.metric_conflicts} />
      </div>

    </div>
  );
}
