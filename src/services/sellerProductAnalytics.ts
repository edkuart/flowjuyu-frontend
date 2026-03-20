// src/services/sellerProductAnalytics.ts

import { getApiUrl } from "@/lib/config"

const API = getApiUrl()

export type ProductAnalyticsRow = {
  product_id:   string
  nombre:       string
  internal_code: string | null
  views_total:  number
  views_qr:     number
  views_web:    number
}

export type SellerProductAnalyticsResponse = {
  success: boolean
  data:    ProductAnalyticsRow[]
}

export async function fetchSellerProductAnalytics(): Promise<SellerProductAnalyticsResponse> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null

  const res = await fetch(`${API}/api/seller/analytics/products`, {
    method:      "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!res.ok) throw new Error("Error obteniendo analytics de productos")

  const json = await res.json()
  return {
    success: json.success ?? true,
    data:    Array.isArray(json.data) ? json.data : [],
  }
}
