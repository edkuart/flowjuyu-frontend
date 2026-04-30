"use client"

import React, { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2,
  AlertTriangle,
  BadgeCheck,
  Send,
  MessageSquare,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react"
import { SellerPill } from "@/components/seller/ui/SellerPrimitives"
import { authFetch } from "@/lib/authFetch"
import { toast } from "sonner"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Ticket {
  id: number
  asunto: string
  mensaje: string
  estado: string
  prioridad: string
  tipo: string
  createdAt: string
  closedAt: string | null
}

interface Message {
  id: number
  mensaje: string
  es_admin: boolean
  sender_id: number
  createdAt: string
  attachments?: string[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  abierto:           "Tu solicitud ha sido recibida",
  en_proceso:        "Estamos trabajando en tu solicitud",
  esperando_usuario: "Necesitamos información adicional de tu parte",
  cerrado:           "Solicitud completada",
}

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  abierto:           "success",
  en_proceso:        "neutral",
  esperando_usuario: "warning",
  cerrado:           "neutral",
}

const STATUS_DOT: Record<string, string> = {
  abierto:           "bg-emerald-500",
  en_proceso:        "bg-blue-500",
  esperando_usuario: "bg-amber-500",
  cerrado:           "bg-gray-400",
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

const PRIORITY_STYLE: Record<string, string> = {
  alta:  "bg-red-50 text-red-600 ring-1 ring-red-100",
  media: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  baja:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
}

const REPLY_PLACEHOLDER: Record<string, string> = {
  esperando_usuario: "Proporciona la información solicitada por el equipo de soporte...",
  en_proceso:        "Responde o agrega más detalles sobre tu caso...",
  abierto:           "Escribe tu mensaje...",
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

export default function SellerTicketDetailPage() {
  const { id }  = useParams()
  const router  = useRouter()

  const [ticket,   setTicket]   = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply,    setReply]    = useState("")
  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function fetchDetail() {
    try {
      setLoading(true)
      const res = await authFetch(`${API}/api/seller/tickets/${id}`)
      if (!res.ok) return
      const data = await res.json()
      setTicket(data.data.ticket)
      setMessages(data.data.messages ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (id) fetchDetail() }, [id])

  async function handleReply() {
    if (!reply.trim()) return
    setSending(true)
    try {
      const res = await authFetch(`${API}/api/seller/tickets/${id}/reply`, {
        method: "POST",
        body:   JSON.stringify({ mensaje: reply }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        toast.error(d.message ?? "Error al enviar el mensaje")
        return
      }
      setReply("")
      toast.success("Mensaje enviado")
      fetchDetail()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSending(false)
    }
  }

  // ── Loading / Not found ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5ef]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)]">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--seller-accent)]" />
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f8f5ef] px-4">
        <p className="text-sm text-[var(--seller-muted)]">Ticket no encontrado.</p>
        <button
          onClick={() => router.push("/seller/tickets")}
          className="rounded-xl border border-[var(--seller-line-strong)] px-4 py-2 text-sm font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
        >
          Volver a mis tickets
        </button>
      </div>
    )
  }

  const isClosed    = ticket.estado === "cerrado"
  const isKyc       = ticket.tipo === "verificacion"
  const needsAction = ticket.estado === "esperando_usuario"
  const placeholder = REPLY_PLACEHOLDER[ticket.estado] ?? "Escribe tu mensaje..."

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">

        {/* ── Back ──────────────────────────────────────────────────── */}
        <button
          onClick={() => router.push("/seller/tickets")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--seller-muted)] transition hover:text-[var(--seller-ink)]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Mis tickets
        </button>

        {/* ── Header card ───────────────────────────────────────────── */}
        <section className="space-y-4 rounded-3xl border border-[var(--seller-line)] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] text-[var(--seller-faint-text)]">Ticket #{ticket.id}</p>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-[var(--seller-ink)]">{ticket.asunto}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <SellerPill tone={STATUS_TONE[ticket.estado] ?? "neutral"}>
                {ticket.estado === "esperando_usuario" ? "Acción requerida" :
                 ticket.estado === "abierto"           ? "Abierto" :
                 ticket.estado === "en_proceso"        ? "En proceso" : "Cerrado"}
              </SellerPill>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${TIPO_STYLE[ticket.tipo] ?? TIPO_STYLE.otro}`}>
                {TIPO_LABEL[ticket.tipo] ?? ticket.tipo}
              </span>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLE[ticket.prioridad] ?? PRIORITY_STYLE.media}`}>
                Prioridad {ticket.prioridad}
              </span>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-2.5 rounded-xl bg-[var(--seller-panel)] px-4 py-3 text-sm text-[var(--seller-muted)]">
            <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[ticket.estado] ?? "bg-gray-400"}`} />
            <span className="flex-1">{STATUS_LABEL[ticket.estado] ?? ticket.estado}</span>
            <span className="text-xs text-[var(--seller-faint-text)]">{timeAgo(ticket.createdAt)}</span>
          </div>
        </section>

        {/* ── Acción requerida ──────────────────────────────────────── */}
        {needsAction && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-800">Acción requerida</p>
              <p className="mt-0.5 text-xs text-amber-700">
                Necesitamos información adicional para continuar con tu solicitud.
                Por favor responde al mensaje del equipo de soporte.
              </p>
            </div>
          </div>
        )}

        {/* ── KYC panel ─────────────────────────────────────────────── */}
        {isKyc && !isClosed && (
          <section className="space-y-4 rounded-3xl border border-purple-200 bg-purple-50 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                <BadgeCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-purple-900">Verificación de identidad</p>
                <p className="mt-0.5 text-xs text-purple-700">Completa estos pasos para activar tu tienda</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {[
                "Sube foto frontal de tu DPI",
                "Sube foto reverso de tu DPI",
                "Sube selfie sosteniendo tu DPI",
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-purple-800">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-200 text-xs font-bold text-purple-800">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
            <Link
              href="/seller/account"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700 active:scale-[0.99]"
            >
              <CheckCircle2 className="h-4 w-4" />
              Completar verificación
            </Link>
          </section>
        )}

        {/* ── Conversación ──────────────────────────────────────────── */}
        <section className="overflow-hidden rounded-3xl border border-[var(--seller-line)] bg-white">
          <div className="flex items-center justify-between border-b border-[var(--seller-line)] px-5 py-3.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[var(--seller-accent)]" />
              <p className="text-sm font-semibold text-[var(--seller-ink)]">Conversación</p>
            </div>
            <span className="text-xs text-[var(--seller-muted)]">
              {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="min-h-[200px] max-h-[480px] overflow-y-auto space-y-1 px-5 py-5">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)]">
                  <MessageSquare className="h-5 w-5 text-[var(--seller-accent)]" />
                </div>
                <p className="text-sm text-[var(--seller-muted)]">
                  Aún no hay mensajes. Nuestro equipo responderá pronto.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const prev       = messages[i - 1]
                const sameAuthor = prev && prev.es_admin === msg.es_admin
                const isAdmin    = msg.es_admin

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? "items-start" : "items-end"} ${sameAuthor ? "mt-1" : "mt-4"}`}
                  >
                    {!sameAuthor && (
                      <span className="mb-1 px-1 text-[10px] font-medium text-[var(--seller-faint-text)]">
                        {isAdmin ? "Equipo Flowjuyu" : "Tú"}
                      </span>
                    )}
                    <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
                      isAdmin
                        ? "rounded-tl-sm border border-[var(--seller-line)] bg-[var(--seller-panel)] text-[var(--seller-ink)]"
                        : "rounded-tr-sm bg-[var(--seller-accent)] text-white"
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{msg.mensaje}</p>
                      <time
                        className={`mt-1 block text-[10px] ${isAdmin ? "text-[var(--seller-faint-text)]" : "text-white/60"}`}
                        title={new Date(msg.createdAt).toLocaleString("es-GT")}
                      >
                        {timeAgo(msg.createdAt)}
                      </time>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply / Closed */}
          {!isClosed ? (
            <div className="space-y-3 border-t border-[var(--seller-line)] bg-[var(--seller-panel)] px-5 py-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleReply() }}
                placeholder={placeholder}
                rows={3}
                className="w-full resize-none rounded-xl border border-[var(--seller-line)] bg-white px-4 py-3 text-sm text-[var(--seller-ink)] placeholder:text-[var(--seller-faint-text)] outline-none transition focus:border-[var(--seller-accent)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--seller-accent)_20%,transparent)]"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--seller-faint-text)]">Ctrl+Enter para enviar</span>
                <button
                  type="button"
                  onClick={handleReply}
                  disabled={sending || !reply.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--seller-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-12px_rgba(15,61,58,0.5)] transition hover:shadow-[0_10px_24px_-10px_rgba(15,61,58,0.6)] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none"
                >
                  {sending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Send className="h-4 w-4" />
                  }
                  Enviar respuesta
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-[var(--seller-line)] bg-[var(--seller-panel)] px-5 py-4 text-center text-sm text-[var(--seller-muted)]">
              Este ticket está cerrado.{" "}
              <Link href="/seller/tickets/new" className="font-medium text-[var(--seller-ink)] underline-offset-2 hover:underline">
                Crea un nuevo ticket
              </Link>{" "}
              si necesitas más ayuda.
            </div>
          )}
        </section>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <p className="px-2 pb-4 text-center text-[11px] leading-relaxed text-[var(--seller-muted)]">
          Nuestro equipo responderá en menos de{" "}
          <span className="font-medium text-[var(--seller-ink)]">24 horas</span>
          {" "}· Flowjuyu Support
        </p>

      </div>
    </div>
  )
}
