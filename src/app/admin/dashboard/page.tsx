"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { authFetch } from "@/lib/authFetch"
import {
  Users,
  Store,
  Package,
  Ticket,
} from "lucide-react"
import { AdminKPICard } from "@/components/admin/AdminKPICard"
import { AdminAlerts } from "@/components/admin/AdminAlerts"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const API_URL = "http://localhost:8800"

interface DashboardData {
  usuarios: { total: number }
  sellers: { pendientes: number }
  productos: { activos: number; inactivos: number }
  tickets: {
    abiertos: number
    en_proceso: number
    cerrados: number
  }
  ultimosProductos: {
    id: string
    nombre: string
    precio: number
    activo: boolean
    vendedor_nombre: string
  }[]
  ultimosSellers: {
    user_id: number
    nombre_comercio: string
    estado_validacion: string
    estado_admin: string
  }[]
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchDashboard() {
    try {
      const res = await authFetch(
        `${API_URL}/api/admin/dashboard`
      )

      if (!res.ok) return

      const json = await res.json()
      setData(json.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading)
    return <div>Cargando dashboard...</div>

  if (!data)
    return <div>Error cargando datos</div>

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Atlas Control Center
        </h1>
        <p className="text-gray-500 mt-1">
          Vista ejecutiva del estado del marketplace.
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">

        <AdminKPICard
          title="Usuarios"
          value={data.usuarios.total}
          icon={<Users size={18} />}
          description="Total acumulado"
        />

        <AdminKPICard
          title="Sellers Pendientes"
          value={data.sellers.pendientes}
          icon={<Store size={18} />}
          highlight={data.sellers.pendientes > 0}
          description="Requieren revisión"
          href="/admin/sellers?kyc=pendiente"
        />

        <AdminKPICard
          title="Productos Activos"
          value={data.productos.activos}
          icon={<Package size={18} />}
          description="Visibles en marketplace"
          href="/admin/products"
        />

        <AdminKPICard
          title="Tickets Abiertos"
          value={data.tickets.abiertos}
          icon={<Ticket size={18} />}
          highlight={data.tickets.abiertos > 0}
          description="Requieren atención"
          href="/admin/tickets?estado=abierto"
        />

        <AdminKPICard
          title="En Proceso"
          value={data.tickets.en_proceso}
          icon={<Ticket size={18} />}
          description="Actualmente gestionándose"
          href="/admin/tickets?estado=en_proceso"
        />

      </div>

      {/* ALERTS */}
      <AdminAlerts
        sellersPendientes={data.sellers.pendientes}
        ticketsAbiertos={data.tickets.abiertos}
      />

      {/* ========================= */}
      {/* ÚLTIMOS PRODUCTOS */}
      {/* ========================= */}

      <div>
        <h2 className="font-semibold mb-4">
          Últimos productos
        </h2>

        <div className="border rounded-xl divide-y bg-white">
          {data.ultimosProductos.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center p-4"
            >
              <div>
                <Link
                  href={`/admin/products/${p.id}`}
                  className="font-medium hover:underline"
                >
                  {p.nombre}
                </Link>

                <p className="text-xs text-gray-500 mt-1">
                  {p.vendedor_nombre}
                </p>
              </div>

              <div className="flex items-center gap-4">

                <Badge
                  className={
                    p.activo
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }
                >
                  {p.activo ? "Activo" : "Inactivo"}
                </Badge>

                <Badge variant="secondary">
                  Q {p.precio}
                </Badge>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================= */}
      {/* ÚLTIMOS SELLERS */}
      {/* ========================= */}

      <div>
        <h2 className="font-semibold mb-4">
          Últimos sellers
        </h2>

        <div className="border rounded-xl divide-y bg-white">
          {data.ultimosSellers.map((s) => (
            <div
              key={s.user_id}
              className="flex justify-between items-center p-4"
            >
              <Link
                href={`/admin/sellers/${s.user_id}`}
                className="font-medium hover:underline"
              >
                {s.nombre_comercio}
              </Link>

              <div className="flex gap-3">

                <Badge>
                  {s.estado_validacion}
                </Badge>

                <Badge variant="outline">
                  {s.estado_admin}
                </Badge>

              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}