"use client"

import { useEffect, useState, useCallback } from "react"
import { authFetch } from "@/lib/authFetch"
import {
  computeMarketplaceStatus,
  type MarketplaceStatusLevel,
  safeNumber,
} from "@/lib/adminHelpers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

interface AdminStats {
  tickets:              number
  sellersPendientes:    number
  leads:                number
  marketplaceStatus:    MarketplaceStatusLevel
}

const DEFAULT_STATS: AdminStats = {
  tickets:           0,
  sellersPendientes: 0,
  leads:             0,
  marketplaceStatus: "healthy",
}

export function useAdminStats(): AdminStats {
  const [stats, setStats] = useState<AdminStats>(DEFAULT_STATS)

  const fetchStats = useCallback(async () => {
    try {
      const [dashboardRes, leadsRes] = await Promise.all([
        authFetch(`${API_URL}/api/admin/dashboard`),
        authFetch(`${API_URL}/api/admin/leads`),
      ])

      const dashboard = dashboardRes.ok ? await dashboardRes.json() : null
      const leads     = leadsRes.ok     ? await leadsRes.json()     : null

      const ticketsAbiertos    = safeNumber(dashboard?.data?.tickets?.abiertos)
      const sellersPendientes  = safeNumber(dashboard?.data?.sellers?.pendientes)
      const leadsCount         = safeNumber(leads?.data?.tickets?.length)

      setStats({
        tickets:           ticketsAbiertos,
        sellersPendientes,
        leads:             leadsCount,
        marketplaceStatus: computeMarketplaceStatus({
          sellersPendientes,
          ticketsAbiertos,
        }),
      })
    } catch (error) {
      console.error("[useAdminStats] fetch error:", error)
      // Keep current stats on error — don't reset to zero
    }
  }, [])

  useEffect(() => {
    fetchStats()
    // Re-fetch every 2 minutes to keep sidebar counts fresh
    const interval = setInterval(fetchStats, 120_000)
    return () => clearInterval(interval)
  }, [fetchStats])

  return stats
}
