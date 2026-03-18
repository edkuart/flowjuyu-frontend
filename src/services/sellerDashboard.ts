// src/services/sellerDashboard.ts

import { apiFetch } from "@/lib/api"

/* ===========================
   Tipos
=========================== */

export type KPI = {
  ventasMes: number
  pedidosMes: number
  ticketPromedio: number
  productosActivos: number
}

export type ProductoStats = {
  total: number
  activos: number
  inactivos: number
  stock_bajo: number
}

export type SellerDashboardResponse = {
  kpi: KPI
  productoStats: ProductoStats
  ventasPorMes: any[]
  topCategorias: any[]
  actividad: any[]
  lowStock: any[]
  validaciones: string[]
}

/* ===========================
   Fetch
=========================== */

export async function fetchSellerDashboard(): Promise<SellerDashboardResponse> {
  const res = await apiFetch("/api/seller/dashboard")

  if (!res.ok) {
    throw new Error("No se pudo cargar el dashboard")
  }

  const data = await res.json()

  return {
    kpi: data.kpi ?? {
      ventasMes: 0,
      pedidosMes: 0,
      ticketPromedio: 0,
      productosActivos: 0,
    },

    productoStats: data.productoStats ?? {
      total: 0,
      activos: 0,
      inactivos: 0,
      stock_bajo: 0,
    },

    ventasPorMes: data.ventasPorMes ?? [],
    topCategorias: data.topCategorias ?? [],
    actividad: data.actividad ?? [],
    lowStock: data.lowStock ?? [],
    validaciones: data.validaciones ?? [],
  }
}