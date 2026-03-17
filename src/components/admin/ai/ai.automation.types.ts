/**
 * ai.automation.types.ts
 *
 * Placeholder interfaces for the Flowjuyu AI automation pipeline.
 * These types define the contracts for future AI-driven automation layers.
 * Components and services should import from this file rather than
 * defining local types, so the contracts stay consistent.
 */

// ── Core action / event types ──────────────────────────────────────────────────

export type AIActionKind =
  | "promote_product"
  | "promote_category"
  | "highlight_seller"
  | "send_seller_alert"
  | "reactivate_seller"
  | "flag_risk"
  | "resolve_risk"
  | "update_homepage"
  | "generate_report"
  | "trigger_brain_cycle";

export type AIPriority = "critical" | "high" | "medium" | "low";

export type AIActionStatus = "pending" | "in_progress" | "done" | "failed" | "skipped";

/**
 * A discrete action that the AI system can schedule or execute.
 * Actions are atomic — they affect one entity (product, seller, category).
 */
export interface AIAction {
  id:          string;
  kind:        AIActionKind;
  priority:    AIPriority;
  status:      AIActionStatus;
  /** ISO timestamp when this action was created */
  created_at:  string;
  /** ISO timestamp when execution was attempted */
  executed_at?: string;
  /** Human-readable reason for this action */
  reason:      string;
  /** Target entity identifier (product_id, seller_id, categoria_id, etc.) */
  target_id?:  string | number;
  /** Target entity label for display */
  target_name?: string;
  /** Structured parameters passed to the executor */
  params?:     Record<string, unknown>;
  /** Optional agent that was assigned to execute this */
  agent?:      string;
  /** Error message if status === 'failed' */
  error?:      string;
}

// ── Strategy types ─────────────────────────────────────────────────────────────

export type AIStrategyKind =
  | "promote_category"
  | "highlight_products"
  | "recruit_sellers"
  | "reactivate_sellers"
  | "improve_listing_quality"
  | "launch_campaign";

export type AIStrategyStatus = "draft" | "active" | "paused" | "completed" | "archived";

/**
 * A multi-step AI-generated strategy with projected impact.
 * Strategies are composed of one or more AIActions.
 */
export interface AIStrategy {
  id:            string;
  kind:          AIStrategyKind;
  status:        AIStrategyStatus;
  title:         string;
  description:   string;
  created_at:    string;
  /** Estimated 30-day window */
  expires_at?:   string;
  /** Effort/budget level (1–5) */
  intensity:     1 | 2 | 3 | 4 | 5;
  /** Composite impact score 0–100 */
  impact_score:  number;
  actions:       AIAction[];
  /** Projected metrics after execution */
  projections?:  AIStrategyProjection[];
  /** Agent that generated this strategy */
  generated_by?: string;
}

export interface AIStrategyProjection {
  metric:    string;
  current:   number;
  projected: number;
  unit:      string;
}

// ── Insight types ──────────────────────────────────────────────────────────────

export type AIInsightCategory =
  | "trend"
  | "risk"
  | "health"
  | "seller"
  | "quality"
  | "growth"
  | "conversion"
  | "supply"
  | "anomaly";

export type AIInsightSeverity = "positive" | "warning" | "negative" | "neutral";

/**
 * A human-readable AI-generated insight derived from marketplace data.
 * Insights are display-only — they do not trigger actions directly.
 */
export interface AIInsight {
  id:          string;
  category:    AIInsightCategory;
  severity:    AIInsightSeverity;
  icon:        string;
  headline:    string;
  detail:      string;
  metric:      string;
  direction:   "up" | "down" | "neutral";
  /** ISO timestamp of data this insight was derived from */
  data_at?:    string;
  /** Related AIAction id, if this insight triggered an action */
  action_id?:  string;
  /** Related AIStrategy id, if a strategy was generated from this insight */
  strategy_id?: string;
}

// ── Engine interfaces (future pluggable modules) ───────────────────────────────

/**
 * Ranks marketplace entities (products, categories, sellers) by composite score.
 * Implement this interface to swap ranking algorithms without touching the UI.
 */
export interface AIRankingEngine<TItem, TScored> {
  /** Name for logging and display */
  name:  string;
  /** Score a batch of items. Lower index = higher rank input. */
  score(items: TItem[]): TScored[];
}

/**
 * Curates what appears on the marketplace homepage.
 * Translates ranked items into slot assignments for each homepage section.
 */
export interface AIHomepageCurator {
  name: string;
  /** Returns a curation plan from ranked inputs */
  curate(input: {
    products:   unknown[];
    categories: unknown[];
    sellers:    unknown[];
  }): AIHomepagePlan;
}

export interface AIHomepageSlot {
  section:     "featured_products" | "promoted_categories" | "highlighted_sellers" | "banner";
  entity_id:   string | number;
  entity_name: string;
  impact_score: number;
  reason:      string;
}

export interface AIHomepagePlan {
  generated_at: string;
  slots:        AIHomepageSlot[];
  expires_at?:  string;
}

/**
 * Analyzes individual seller health and recommends interventions.
 */
export interface AISellerAdvisor {
  name: string;
  /** Score a seller and return recommended actions */
  advise(seller: {
    id:              number;
    product_count:   number;
    intention_count: number;
    is_inactive:     boolean;
    is_risky:        boolean;
    is_top:          boolean;
  }): { score: number; actions: Pick<AIAction, "kind" | "priority" | "reason">[] };
}

/**
 * Monitors marketplace metrics for anomalies and raises AIActions when thresholds are crossed.
 */
export interface AIAnomalyMonitor {
  name: string;
  /** Evaluate current metrics and return detected anomalies */
  detect(metrics: {
    products_total:          number;
    products_without_views:  number;
    products_without_images: number;
    inactive_sellers:        number;
    risks:                   { severity: string; type: string }[];
    trending_products:       { intention_count: number }[];
  }): AIAnomalyResult[];
}

export type AIAnomalyKind =
  | "view_spike"
  | "view_drop"
  | "intent_surge"
  | "intent_drop"
  | "seller_churn"
  | "image_gap"
  | "risk_cluster"
  | "supply_collapse";

export interface AIAnomalyResult {
  kind:       AIAnomalyKind;
  severity:   "low" | "medium" | "high" | "critical";
  metric:     string;
  value:      number;
  threshold:  number;
  message:    string;
  action?:    Pick<AIAction, "kind" | "priority" | "reason">;
}
