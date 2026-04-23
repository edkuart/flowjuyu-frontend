"use client"

import React, { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageBackNav } from "@/components/ui/PageBackNav"
import { authFetch } from "@/lib/authFetch"
import { Loader2 } from "lucide-react"
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

const STATUS_BADGE: Record<string, string> = {
  abierto:           "bg-green-100 text-green-700 border-0",
  en_proceso:        "bg-blue-100 text-blue-700 border-0",
  esperando_usuario: "bg-yellow-100 text-yellow-800 border-0",
  cerrado:           "bg-gray-100 text-gray-500 border-0",
}

const STATUS_DOT: Record<string, string> = {
  abierto:           "bg-green-500",
  en_proceso:        "bg-blue-500",
  esperando_usuario: "bg-yellow-500",
  cerrado:           "bg-gray-400",
}

const TIPO_LABEL: Record<string, string> = {
  soporte:      "Soporte",
  verificacion: "Verificación KYC",
  incidencia:   "Incidencia",
  otro:         "Otro",
}

const PRIORITY_BADGE: Record<string, string> = {
  alta:  "bg-red-100 text-red-700 border-0",
  media: "bg-yellow-100 text-yellow-700 border-0",
  baja:  "bg-green-100 text-green-700 border-0",
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

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5ef] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#f8f5ef] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Ticket no encontrado.</p>
        <Button variant="outline" onClick={() => router.push("/seller/tickets")}>Volver</Button>
      </div>
    )
  }

  const isClosed    = ticket.estado === "cerrado"
  const isKyc       = ticket.tipo === "verificacion"
  const needsAction = ticket.estado === "esperando_usuario"
  const placeholder = REPLY_PLACEHOLDER[ticket.estado] ?? "Escribe tu mensaje..."

  return (
    <div className="min-h-screen bg-[#f8f5ef] px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* ── Back ──────────────────────────────────────────────────────────── */}
        <PageBackNav
          variant="panel"
          onClick={() => router.push("/seller/tickets")}
          label="Volver a mis tickets"
          meta="Soporte"
          title={<p className="truncate text-[15px] font-semibold text-[#14231c]">Ticket #{ticket.id}</p>}
        />

        {/* ── Header card ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-muted-foreground font-mono">Ticket #{ticket.id}</p>
              <h1 className="text-xl font-bold mt-0.5">{ticket.asunto}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={STATUS_BADGE[ticket.estado] ?? "border-0"}>
                {ticket.estado === "esperando_usuario" ? "Acción requerida" :
                 ticket.estado === "abierto"           ? "Abierto" :
                 ticket.estado === "en_proceso"        ? "En proceso" : "Cerrado"}
              </Badge>
              <Badge className={`border-0 ${
                isKyc                      ? "bg-purple-100 text-purple-700" :
                ticket.tipo === "incidencia" ? "bg-red-100 text-red-700" :
                "bg-gray-100 text-gray-600"
              }`}>
                {TIPO_LABEL[ticket.tipo] ?? ticket.tipo}
              </Badge>
              <Badge className={PRIORITY_BADGE[ticket.prioridad] ?? "border-0"}>
                Prioridad {ticket.prioridad}
              </Badge>
            </div>
          </div>

          {/* Status explanation */}
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
            <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[ticket.estado] ?? "bg-gray-400"}`} />
            <span>{STATUS_LABEL[ticket.estado] ?? ticket.estado}</span>
            <span className="ml-auto text-xs">
              {timeAgo(ticket.createdAt)}
            </span>
          </div>
        </div>

        {/* ── Action required ───────────────────────────────────────────────── */}
        {needsAction && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-5 flex items-start gap-3">
            <span className="text-yellow-500 text-xl shrink-0 mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800">Acción requerida</p>
              <p className="text-sm text-yellow-700 mt-1">
                Necesitamos información adicional para continuar con tu solicitud.
                Por favor responde al mensaje del equipo de soporte.
              </p>
            </div>
          </div>
        )}

        {/* ── KYC smart panel ───────────────────────────────────────────────── */}
        {isKyc && !isClosed && (
          <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl shrink-0">🪪</span>
              <div>
                <p className="font-semibold text-purple-900">Verificación de identidad</p>
                <p className="text-sm text-purple-700 mt-0.5">Completa estos pasos para activar tu tienda</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {[
                "Sube foto frontal de tu DPI",
                "Sube foto reverso de tu DPI",
                "Sube selfie sosteniendo tu DPI",
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-purple-800">
                  <span className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold shrink-0 text-purple-800">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
            <Link href="/seller/account">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full mt-1">
                👉 Completar verificación
              </Button>
            </Link>
          </div>
        )}

        {/* ── Conversation ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <p className="font-semibold text-sm">Conversación</p>
            <span className="text-xs text-muted-foreground">
              {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="px-6 py-5 space-y-1 min-h-[200px] max-h-[480px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <span className="text-4xl">💬</span>
                <p className="text-sm text-muted-foreground">
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
                      <span className="text-[10px] font-medium text-muted-foreground mb-1 px-1">
                        {isAdmin ? "Equipo Flowjuyu" : "Tú"}
                      </span>
                    )}
                    <div
                      className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                        isAdmin
                          ? "bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-sm"
                          : "bg-neutral-800 text-white rounded-tr-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.mensaje}</p>
                      <time
                        className={`block text-[10px] mt-1 ${isAdmin ? "text-amber-600/70" : "text-white/60"}`}
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

          {/* Reply box */}
          {!isClosed ? (
            <div className="px-6 pb-6 pt-4 border-t space-y-3 bg-[#fafaf8]">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleReply() }}
                placeholder={placeholder}
                className="w-full border rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/40 bg-white"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Ctrl+Enter para enviar</span>
                <Button
                  onClick={handleReply}
                  disabled={sending || !reply.trim()}
                  className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
                >
                  {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enviar respuesta
                </Button>
              </div>
            </div>
          ) : (
            <div className="px-6 py-5 border-t bg-muted/20 text-center text-sm text-muted-foreground">
              Este ticket está cerrado. Crea un nuevo ticket si necesitas más ayuda.
            </div>
          )}
        </div>

        {/* ── Trust footer ──────────────────────────────────────────────────── */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          Nuestro equipo responderá en menos de 24 horas · Flowjuyu Support
        </p>

      </div>
    </div>
  )
}
