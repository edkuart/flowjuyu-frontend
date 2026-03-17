"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { authFetch } from "@/lib/authFetch"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

interface Ticket {
  id: number
  asunto: string
  estado: string
  prioridad: string
  tipo: string
  createdAt: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  abierto:           "Recibido",
  en_proceso:        "En proceso",
  esperando_usuario: "Acción requerida",
  cerrado:           "Cerrado",
}

const STATUS_BADGE: Record<string, string> = {
  abierto:           "bg-green-100 text-green-700 border-0",
  en_proceso:        "bg-blue-100 text-blue-700 border-0",
  esperando_usuario: "bg-yellow-100 text-yellow-800 border-0",
  cerrado:           "bg-gray-100 text-gray-500 border-0",
}

const TIPO_LABEL: Record<string, string> = {
  soporte:      "Soporte",
  verificacion: "KYC",
  incidencia:   "Incidencia",
  otro:         "Otro",
}

const TIPO_BADGE: Record<string, string> = {
  verificacion: "bg-purple-100 text-purple-700 border-0",
  incidencia:   "bg-red-100 text-red-700 border-0",
  soporte:      "bg-gray-100 text-gray-600 border-0",
  otro:         "bg-gray-100 text-gray-600 border-0",
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "justo ahora"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SellerTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch(`${API}/api/seller/tickets`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setTickets(data.data || []) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const openKycTicket  = tickets.find(
    (t) => t.tipo === "verificacion" && ["abierto", "esperando_usuario"].includes(t.estado)
  )
  const actionRequired = tickets.filter((t) => t.estado === "esperando_usuario" && t.tipo !== "verificacion")

  return (
    <div className="min-h-screen bg-[#f8f5ef] px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mis tickets</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Seguimiento de tus solicitudes de soporte
            </p>
          </div>
          <Link href="/seller/tickets/new">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
              + Nuevo ticket
            </Button>
          </Link>
        </div>

        {/* ── KYC alert ───────────────────────────────────────────────────────── */}
        {openKycTicket && (
          <Link href={`/seller/tickets/${openKycTicket.id}`}>
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-purple-100 transition">
              <span className="text-xl shrink-0">🪪</span>
              <div className="flex-1">
                <p className="font-semibold text-purple-900 text-sm">Verificación pendiente</p>
                <p className="text-xs text-purple-700 mt-0.5">
                  El equipo de Flowjuyu requiere documentos para completar tu verificación.
                </p>
              </div>
              <span className="text-purple-500 text-sm shrink-0">→</span>
            </div>
          </Link>
        )}

        {/* ── Action required (non-KYC) ───────────────────────────────────────── */}
        {actionRequired.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800 text-sm">
                {actionRequired.length === 1
                  ? "Tienes 1 ticket que requiere tu respuesta"
                  : `Tienes ${actionRequired.length} tickets que requieren tu respuesta`}
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Responde para continuar con la atención de tu caso.
              </p>
            </div>
          </div>
        )}

        {/* ── Ticket list ─────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />
            ))
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm p-12 text-center space-y-3">
              <p className="text-4xl">🎫</p>
              <p className="font-semibold">No tienes tickets aún</p>
              <p className="text-sm text-muted-foreground">
                Crea un ticket si necesitas ayuda del equipo de Flowjuyu.
              </p>
              <Link href="/seller/tickets/new">
                <Button variant="outline" className="mt-2 rounded-xl">
                  Crear primer ticket
                </Button>
              </Link>
            </div>
          ) : (
            tickets.map((ticket) => {
              const needsAction = ticket.estado === "esperando_usuario"
              return (
                <Link href={`/seller/tickets/${ticket.id}`} key={ticket.id}>
                  <div className={`bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition flex items-center gap-4 cursor-pointer ${
                    needsAction ? "border border-yellow-200" : "border border-transparent"
                  }`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-mono">#{ticket.id}</span>
                        {needsAction && (
                          <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                        )}
                        <Badge className={`text-[10px] ${TIPO_BADGE[ticket.tipo] ?? "bg-gray-100 text-gray-600 border-0"}`}>
                          {TIPO_LABEL[ticket.tipo] ?? ticket.tipo}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm mt-1 truncate">{ticket.asunto}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(ticket.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge className={`text-xs ${STATUS_BADGE[ticket.estado] ?? "border-0"}`}>
                        {STATUS_LABEL[ticket.estado] ?? ticket.estado}
                      </Badge>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* ── Trust footer ──────────────────────────────────────────────────────── */}
        {!loading && tickets.length > 0 && (
          <p className="text-center text-xs text-muted-foreground pb-2">
            Nuestro equipo responderá en menos de 24 horas
          </p>
        )}

      </div>
    </div>
  )
}
