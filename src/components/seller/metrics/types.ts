import type { NextAction } from "@/lib/sellerPerformance";

export type Analytics = {
  totalProductViews: number;
  totalProfileViews: number;
  totalIntentions: number;
  conversionRatio: number;
  topProducts: {
    id: string;
    nombre: string;
    total_views: number;
  }[];
  topIntentedProducts: {
    id: string;
    nombre: string;
    total_intentions: number;
  }[];
  last30Days: {
    date: string;
    product_views: number;
    profile_views: number;
  }[];
  totalWhatsappClicks: number;
  last30WhatsappClicks: number;
  totalReviews: number;
  avgRating: number | null;
};

export type ReviewInsights = {
  rating_avg: number;
  rating_distribution: Record<string, number>;
  total_reviews: number;
  recent_reviews_count: number;
  low_rating_count: number;
  top_products_by_reviews: {
    product_id: string;
    producto_nombre: string;
    review_count: number;
    rating_avg: number;
  }[];
  frequent_terms: {
    term: string;
    count: number;
  }[];
};

export type PriorityInsight = {
  id: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
  severity: "critical" | "high" | "medium" | "ok";
};

export type SellerMetricsTabId =
  | "summary"
  | "traffic"
  | "products"
  | "reputation"
  | "opportunities"
  | "advanced";

export type SellerMetricsStat = {
  title: string;
  value: number | string;
  context: string;
  icon: React.ReactNode;
  interpretation?: import("@/lib/metricInterpreter").MetricInterpretation;
};

export type SellerMetricsAction = NextAction;
