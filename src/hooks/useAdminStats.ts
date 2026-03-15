"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/lib/authFetch"

const API_URL = "http://localhost:8800"

export function useAdminStats() {

  const [stats, setStats] = useState({
    tickets: 0,
    sellersPendientes: 0,
    leads: 0
  })

  async function fetchStats() {

    try {

      const dashboardRes = await authFetch(
        `${API_URL}/api/admin/dashboard`
      )

      const dashboard = await dashboardRes.json()

      const leadsRes = await authFetch(
        `${API_URL}/api/admin/leads`
      )

      const leads = await leadsRes.json()

      setStats({
        tickets: dashboard.data.tickets.abiertos || 0,
        sellersPendientes: dashboard.data.sellers.pendientes || 0,
        leads: leads.data.tickets.length || 0
      })

    } catch (error) {
      console.error("Error fetching admin stats:", error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return stats
}