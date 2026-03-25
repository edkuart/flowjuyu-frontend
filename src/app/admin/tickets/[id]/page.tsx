"use client"

import React, { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { authFetch } from "@/lib/authFetch"
import { formatPhone } from "@/lib/phone"
import type { PhoneNumber } from "@/lib/phone"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

// ── Types ──────────────────────────────────────────────────────────────────────

interface TicketAlert {
  type: string
  message: string
  level: "warning" | "critical"
}

interface TicketHealth {
  urgency: "low" | "medium" | "high"
  status: "healthy" | "warning" | "critical"
  time_open_hours: number
  time_since_last_reply: number | null
}

interface SellerInfo {
  id: number
  user_id: number
  nombre_comercio: string
  telefono_comercio: PhoneNumber | null
  estado_validacion: string
  kyc_score: number
  kyc_riesgo: string
}

interface TicketDetail {
  id: number
  asunto: string
  mensaje: string
  estado: string
  prioridad: string
  tipo: string
  asignado_a: number | null
  user_id: number
  createdAt: string
  closedAt: string | null
}

interface Message {
  id: number
  mensaje: string
  es_admin: boolean
  sender_id: number
  createdAt: string
}

// ── Style helpers ──────────────────────────────────────────────────────────────

function statusClass(s: string) {
  switch (s) {
    case "abierto":           return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0"
    case "en_proceso":        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0"
    case "esperando_usuario": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0"
    case "cerrado":           return "bg-gray-100 text-gray-600 border-0"
    default:                  return "border-0"
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

const KYC_RIESGO_STYLE: Record<string, string> = {
  bajo:  "text-green-600 dark:text-green-400",
  medio: "text-yellow-600 dark:text-yellow-400",
  alto:  "text-red-600 dark:text-red-400",
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60)  return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)  return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)    return `${hours}h ago`
  return new Date(date).toLocaleDateString()
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminTicketDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [ticket,      setTicket]      = useState<TicketDetail | null>(null)
  const [messages,    setMessages]    = useState<Message[]>([])
  const [seller,      setSeller]      = useState<SellerInfo | null>(null)
  const [alerts,      setAlerts]      = useState<TicketAlert[]>([])
  const [health,      setHealth]      = useState<TicketHealth | null>(null)
  const [reply,       setReply]       = useState("")
  const [loading,     setLoading]     = useState(true)
  const [sending,     setSending]     = useState(false)
  const [suggesting,  setSuggesting]  = useState(false)
  const [processing,  setProcessing]  = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function fetchDetail() {
    try {
      setLoading(true)
      const res = await authFetch(`${API_URL}/api/admin/tickets/${id}`)
      if (!res.ok) { toast.error("Error loading ticket"); return }
      const data = await res.json()
      setTicket(data.data.ticket)
      setMessages(data.data.messages ?? [])
      setSeller(data.data.seller ?? null)
      setAlerts(data.data.alerts ?? [])
      setHealth(data.data.ticket_health ?? null)
    } catch (err) {
      console.error(err)
      toast.error("Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (id) fetchDetail() }, [id])

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function handleReply() {
    if (!reply.trim()) return
    setSending(true)
    try {
      const res = await authFetch(`${API_URL}/api/admin/tickets/${id}/reply`, {
        method: "POST",
        body:   JSON.stringify({ mensaje: reply }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.message ?? "Error sending reply"); return }
      setReply("")
      toast.success("Reply sent")
      fetchDetail()
    } catch {
      toast.error("Unexpected error")
    } finally {
      setSending(false)
    }
  }

  async function handleAction(endpoint: string, method: "PATCH" | "POST", label: string, body?: object) {
    setProcessing(endpoint)
    try {
      const res = await authFetch(`${API_URL}/api/admin/tickets/${id}/${endpoint}`, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.message ?? "Action failed"); return }
      toast.success(label)
      fetchDetail()
    } catch {
      toast.error("Unexpected error")
    } finally {
      setProcessing(null)
    }
  }

  async function handleSuggestReply() {
    setSuggesting(true)
    try {
      const res = await authFetch(`${API_URL}/api/admin/tickets/${id}/suggest-reply`, { method: "POST" })
      if (!res.ok) { toast.error("Could not generate suggestion"); return }
      const data = await res.json()
      setReply(data.data.suggestion)
      toast.success("Suggestion loaded — review and edit before sending")
    } catch {
      toast.error("Error generating suggestion")
    } finally {
      setSuggesting(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="h-10 w-64 rounded-xl bg-muted animate-pulse" />
          <div className="h-[500px] rounded-xl bg-muted animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
        <p className="text-sm text-muted-foreground">Ticket not found or could not be loaded.</p>
        <Button variant="outline" onClick={() => router.push("/admin/tickets")}>Back to Tickets</Button>
      </div>
    )
  }

  const isClosed = ticket.estado === "cerrado"

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <button
            onClick={() => router.push("/admin/tickets")}
            className="text-xs text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1"
          >
            ← Back to Tickets
          </button>
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-muted-foreground font-normal text-base mr-2">#{ticket.id}</span>
            {ticket.asunto}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Created {timeAgo(ticket.createdAt)} · {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className={statusClass(ticket.estado)}>{STATUS_LABELS[ticket.estado] ?? ticket.estado}</Badge>
          <Badge className={priorityClass(ticket.prioridad)}>{ticket.prioridad}</Badge>
          <Badge className={TIPO_STYLE[ticket.tipo] ?? "border-0"}>{TIPO_LABELS[ticket.tipo] ?? ticket.tipo}</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* ── LEFT — Conversation ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Messages */}
          <div className="border rounded-xl bg-card overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <p className="text-sm font-semibold">Conversation</p>
              <span className="text-xs text-muted-foreground">{messages.length} message{messages.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[520px] min-h-[200px]">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No messages yet</p>
              ) : (
                messages.map((msg, i) => {
                  const prevMsg = messages[i - 1]
                  const sameAuthor = prevMsg && prevMsg.es_admin === msg.es_admin
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.es_admin ? "items-end" : "items-start"} ${sameAuthor ? "mt-1" : "mt-3"}`}
                    >
                      {!sameAuthor && (
                        <span className="text-[10px] font-medium text-muted-foreground mb-1 px-1">
                          {msg.es_admin ? "Support Team" : "Seller"}
                        </span>
                      )}
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          msg.es_admin
                            ? "bg-foreground text-background rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.mensaje}</p>
                        <time
                          className={`block text-[10px] mt-1 ${msg.es_admin ? "text-background/60" : "text-muted-foreground"}`}
                          title={new Date(msg.createdAt).toLocaleString()}
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

            {/* Initial message (from ticket creation) */}
            {ticket.mensaje && messages.length === 0 && (
              <div className="px-4 pb-4">
                <div className="bg-muted rounded-xl p-4 text-sm">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Initial request</p>
                  <p>{ticket.mensaje}</p>
                </div>
              </div>
            )}
          </div>

          {/* Reply box */}
          {!isClosed && (
            <div className="border rounded-xl bg-card overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                <p className="text-sm font-semibold">Reply</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 gap-1.5"
                  disabled={suggesting}
                  onClick={handleSuggestReply}
                >
                  {suggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : "✨"}
                  Suggest reply
                </Button>
              </div>
              <div className="p-4 space-y-3">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleReply() }}
                  placeholder="Type your reply… (Ctrl+Enter to send)"
                  className="w-full border rounded-lg p-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={4}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Ctrl+Enter to send</span>
                  <Button
                    onClick={handleReply}
                    disabled={sending || !reply.trim()}
                    className="gap-2"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isClosed && (
            <div className="border rounded-xl p-4 bg-muted/30 text-sm text-muted-foreground text-center">
              This ticket is closed. Reopen it to reply.
            </div>
          )}
        </div>

        {/* ── RIGHT — Sidebar ──────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className={`border rounded-xl overflow-hidden ${
              alerts.some((a) => a.level === "critical")
                ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
                : "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20"
            }`}>
              <div className="px-4 py-3 border-b border-inherit flex items-center justify-between">
                <p className="text-sm font-semibold">Alerts</p>
                <span className="text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded-full">
                  {alerts.length}
                </span>
              </div>
              <ul className="divide-y divide-inherit">
                {alerts.map((alert, i) => (
                  <li key={i} className="flex items-start gap-2 px-4 py-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${alert.level === "critical" ? "bg-red-500" : "bg-orange-400"}`} />
                    <p className="text-xs">{alert.message}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ticket Health */}
          {health && (
            <div className="border rounded-xl overflow-hidden bg-card">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                <p className="text-sm font-semibold">Ticket Health</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  health.status === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                  health.status === "warning"  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                  "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                }`}>
                  {health.status}
                </span>
              </div>
              <ul className="divide-y">
                {[
                  ["Urgency",        <span key="u" className={`text-xs font-medium capitalize ${
                    health.urgency === "high"   ? "text-red-600 dark:text-red-400" :
                    health.urgency === "medium" ? "text-yellow-600 dark:text-yellow-400" :
                    "text-green-600 dark:text-green-400"
                  }`}>{health.urgency}</span>],
                  ["Open for",       <span key="o" className="text-xs font-medium">{health.time_open_hours}h</span>],
                  ["Last reply",     health.time_since_last_reply !== null
                    ? <span key="r" className="text-xs font-medium">{health.time_since_last_reply}h ago</span>
                    : <span key="r" className="text-xs text-muted-foreground">No admin reply yet</span>],
                ].map(([label, value], i) => (
                  <li key={i} className="flex items-center justify-between gap-2 px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">{label as string}</span>
                    <div className="text-right">{value as React.ReactNode}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {!isClosed && (
            <div className="border rounded-xl overflow-hidden bg-card">
              <div className="px-4 py-3 border-b bg-muted/30">
                <p className="text-sm font-semibold">Actions</p>
              </div>
              <div className="p-4 space-y-2">
                {!ticket.asignado_a && (
                  <Button
                    size="sm"
                    className="w-full justify-start"
                    variant="outline"
                    disabled={processing === "assign"}
                    onClick={() => handleAction("assign", "PATCH", "Ticket assigned to you")}
                  >
                    {processing === "assign" ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                    Assign to me
                  </Button>
                )}
                {ticket.estado !== "en_proceso" && (
                  <Button
                    size="sm"
                    className="w-full justify-start"
                    variant="outline"
                    disabled={processing === "in-progress"}
                    onClick={() => handleAction("in-progress", "PATCH", "Ticket marked in progress")}
                  >
                    {processing === "in-progress" ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                    Mark in progress
                  </Button>
                )}
                {ticket.estado !== "esperando_usuario" && (
                  <Button
                    size="sm"
                    className="w-full justify-start"
                    variant="outline"
                    disabled={processing === "waiting"}
                    onClick={() => handleAction("waiting", "PATCH", "Waiting for user response")}
                  >
                    {processing === "waiting" ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                    Mark waiting user
                  </Button>
                )}
                <Button
                  size="sm"
                  className="w-full justify-start"
                  variant="destructive"
                  disabled={processing === "close"}
                  onClick={() => {
                    if (!confirm("Close this ticket?")) return
                    handleAction("close", "PATCH", "Ticket closed")
                  }}
                >
                  {processing === "close" ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                  Close ticket
                </Button>
              </div>
            </div>
          )}

          {isClosed && (
            <div className="border rounded-xl overflow-hidden bg-card">
              <div className="px-4 py-3 border-b bg-muted/30">
                <p className="text-sm font-semibold">Actions</p>
              </div>
              <div className="p-4">
                <Button
                  size="sm"
                  className="w-full"
                  variant="outline"
                  disabled={processing === "status"}
                  onClick={() => handleAction("status", "PATCH", "Ticket reopened", { estado: "abierto" })}
                >
                  Reopen ticket
                </Button>
              </div>
            </div>
          )}

          {/* Ticket info */}
          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="px-4 py-3 border-b bg-muted/30">
              <p className="text-sm font-semibold">Ticket Info</p>
            </div>
            <ul className="divide-y">
              {[
                ["Status",   <Badge key="s" className={`text-xs ${statusClass(ticket.estado)}`}>{STATUS_LABELS[ticket.estado] ?? ticket.estado}</Badge>],
                ["Priority", <Badge key="p" className={`text-xs ${priorityClass(ticket.prioridad)}`}>{ticket.prioridad}</Badge>],
                ["Type",     <Badge key="t" className={`text-xs ${TIPO_STYLE[ticket.tipo] ?? "border-0"}`}>{TIPO_LABELS[ticket.tipo] ?? ticket.tipo}</Badge>],
                ["Assigned", ticket.asignado_a ? <span key="a" className="text-xs font-medium text-green-600">Admin #{ticket.asignado_a}</span> : <span key="a" className="text-xs text-muted-foreground">Unassigned</span>],
                ["Created",  <span key="c" className="text-xs text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</span>],
                ...(ticket.closedAt ? [["Closed", <span key="cl" className="text-xs text-muted-foreground">{new Date(ticket.closedAt).toLocaleDateString()}</span>]] : []),
                ["Messages", <span key="m" className="text-xs font-medium">{messages.length}</span>],
              ].map(([label, value], i) => (
                <li key={i} className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <span className="text-xs text-muted-foreground shrink-0">{label as string}</span>
                  <div className="text-right">{value as React.ReactNode}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Seller info */}
          {seller ? (
            <div className="border rounded-xl overflow-hidden bg-card">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                <p className="text-sm font-semibold">Seller</p>
                <Link
                  href={`/admin/sellers/${seller.user_id}`}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  View profile →
                </Link>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold">{seller.nombre_comercio}</p>
                  {seller.telefono_comercio && (
                    <p className="text-xs text-muted-foreground mt-0.5">{formatPhone(seller.telefono_comercio)}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  {[
                    ["KYC Status",  seller.estado_validacion],
                    ["KYC Score",   `${seller.kyc_score}%`],
                    ["Risk Level",  seller.kyc_riesgo],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{l}</span>
                      <span className={`font-medium ${l === "Risk Level" ? (KYC_RIESGO_STYLE[v as string] ?? "") : ""}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-xl p-4 bg-muted/20 text-center">
              <p className="text-xs text-muted-foreground">No seller profile linked to this ticket's user</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
