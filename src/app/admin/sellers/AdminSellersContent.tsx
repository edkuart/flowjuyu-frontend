"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { authFetch } from "@/lib/authFetch"

const API_URL = "http://localhost:8800"

interface Seller {
  id: number
  user_id: number
  nombre_comercio: string
  estado_validacion: string
  estado_admin: string
  createdAt: string
  user?: {
    id: number
    nombre: string
    correo: string
  }
}

export default function AdminSellersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const kycParam = searchParams.get("kyc") || "todos"
  const adminParam = searchParams.get("admin") || "todos"

  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [kycFilter, setKycFilter] = useState(kycParam)
  const [adminFilter, setAdminFilter] = useState(adminParam)

  // ============================
  // Fetch sellers
  // ============================
  async function fetchSellers() {
    try {
      setLoading(true)

      const params = new URLSearchParams()

      if (kycFilter !== "todos") {
        params.append("estado_validacion", kycFilter)
      }

      if (adminFilter !== "todos") {
        params.append("estado_admin", adminFilter)
      }

      const query = params.toString()
        ? `?${params.toString()}`
        : ""

      const res = await authFetch(
        `${API_URL}/api/admin/sellers${query}`
      )

      if (!res.ok) {
        console.error("Error status:", res.status)
        setSellers([])
        return
      }

      const data = await res.json()
      setSellers(data.data || [])
    } catch (error) {
      console.error("Error fetching sellers:", error)
      setSellers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSellers()
  }, [kycFilter, adminFilter])

  // ============================
  // Filters
  // ============================
  function updateKycFilter(value: string) {
    setKycFilter(value)

    const params = new URLSearchParams()

    if (value !== "todos") {
      params.append("kyc", value)
    }

    if (adminFilter !== "todos") {
      params.append("admin", adminFilter)
    }

    router.push(`/admin/sellers?${params.toString()}`)
  }

  function updateAdminFilter(value: string) {
    setAdminFilter(value)

    const params = new URLSearchParams()

    if (kycFilter !== "todos") {
      params.append("kyc", kycFilter)
    }

    if (value !== "todos") {
      params.append("admin", value)
    }

    router.push(`/admin/sellers?${params.toString()}`)
  }

  // ============================
  // Status colors
  // ============================
  function kycColor(status: string) {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-700"
      case "aprobado":
        return "bg-green-100 text-green-700"
      case "rechazado":
        return "bg-red-100 text-red-700"
      default:
        return ""
    }
  }

  function adminColor(status: string) {
    switch (status) {
      case "activo":
        return "bg-green-100 text-green-700"
      case "inactivo":
        return "bg-gray-200 text-gray-700"
      case "suspendido":
        return "bg-red-100 text-red-700"
      default:
        return ""
    }
  }

  // ============================
  // Render
  // ============================
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Gobernanza de Vendedores
        </h1>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center">

        {/* KYC */}
        <Select value={kycFilter} onValueChange={updateKycFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="KYC" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="aprobado">Aprobado</SelectItem>
            <SelectItem value="rechazado">Rechazado</SelectItem>
          </SelectContent>
        </Select>

        {/* Estado Operativo */}
        <Select value={adminFilter} onValueChange={updateAdminFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Estado Operativo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
            <SelectItem value="suspendido">Suspendido</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* Tabla */}
      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Comercio</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>KYC</TableHead>
              <TableHead>Operativo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  Cargando...
                </TableCell>
              </TableRow>
            ) : sellers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  No hay vendedores
                </TableCell>
              </TableRow>
            ) : (
              sellers.map((seller) => (
                <TableRow key={seller.id}>

                  {/* Comercio */}
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/sellers/${seller.user_id}`}
                      className="text-amber-600 hover:underline"
                    >
                      {seller.nombre_comercio}
                    </Link>
                  </TableCell>

                  {/* Usuario */}
                  <TableCell>
                    {seller.user?.correo}
                  </TableCell>

                  {/* KYC */}
                  <TableCell>
                    <Badge className={kycColor(seller.estado_validacion)}>
                      {seller.estado_validacion}
                    </Badge>
                  </TableCell>

                  {/* Operativo */}
                  <TableCell>
                    <Badge className={adminColor(seller.estado_admin)}>
                      {seller.estado_admin}
                    </Badge>
                  </TableCell>

                  {/* Fecha */}
                  <TableCell>
                    {new Date(seller.createdAt).toLocaleDateString()}
                  </TableCell>

                  {/* Acción */}
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/admin/sellers/${seller.user_id}`)
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
