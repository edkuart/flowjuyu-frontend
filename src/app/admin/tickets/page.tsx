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

interface Ticket {
  id: number
  asunto: string
  estado: string
  prioridad: string
  asignado_a: number | null
  createdAt: string
}

interface TicketStats {
  resumen: { estado: string; count: number }[]
  avg_close_hours: number
}

export default function AdminTicketsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const estadoParam = searchParams.get("estado") || "todos"

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [estadoFilter, setEstadoFilter] = useState(estadoParam)

  // ============================
  // Fetch Tickets
  // ============================
  async function fetchTickets() {
    try {
      setLoading(true)

      const query =
        estadoFilter && estadoFilter !== "todos"
          ? `?estado=${estadoFilter}`
          : ""

      const res = await authFetch(
        `${API_URL}/api/admin/tickets${query}`
      )

      if (!res.ok) {
        console.error("Error status:", res.status)
        setTickets([])
        return
      }

      const data = await res.json()
      setTickets(data.data || [])
    } catch (error) {
      console.error("Error fetching tickets:", error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  // ============================
  // Fetch Stats
  // ============================
  async function fetchStats() {
    try {
      const res = await authFetch(
        `${API_URL}/api/admin/tickets/stats`
      )

      if (!res.ok) {
        console.error("Stats error:", res.status)
        return
      }

      const data = await res.json()
      setStats(data.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    fetchTickets()
    fetchStats()
  }, [estadoFilter])

  // ============================
  // Helpers
  // ============================

  function updateFilter(value: string) {
    setEstadoFilter(value)

    if (value === "todos") {
      router.push("/admin/tickets")
    } else {
      router.push(`/admin/tickets?estado=${value}`)
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case "abierto":
        return "bg-green-100 text-green-700"
      case "en_proceso":
        return "bg-blue-100 text-blue-700"
      case "esperando_usuario":
        return "bg-yellow-100 text-yellow-700"
      case "cerrado":
        return "bg-gray-200 text-gray-700"
      default:
        return ""
    }
  }

  function priorityColor(priority: string) {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-700"
      case "media":
        return "bg-yellow-100 text-yellow-700"
      case "baja":
        return "bg-green-100 text-green-700"
      default:
        return ""
    }
  }

  async function assignToMe(id: number) {
    await authFetch(
      `${API_URL}/api/admin/tickets/${id}/assign`,
      { method: "PATCH" }
    )
    fetchTickets()
  }

  async function closeTicket(id: number) {
    await authFetch(
      `${API_URL}/api/admin/tickets/${id}/close`,
      { method: "PATCH" }
    )
    fetchTickets()
  }

  // ============================
  // Render
  // ============================

    return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tickets</h1>

        {stats && (
            <div className="flex gap-3 text-sm">
            {stats.resumen.map((item) => (
                <Badge key={item.estado} variant="outline">
                {item.estado}: {item.count}
                </Badge>
            ))}
            <Badge variant="secondary">
                Avg cierre:{" "}
                {Number(stats.avg_close_hours || 0).toFixed(1)}h
            </Badge>
            </div>
        )}
        </div>

        {/* Filtros */}
        <div className="flex gap-4 items-center">
        <Select value={estadoFilter} onValueChange={updateFilter}>
            <SelectTrigger className="w-52">
            <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="abierto">Abierto</SelectItem>
            <SelectItem value="en_proceso">En proceso</SelectItem>
            <SelectItem value="esperando_usuario">
                Esperando usuario
            </SelectItem>
            <SelectItem value="cerrado">Cerrado</SelectItem>
            </SelectContent>
        </Select>
        </div>

        {/* Tabla */}
        <div className="border rounded-md bg-white">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Asignado</TableHead>
                <TableHead>Acciones</TableHead>
            </TableRow>
            </TableHeader>

            <TableBody>
            {loading ? (
                <TableRow>
                <TableCell colSpan={6}>Cargando...</TableCell>
                </TableRow>
            ) : tickets.length === 0 ? (
                <TableRow>
                <TableCell colSpan={6}>
                    No hay tickets
                </TableCell>
                </TableRow>
            ) : (
                tickets.map((ticket) => (
                <TableRow key={ticket.id}>

                    {/* ID */}
                    <TableCell className="font-medium">
                    <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="text-amber-600 hover:underline"
                    >
                        #{ticket.id}
                    </Link>
                    </TableCell>

                    {/* ASUNTO */}
                    <TableCell>
                    <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="hover:underline"
                    >
                        {ticket.asunto}
                    </Link>
                    </TableCell>

                    {/* ESTADO */}
                    <TableCell>
                    <Badge className={statusColor(ticket.estado)}>
                        {ticket.estado}
                    </Badge>
                    </TableCell>

                    {/* PRIORIDAD */}
                    <TableCell>
                    <Badge className={priorityColor(ticket.prioridad)}>
                        {ticket.prioridad}
                    </Badge>
                    </TableCell>

                    {/* ASIGNADO */}
                    <TableCell>
                    {ticket.asignado_a ? "Asignado" : "Sin asignar"}
                    </TableCell>

                    {/* ACCIONES */}
                    <TableCell className="flex gap-2">
                    {!ticket.asignado_a && (
                        <Button
                        size="sm"
                        variant="outline"
                        onClick={() => assignToMe(ticket.id)}
                        >
                        Asignarme
                        </Button>
                    )}

                    {ticket.estado !== "cerrado" && (
                        <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => closeTicket(ticket.id)}
                        >
                        Cerrar
                        </Button>
                    )}
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
