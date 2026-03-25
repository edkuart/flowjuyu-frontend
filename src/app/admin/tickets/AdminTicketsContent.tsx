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
import type { PhoneNumber } from "@/lib/phone"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Ticket {
  id: number
  asunto: string
  estado: string
  prioridad: string
  tipo: string
  asignado_a: number | null
  user_id: number
  createdAt: string
  closedAt: string | null
  seller: {
    id: number
    user_id: number
    nombre_comercio: string
    telefono_comercio: PhoneNumber | null
  } | null
}

interface TicketStats {
  resumen:         { estado: string; count: number }[]
  avg_close_hours: number
  por_tipo:        { tipo: string; count: number }[]
  por_prioridad:   { prioridad: string; count: number }[]
}

// ── Style helpers ──────────────────────────────────────────────────────────────

function statusClass(s: string) {
  switch (s) {
    case "abierto":          return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0"
    case "en_proceso":       return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0"
    case "esperando_usuario":return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0"
    case "cerrado":          return "bg-gray-100 text-gray-600 border-0"
    default:                 return "border-0"
  }
}

const STATUS_LABELS: Record<string, string> = {
  abierto:           "Open",
  en_proceso:        "In Progress",
  esperando_usuario: "Waiting User",
  cerrado:           "Closed",
}

function priorityClass(p: string) {
  switch (p) {
    case "alta":  return "bg-red-600 text-white border-0"
    case "media": return "bg-yellow-500 text-white border-0"
    case "baja":  return "bg-green-600 text-white border-0"
    default:      return "border-0"
  }
}

const TIPO_STYLE: Record<string, string> = {
  soporte:      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0",
  verificacion: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-0",
  incidencia:   "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0",
  otro:         "bg-gray-100 text-gray-600 border-0",
}

const TIPO_LABELS: Record<string, string> = {
  soporte:      "Support",
  verificacion: "KYC",
  incidencia:   "Incident",
  otro:         "Other",
}

