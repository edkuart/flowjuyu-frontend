// src/lib/sellerPerformance/signals.ts
//
// SPIL v2 — Layer 1: Signal Derivation
// Owns: PerformanceSummaryInput, Signals
// Single source of truth for all threshold logic.

/* ──────────────────────────────────────────
   INPUT TYPE  (canonical definition lives here)
────────────────────────────────────────── */

export interface PerformanceSummaryInput {
  totalProductViews:    number
  totalProfileViews:    number
  totalIntentions:      number
  conversionRatio:      number
  growthPercent:        number
  totalWhatsappClicks:  number
  totalReviews:         number
  avgRating:            number | null
  totalProducts:        number
  activeProducts:       number
  inactiveProducts:     number
  topProducts:          { id: string; nombre: string; total_views: number }[]
  topIntentedProducts:  { id: string; nombre: string; total_intentions: number }[]
}

/* ──────────────────────────────────────────
   SIGNAL INTERFACE
────────────────────────────────────────── */

export interface Signals {
  // Catalog state
  noProducts:           boolean
  // Traffic
  noViews:              boolean   // has products but 0 views
  lowTraffic:           boolean   // 1–29 views
  goodTraffic:          boolean   // 30–99 views
  highTraffic:          boolean   // 100+ views
  // Conversion
  lowConversion:        boolean   // < 3% with meaningful traffic (> 50 views)
  goodConversion:       boolean   // >= 7%
  // Growth (week-over-week)
  strongGrowth:         boolean   // > +10%
  positiveGrowth:       boolean   // 0–10%
  negativeGrowth:       boolean   // < -5%
  // Contact
  noWhatsapp:           boolean   // has intentions but 0 WA clicks
  hasIntentions:        boolean   // at least 1 purchase intention
  // Catalog activation
  inactiveCatalog:      boolean   // has products, none active
  fullyActiveCatalog:   boolean   // >= 80% of products active
  // Top products
  hasTopProduct:        boolean   // leading product > 5 views
  strongTopProduct:     boolean   // leading product dominates by 2×
  hasIntentedProducts:  boolean   // at least 1 product with recorded intention
}

/* ──────────────────────────────────────────
   THRESHOLDS  (only place raw numbers live)
────────────────────────────────────────── */

const T = {
  traffic:    { low: 30,   high: 100 },
  conversion: { low: 0.03, good: 0.07, minViews: 50 },
  growth:     { strong: 10, negative: -5 },
  catalog:    { fullyActive: 0.8 },
  topProduct: { minViews: 5, domViews: 10, domFactor: 2 },
} as const

/* ──────────────────────────────────────────
   DERIVE SIGNALS
────────────────────────────────────────── */

export function deriveSignals(i: PerformanceSummaryInput): Signals {
  const hasIntentions      = i.totalIntentions > 0
  const noProducts         = i.totalProducts === 0

  const noViews            = !noProducts && i.totalProductViews === 0
  const lowTraffic         = i.totalProductViews > 0 && i.totalProductViews < T.traffic.low
  const goodTraffic        = i.totalProductViews >= T.traffic.low && i.totalProductViews < T.traffic.high
  const highTraffic        = i.totalProductViews >= T.traffic.high

  const lowConversion      = i.conversionRatio < T.conversion.low
                             && i.totalProductViews > T.conversion.minViews
  const goodConversion     = i.conversionRatio >= T.conversion.good

  const strongGrowth       = i.growthPercent > T.growth.strong
  const positiveGrowth     = i.growthPercent > 0 && i.growthPercent <= T.growth.strong
  const negativeGrowth     = i.growthPercent < T.growth.negative

  const noWhatsapp         = i.totalWhatsappClicks === 0 && hasIntentions
  const inactiveCatalog    = !noProducts && i.activeProducts === 0
  const fullyActiveCatalog = !noProducts
                             && (i.activeProducts / i.totalProducts) >= T.catalog.fullyActive

  const top              = i.topProducts[0] ?? null
  const second           = i.topProducts[1] ?? null
  const hasTopProduct    = top !== null && top.total_views > T.topProduct.minViews
  const strongTopProduct = hasTopProduct
                           && top!.total_views >= T.topProduct.domViews
                           && (!second || top!.total_views >= second.total_views * T.topProduct.domFactor)
  const hasIntentedProducts = i.topIntentedProducts.length > 0

  return {
    noProducts, noViews, lowTraffic, goodTraffic, highTraffic,
    lowConversion, goodConversion,
    strongGrowth, positiveGrowth, negativeGrowth,
    noWhatsapp, hasIntentions,
    inactiveCatalog, fullyActiveCatalog,
    hasTopProduct, strongTopProduct, hasIntentedProducts,
  }
}
