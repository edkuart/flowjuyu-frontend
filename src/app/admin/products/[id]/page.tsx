"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { authFetch } from "@/lib/authFetch"

const API_URL = "http://localhost:8800"

/* ===============================
   🎨 ESTADO MARKETPLACE
=============================== */

function marketplaceBadge(status: string) {
  switch (status) {
    case "visible":
      return "bg-green-100 text-green-700 border border-green-200"
    case "bloqueado_seller":
      return "bg-red-100 text-red-700 border border-red-200"
    case "pendiente_kyc":
      return "bg-yellow-100 text-yellow-700 border border-yellow-200"
    case "sin_vendedor":
      return "bg-gray-200 text-gray-700 border border-gray-300"
    case "desactivado":
      return "bg-gray-300 text-gray-800"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

function marketplaceLabel(status: string) {
  switch (status) {
    case "visible":
      return "Visible"
    case "bloqueado_seller":
      return "Bloqueado (Seller)"
    case "pendiente_kyc":
      return "Pendiente KYC"
    case "sin_vendedor":
      return "Sin vendedor"
    case "desactivado":
      return "Desactivado"
    default:
      return status
  }
}

/* ===============================
   🎨 RISK
=============================== */

function riskBadge(level: string) {
  switch (level) {
    case "high":
      return "bg-red-100 text-red-700 border border-red-200"
    case "medium":
      return "bg-yellow-100 text-yellow-700 border border-yellow-200"
    case "low":
      return "bg-green-100 text-green-700 border border-green-200"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

export default function AdminProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProduct() {
    try {
      const res = await authFetch(`${API_URL}/api/admin/products/${id}`)
      if (!res.ok) return
      const json = await res.json()
      setData(json.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatus() {
    await authFetch(
      `${API_URL}/api/admin/products/${id}/toggle`,
      { method: "PATCH" }
    )
    fetchProduct()
  }

  useEffect(() => {
    fetchProduct()
  }, [])

  if (loading) return <div className="p-8">Cargando...</div>
  if (!data) return <div className="p-8">Producto no encontrado</div>

  return (
    <div className="p-8 space-y-10">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{data.nombre}</h1>
          <p className="text-sm text-gray-500 mt-1">
            ID: {data.id}
          </p>
        </div>

        <div className="flex gap-3">
          <Badge className={marketplaceBadge(data.estado_marketplace)}>
            {marketplaceLabel(data.estado_marketplace)}
          </Badge>

          {data.risk && (
            <Badge className={riskBadge(data.risk.level)}>
              Risk: {data.risk.level.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>

      {/* ================= RISK PANEL ================= */}
      {data.risk && (
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Risk Score</p>
              <p className="text-3xl font-bold mt-1">
                {data.risk.score}
              </p>
            </div>

            <Badge className={riskBadge(data.risk.level)}>
              {data.risk.level.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* ================= FLAGS ================= */}
      <div className="space-y-3">
        {data.flags?.isDeadProduct && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            ⚠️ Producto sin actividad relevante.
          </div>
        )}

        {data.flags?.isSuspicious && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            🚨 Alto tráfico pero no visible.
          </div>
        )}

        {data.estado_marketplace !== "visible" && (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            🔒 No visible en marketplace.
          </div>
        )}
      </div>

      {/* ================= MÉTRICAS ================= */}
      <div className="grid md:grid-cols-4 gap-6">

        <MetricCard label="Total Views" value={data.total_views} />

        <MetricCard label="Views 7 días" value={data.views_7d} />

        <MetricCard label="Views 30 días" value={data.views_30d} />

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Última vista</p>
            <p className="text-sm mt-2">
              {data.last_view
                ? new Date(data.last_view).toLocaleString()
                : "Sin actividad"}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* ================= INFO ================= */}
      <div className="grid md:grid-cols-2 gap-8">

        <Card>
          <CardContent className="p-6 space-y-3">
            <h2 className="font-semibold">Información Producto</h2>
            <p><strong>Precio:</strong> Q {Number(data.precio).toFixed(2)}</p>
            <p><strong>Activo técnico:</strong> {data.activo ? "Sí" : "No"}</p>
            <p><strong>Fecha creación:</strong> {new Date(data.created_at).toLocaleDateString()}</p>
            <p><strong>Descripción:</strong> {data.descripcion || "Sin descripción"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <h2 className="font-semibold">Información Vendedor</h2>
            <p><strong>Comercio:</strong> {data.nombre_comercio || "Sin vendedor"}</p>
            <p><strong>Email:</strong> {data.vendedor_email || "N/A"}</p>
            <p><strong>Estado Admin:</strong> {data.estado_admin}</p>
            <p><strong>Estado Validación:</strong> {data.estado_validacion}</p>
          </CardContent>
        </Card>

      </div>

      {/* ================= IMÁGENES ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Imágenes</h2>

        {data.imagenes?.length === 0 ? (
          <p>No tiene imágenes</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {data.imagenes?.map((img: any) => (
              <img
                key={img.id}
                src={img.url}
                alt="Imagen producto"
                className="rounded-xl border shadow-sm"
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= ACCIONES ================= */}
      <div className="flex gap-4 pt-6">

        <Button
          variant={data.activo ? "destructive" : "default"}
          onClick={toggleStatus}
        >
          {data.activo ? "Desactivar producto" : "Activar producto"}
        </Button>

        <Button
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Volver
        </Button>

      </div>

    </div>
  )
}

/* ===============================
   METRIC CARD
=============================== */

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </CardContent>
    </Card>
  )
}