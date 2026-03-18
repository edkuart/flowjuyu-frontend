// src/services/sellerAnalytics.ts

import { getApiUrl } from "@/lib/config"
const API = getApiUrl();

/* ======================================================
   📊 Tipos
====================================================== */

export type SellerAnalyticsResponse = {
  success: boolean;

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

  // Phase 2
  totalWhatsappClicks:  number;
  last30WhatsappClicks: number;
  totalReviews:         number;
  avgRating:            number | null;
};

/* ======================================================
   🔥 Fetch Analytics
====================================================== */

export async function fetchSellerAnalytics(): Promise<SellerAnalyticsResponse> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const res = await fetch(`${API}/api/seller/analytics`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error obteniendo analytics del vendedor");
  }

  const data = await res.json();

  // 🔒 Seguridad defensiva
  return {
    success: data.success ?? true,

    totalProductViews: data.totalProductViews ?? 0,
    totalProfileViews: data.totalProfileViews ?? 0,

    totalIntentions: data.totalIntentions ?? 0,
    conversionRatio: data.conversionRatio ?? 0,

    topProducts: data.topProducts ?? [],
    topIntentedProducts: data.topIntentedProducts ?? [],

    last30Days: data.last30Days ?? [],

    // Phase 2
    totalWhatsappClicks:  data.totalWhatsappClicks  ?? 0,
    last30WhatsappClicks: data.last30WhatsappClicks ?? 0,
    totalReviews:         data.totalReviews         ?? 0,
    avgRating:            data.avgRating            ?? null,
  };
}