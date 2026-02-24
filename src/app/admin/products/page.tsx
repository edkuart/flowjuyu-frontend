"use client"

import { useEffect, useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { authFetch } from "@/lib/authFetch"
import { useRouter } from "next/navigation"

const API_URL = "http://localhost:8800"

/* ===============================
   TYPES
=============================== */

interface Product {
  id: string
  nombre: string
  precio: number | string
  activo: boolean
  created_at: string
  vendedor_email: string | null
  estado_marketplace: string
  risk?: {
    score: number
    level: "low" | "medium" | "high"
  }
}

interface Stats {
  total: number
  visible: number
  desactivado: number
  pendiente_kyc: number
  bloqueado_seller: number
  sin_vendedor: number
  high_risk: number
}

/* ===============================
   COMPONENT
=============================== */

export default function AdminProductsPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRisk, setFilterRisk] =
    useState<"all" | "low" | "medium" | "high">("all")

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await authFetch(`${API_URL}/api/admin/products`)

        if (!res.ok) {
          console.error("Error status:", res.status)
          setProducts([])
          return
        }

        const json = await res.json()
        setProducts(json.data || [])
      } catch (error) {
        console.error("Error fetching products:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  /* ===============================
     STATS (Memoized)
  =============================== */

  const stats: Stats = useMemo(() => {
    return {
      total: products.length,
      visible: products.filter(p => p.estado_marketplace === "visible").length,
      desactivado: products.filter(p => p.estado_marketplace === "desactivado").length,
      pendiente_kyc: products.filter(p => p.estado_marketplace === "pendiente_kyc").length,
      bloqueado_seller: products.filter(p => p.estado_marketplace === "bloqueado_seller").length,
      sin_vendedor: products.filter(p => p.estado_marketplace === "sin_vendedor").length,
      high_risk: products.filter(p => p.risk?.level === "high").length,
    }
  }, [products])

  const filteredProducts =
    filterRisk === "all"
      ? products
      : products.filter(p => p.risk?.level === filterRisk)

  /* ===============================
     HELPERS
  =============================== */

  function estadoColor(estado: string) {
    switch (estado) {
      case "visible":
        return "bg-green-100 text-green-700 border border-green-200"
      case "bloqueado_seller":
        return "bg-red-100 text-red-700 border border-red-200"
      case "pendiente_kyc":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200"
      case "sin_vendedor":
        return "bg-gray-200 text-gray-700 border border-gray-300"
      case "desactivado":
        return "bg-gray-300 text-gray-800 border border-gray-400"
      default:
        return "bg-gray-100 text-gray-600 border"
    }
  }

  function estadoLabel(estado: string) {
    switch (estado) {
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
        return estado
    }
  }

  function riskColor(level?: string) {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-700 border border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200"
      case "low":
        return "bg-green-100 text-green-700 border border-green-200"
      default:
        return "bg-gray-100 text-gray-600 border"
    }
  }

  function formatPrice(precio: number | string) {
    return `Q ${Number(precio).toFixed(2)}`
  }

  /* ===============================
     RENDER
  =============================== */

  return (
    <div className="p-8 space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Productos
          </h1>
          <p className="text-gray-500 mt-1">
            Vista global de productos del marketplace.
          </p>
        </div>

        <Badge className="bg-red-100 text-red-700 border border-red-200">
          High Risk: {stats.high_risk}
        </Badge>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Publicados" value={stats.visible} className="bg-green-50 border-green-200" />
        <StatCard label="Desactivados" value={stats.desactivado} />
        <StatCard label="Pendiente KYC" value={stats.pendiente_kyc} className="bg-yellow-50 border-yellow-200" />
        <StatCard label="Bloqueados" value={stats.bloqueado_seller} className="bg-red-50 border-red-200" />
        <StatCard label="High Risk" value={stats.high_risk} className="bg-red-100 border-red-300" />
      </div>

      {/* FILTRO RISK */}
      <div className="flex gap-3">
        {["all", "low", "medium", "high"].map(level => (
          <Button
            key={level}
            size="sm"
            variant={filterRisk === level ? "default" : "outline"}
            onClick={() => setFilterRisk(level as any)}
          >
            {level.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* TABLA */}
      <div className="border rounded-xl bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>Cargando productos...</TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>No hay productos registrados</TableCell>
              </TableRow>
            ) : (
              filteredProducts.map(product => (
                <TableRow key={product.id}>

                  <TableCell className="font-medium">
                    {product.nombre}
                  </TableCell>

                  <TableCell>
                    {product.vendedor_email || "Sin vendedor"}
                  </TableCell>

                  <TableCell>
                    {formatPrice(product.precio)}
                  </TableCell>

                  <TableCell>
                    <Badge className={estadoColor(product.estado_marketplace)}>
                      {estadoLabel(product.estado_marketplace)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge className={riskColor(product.risk?.level)}>
                      {product.risk?.level?.toUpperCase() || "—"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(product.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/admin/products/${product.id}`)
                      }
                    >
                      Ver detalle
                    </Button>
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* ===============================
   MÉTRICA CARD
=============================== */

function StatCard({
  label,
  value,
  className = "",
}: {
  label: string
  value: number
  className?: string
}) {
  return (
    <div className={`border rounded-xl p-4 bg-white ${className}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}