function getAlertLevel(ticket: Ticket): "none" | "warning" | "critical" {
  const hoursOpen = (Date.now() - new Date(ticket.createdAt).getTime()) / 3600000
  if (["abierto", "en_proceso"].includes(ticket.estado) && hoursOpen > 24) return "critical"
  if (ticket.prioridad === "alta" && !ticket.asignado_a) return "warning"
  return "none"
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60)  return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)  return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)    return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminTicketsContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const estadoParam = searchParams.get("estado") || "todos"

  const [tickets,       setTickets]       = useState<Ticket[]>([])
  const [stats,         setStats]         = useState<TicketStats | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [estadoFilter,  setEstadoFilter]  = useState(estadoParam)
  const [processing,    setProcessing]    = useState<number | null>(null)

  async function fetchTickets() {
    try {
      setLoading(true)
      const query = estadoFilter && estadoFilter !== "todos" ? `?estado=${estadoFilter}` : ""
      const res   = await authFetch(`${API_URL}/api/admin/tickets${query}`)
      if (!res.ok) { setTickets([]); return }
      const data = await res.json()
      setTickets(data.data || [])
    } catch (error) {
      console.error("Error fetching tickets:", error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const res = await authFetch(`${API_URL}/api/admin/tickets/stats`)
      if (!res.ok) return
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

  function updateFilter(value: string) {
    setEstadoFilter(value)
    router.push(value === "todos" ? "/admin/tickets" : `/admin/tickets?estado=${value}`)
  }

  async function quickAction(id: number, endpoint: string, label: string) {
    setProcessing(id)
    try {
      const res = await authFetch(`${API_URL}/api/admin/tickets/${id}/${endpoint}`, { method: "PATCH" })
      if (!res.ok) { toast.error("Action failed"); return }
      toast.success(label)
      fetchTickets()
    } catch {
      toast.error("Unexpected error")
    } finally {
      setProcessing(null)
    }
  }

  // ── Stats bar ────────────────────────────────────────────────────────────────

  const openCount    = stats?.resumen.find((r) => r.estado === "abierto")?.count ?? 0
  const inProgCount  = stats?.resumen.find((r) => r.estado === "en_proceso")?.count ?? 0
  const waitingCount = stats?.resumen.find((r) => r.estado === "esperando_usuario")?.count ?? 0
  const closedCount  = stats?.resumen.find((r) => r.estado === "cerrado")?.count ?? 0

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and resolve seller support requests</p>
        </div>
        {stats && (
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-medium">{openCount} open</span>
            <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 font-medium">{inProgCount} in progress</span>
            <span className="px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">{waitingCount} waiting</span>
            <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 font-medium">{closedCount} closed</span>
            <span className="px-3 py-1.5 rounded-full bg-muted font-medium">
              Avg close: {Number(stats.avg_close_hours || 0).toFixed(1)}h
            </span>
          </div>
        )}
      </div>

      {/* ── Filter ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-3 items-center">
        <Select value={estadoFilter} onValueChange={updateFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">All tickets</SelectItem>
            <SelectItem value="abierto">Open</SelectItem>
            <SelectItem value="en_proceso">In Progress</SelectItem>
            <SelectItem value="esperando_usuario">Waiting User</SelectItem>
            <SelectItem value="cerrado">Closed</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((__, j) => (
                    <TableCell key={j}><div className="h-4 rounded bg-muted animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => {
                const alertLevel = getAlertLevel(ticket)
                return (
                  <TableRow
                    key={ticket.id}
                    className={
                      alertLevel === "critical" ? "bg-red-50/40 dark:bg-red-950/10" :
                      alertLevel === "warning"  ? "bg-yellow-50/40 dark:bg-yellow-950/10" : ""
                    }
                  >
                    {/* ID */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {alertLevel !== "none" && (
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${alertLevel === "critical" ? "bg-red-500" : "bg-yellow-500"}`} />
                        )}
                        <Link
                          href={`/admin/tickets/${ticket.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          #{ticket.id}
                        </Link>
                      </div>
                    </TableCell>

                    {/* Subject */}
                    <TableCell className="max-w-[220px]">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="hover:underline line-clamp-1 block text-sm"
                      >
                        {ticket.asunto}
                      </Link>
                    </TableCell>

                    {/* Seller */}
                    <TableCell>
                      {ticket.seller ? (
                        <Link
                          href={`/admin/sellers/${ticket.seller.user_id}`}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          {ticket.seller.nombre_comercio}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Badge className={`text-[10px] ${TIPO_STYLE[ticket.tipo] ?? "border-0"}`}>
                        {TIPO_LABELS[ticket.tipo] ?? ticket.tipo}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge className={`text-xs ${statusClass(ticket.estado)}`}>
                        {STATUS_LABELS[ticket.estado] ?? ticket.estado}
                      </Badge>
                    </TableCell>

                    {/* Priority */}
                    <TableCell>
                      <Badge className={`text-xs ${priorityClass(ticket.prioridad)}`}>
                        {ticket.prioridad}
                      </Badge>
                    </TableCell>

                    {/* Assigned */}
                    <TableCell>
                      <span className={`text-xs font-medium ${ticket.asignado_a ? "text-green-600" : "text-muted-foreground"}`}>
                        {ticket.asignado_a ? "Assigned" : "Unassigned"}
                      </span>
                    </TableCell>

                    {/* Created */}
                    <TableCell>
                      <span className="text-xs text-muted-foreground" title={new Date(ticket.createdAt).toLocaleString()}>
                        {timeAgo(ticket.createdAt)}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex gap-1.5 justify-end">
                        {!ticket.asignado_a && ticket.estado !== "cerrado" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2"
                            disabled={processing === ticket.id}
                            onClick={() => quickAction(ticket.id, "assign", "Ticket assigned")}
                          >
                            Assign me
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2"
                          onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                        >
                          Open
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
