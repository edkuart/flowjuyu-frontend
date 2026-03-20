// src/services/sellerInsightsAnalytics.ts

import { getApiUrl } from "@/lib/config"

const API = getApiUrl()

export type InsightSeverity = "positive" | "warning" | "neutral"

export type Insight = {
  type:     string
  severity: InsightSeverity
  title:    string
  message:  string
}

export type SellerInsightsResponse = {
  success:  boolean
  insights: Insight[]
}

export async function fetchSellerInsights(): Promise<SellerInsightsResponse> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null

  const res = await fetch(`${API}/api/seller/analytics/insights`, {
    method:      "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!res.ok) throw new Error("Error obteniendo insights del vendedor")

  const json = await res.json()
  return {
    success:  json.success  ?? true,
    insights: Array.isArray(json.insights) ? json.insights : [],
  }
}
