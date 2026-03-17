"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge }    from "@/components/ui/badge";
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

// ── Sub-component ──────────────────────────────────────────────────────────────

function SellerList({
  sellers,
  emptyText,
  badge,
}: {
  sellers:   SellerMetrics[];
  emptyText: string;
  badge: (s: SellerMetrics) => React.ReactNode;
}) {
  if (sellers.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyText}</p>;
  }

  return (
    <ul className="space-y-1.5">
      {sellers.map((s) => (
        <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
          <span className="truncate font-medium">{s.nombre_comercio}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {badge(s)}
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AISellerInsights() {
  const { data, loading, error, refetch } =
    useBrainFetch<SellerData>("/api/admin/ai/sellers", "sellers");

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-3 animate-pulse">
        <Skeleton className="h-5 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold">Seller Intelligence</p>
        <p className="text-xs text-red-500">{error ?? "No data available."}</p>
        <button onClick={refetch} className="text-xs px-3 py-1 rounded border hover:bg-muted transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">Seller Intelligence</h2>
        <span className="text-xs text-muted-foreground">
          {new Date(data.generated_at).toLocaleTimeString()}
        </span>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Top sellers */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Top Sellers
          </p>
          <SellerList
            sellers={data.top_sellers}
            emptyText="No top sellers yet"
            badge={(s) => (
              <Badge variant="secondary" className="text-xs">
                {s.intention_count} ints
              </Badge>
            )}
          />
        </div>

        {/* Risky sellers */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Needs Attention
          </p>
          <SellerList
            sellers={data.risky_sellers}
            emptyText="No risky sellers"
            badge={(s) => (
              <Badge className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0">
                {s.product_count} prods
              </Badge>
            )}
          />
        </div>

        {/* Inactive sellers */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Inactive (30d+)
          </p>
          <SellerList
            sellers={data.inactive_sellers}
            emptyText="No inactive sellers"
            badge={(s) => (
              <Badge className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0">
                inactive
              </Badge>
            )}
          />
        </div>

      </div>
    </div>
  );
}
