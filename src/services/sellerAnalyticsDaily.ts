import { getApiUrl } from "@/lib/config"
const API = getApiUrl()

export async function fetchSellerAnalyticsDaily(token: string) {
  const res = await fetch(`${API}/api/seller/analytics/daily`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Error obteniendo analytics diarios")
  }

  const data = await res.json()
  return data.data || []
}