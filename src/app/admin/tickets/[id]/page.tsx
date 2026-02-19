"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

interface Message {
  id: number
  mensaje: string
  es_admin: boolean
  createdAt: string
}

export default function AdminTicketDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(true)

  // ========================
  // Fetch ticket detail
  // ========================
  async function fetchDetail() {
    try {
      setLoading(true)

      const res = await authFetch(
        `${API_URL}/api/admin/tickets/${id}`
      )

      if (!res.ok) return

      const data = await res.json()
      setTicket(data.data.ticket)
      setMessages(data.data.messages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchDetail()
  }, [id])

  // ========================
  // Reply
  // ========================
  async function handleReply() {
    if (!reply.trim()) return

    await authFetch(
      `${API_URL}/api/admin/tickets/${id}/reply`,
      {
        method: "POST",
        body: JSON.stringify({ mensaje: reply }),
      }
    )

    setReply("")
    fetchDetail()
  }

  // ========================
  // Close
  // ========================
  async function handleClose() {
    await authFetch(
      `${API_URL}/api/admin/tickets/${id}/close`,
      { method: "PATCH" }
    )

    fetchDetail()
  }

  if (loading) {
    return (
      <div className="bg-[#f8f5ef] min-h-screen p-10">
        Cargando...
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="bg-[#f8f5ef] min-h-screen p-10">
        Ticket no encontrado
      </div>
    )
  }

  return (
    <div className="bg-[#f8f5ef] min-h-screen p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ======================
            Conversación
        ======================= */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] p-8 flex flex-col">

          <h2 className="text-2xl font-semibold mb-6">
            {ticket.asunto}
          </h2>

          <div className="flex-1 space-y-4 overflow-y-auto mb-6">

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  msg.es_admin
                    ? "bg-amber-500 text-white ml-auto"
                    : "bg-neutral-100 text-neutral-800"
                }`}
              >
                {msg.mensaje}
                <div className="text-xs opacity-70 mt-1">
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>
            ))}

          </div>

          {/* Reply */}
          {ticket.estado !== "cerrado" && (
            <div className="flex gap-4">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="flex-1 px-4 py-3 rounded-xl border"
              />
              <Button onClick={handleReply}>
                Responder
              </Button>
            </div>
          )}
        </div>

        {/* ======================
            Panel lateral
        ======================= */}
        <div className="bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] p-8 space-y-6">

          <div>
            <h3 className="font-semibold mb-2">Estado</h3>
            <Badge>{ticket.estado}</Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Prioridad</h3>
            <Badge variant="secondary">
              {ticket.prioridad}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Asignado</h3>
            <p>
              {ticket.asignado_a
                ? "Asignado"
                : "Sin asignar"}
            </p>
          </div>

          {ticket.estado !== "cerrado" && (
            <Button
              variant="destructive"
              onClick={handleClose}
            >
              Cerrar ticket
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() =>
              router.push("/admin/tickets")
            }
          >
            Volver
          </Button>

        </div>
      </div>
    </div>
  )
}