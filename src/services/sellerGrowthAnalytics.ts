// src/services/sellerGrowthAnalytics.ts

import { getApiUrl } from "@/lib/config"

const API = getApiUrl()

export type SellerGrowthResponse = {
  success:              boolean
  views_last7:          number
  views_prev7:          number
  qr_last7:             number
  qr_prev7:             number
  views_change_percent: number
  qr_change_percent:    number
}

export async function fetchSellerGrowth(): Promise<SellerGrowthResponse> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null

  const res = await fetch(`${API}/api/seller/analytics/growth`, {
    method:      "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!res.ok) throw new Error("Error obteniendo datos de crecimiento")

  const json = await res.json()
  return {
    success:              json.success              ?? true,
    views_last7:          json.views_last7          ?? 0,
    views_prev7:          json.views_prev7          ?? 0,
    qr_last7:             json.qr_last7             ?? 0,
    qr_prev7:             json.qr_prev7             ?? 0,
    views_change_percent: json.views_change_percent ?? 0,
    qr_change_percent:    json.qr_change_percent    ?? 0,
  }
}
