"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Ticket,
  AlertTriangle,
  BadgeCheck,
  Clock,
  Plus,
  ChevronRight,
  MessageSquare,
} from "lucide-react"
import { SellerPill } from "@/components/seller/ui/SellerPrimitives"
import { authFetch } from "@/lib/authFetch"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

interface SupportTicket {
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

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  abierto:           "success",
  en_proceso:        "neutral",
  esperando_usuario: "warning",
  cerrado:           "neutral",
}

const TIPO_LABEL: Record<string, string> = {
  soporte:      "Soporte",
  verificacion: "KYC",
  incidencia:   "Incidencia",
  otro:         "Otro",
}

const TIPO_STYLE: Record<string, string> = {
  verificacion: "bg-purple-50 text-purple-700 ring-1 ring-purple-100",
  incidencia:   "bg-red-50 text-red-600 ring-1 ring-red-100",
  soporte:      "bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)] text-[var(--seller-accent)] ring-1 ring-[color:color-mix(in_srgb,var(--seller-accent)_15%,white)]",
  otro:         "bg-gray-50 text-gray-500 ring-1 ring-gray-100",
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
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch(`${API}/api/seller/tickets`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setTickets(data.data || []) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const openKycTicket = tickets.find(
    (t) => t.tipo === "verificacion" && ["abierto", "esperando_usuario"].includes(t.estado)
  )
  const actionRequired = tickets.filter(
    (t) => t.estado === "esperando_usuario" && t.tipo !== "verificacion"
  )

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">

        {/* ── Header editorial ──────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-[var(--seller-accent)] uppercase">
              Soporte · Flowjuyu Seller
            </p>
            <h1 className="mt-1.5 text-[28px] leading-[1.05] font-bold tracking-tight text-[var(--seller-ink)]">
              Mis tickets
            </h1>
            <p className="mt-1.5 max-w-[42ch] text-sm leading-relaxed text-[var(--seller-muted)]">
              Seguimiento de tus solicitudes con el equipo de Flowjuyu.
            </p>
          </div>
          <Link
            href="/seller/tickets/new"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[var(--seller-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(15,61,58,0.5)] transition hover:shadow-[0_14px_28px_-12px_rgba(15,61,58,0.6)] active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            Nuevo ticket
          </Link>
        </div>

        {/* ── KYC alert ─────────────────────────────────────────────── */}
        {openKycTicket && (
          <Link href={`/seller/tickets/${openKycTicket.id}`}>
            <div className="flex items-center gap-3 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3.5 transition hover:bg-purple-100">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <BadgeCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-purple-900">Verificación pendiente</p>
                <p className="mt-0.5 text-xs text-purple-700">
                  El equipo de Flowjuyu requiere documentos para completar tu verificación.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-purple-400" />
            </div>
          </Link>
        )}

        {/* ── Acción requerida (non-KYC) ────────────────────────────── */}
        {actionRequired.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {actionRequired.length === 1
                  ? "Tienes 1 ticket que requiere tu respuesta"
                  : `Tienes ${actionRequired.length} tickets que requieren tu respuesta`}
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                Responde para continuar con la atención de tu caso.
              </p>
            </div>
          </div>
        )}

        {/* ── Lista de tickets ──────────────────────────────────────── */}
        <section className="overflow-hidden rounded-3xl border border-[var(--seller-line)] bg-white">
          {loading ? (
            <div className="divide-y divide-[var(--seller-line)]">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 animate-pulse rounded-lg bg-gray-100" />
                    <div className="h-3 w-1/3 animate-pulse rounded-lg bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)]">
                <Ticket className="h-6 w-6 text-[var(--seller-accent)]" />
              </div>
              <p className="text-sm font-semibold text-[var(--seller-ink)]">No tienes tickets aún</p>
              <p className="mt-1 text-xs text-[var(--seller-muted)]">
                Crea un ticket si necesitas ayuda del equipo de Flowjuyu.
              </p>
              <Link
                href="/seller/tickets/new"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--seller-line-strong)] px-4 py-2 text-sm font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
              >
                Crear primer ticket
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--seller-line)]">
              {tickets.map((ticket) => {
                const needsAction = ticket.estado === "esperando_usuario"
                return (
                  <Link href={`/seller/tickets/${ticket.id}`} key={ticket.id}>
                    <div className={`flex items-center gap-4 px-5 py-4 transition hover:bg-[var(--seller-panel)] ${
                      needsAction ? "bg-amber-50/40" : ""
                    }`}>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)]">
                        <MessageSquare className="h-4 w-4 text-[var(--seller-accent)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] text-[var(--seller-faint-text)]">
                            #{ticket.id}
                          </span>
                          {needsAction && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                          )}
                          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                            TIPO_STYLE[ticket.tipo] ?? TIPO_STYLE.otro
                          }`}>
                            {TIPO_LABEL[ticket.tipo] ?? ticket.tipo}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm font-medium text-[var(--seller-ink)]">
                          {ticket.asunto}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[var(--seller-muted)]">
                          {timeAgo(ticket.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <SellerPill tone={STATUS_TONE[ticket.estado] ?? "neutral"}>
                          {STATUS_LABEL[ticket.estado] ?? ticket.estado}
                        </SellerPill>
                        <ChevronRight className="h-4 w-4 text-[var(--seller-soft-text)]" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Footer de confianza ───────────────────────────────────── */}
        {!loading && tickets.length > 0 && (
          <p className="px-2 pb-4 text-center text-[11px] leading-relaxed text-[var(--seller-muted)]">
            Nuestro equipo responderá en menos de{" "}
            <span className="font-medium text-[var(--seller-ink)]">24 horas</span>
          </p>
        )}

      </div>
    </div>
  )
}
