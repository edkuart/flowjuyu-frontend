"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { authFetch } from "@/lib/authFetch"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

interface Ticket {
  id: number
  asunto: string
  estado: string
  prioridad: string
}

interface Message {
  id: number
  mensaje: string
  es_admin: boolean
  createdAt: string
}

export default function SellerTicketDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(true)

  async function fetchDetail() {
    const res = await authFetch(
      `${API}/api/seller/tickets/${id}`
    )
    if (!res.ok) return

    const data = await res.json()
    setTicket(data.data.ticket)
    setMessages(data.data.messages)
    setLoading(false)
  }

  useEffect(() => {
    if (id) fetchDetail()
  }, [id])

  async function handleReply() {
    if (!reply.trim()) return

    await authFetch(
      `${API}/api/seller/tickets/${id}/reply`,
      {
        method: "POST",
        body: JSON.stringify({ mensaje: reply }),
      }
    )

    setReply("")
    fetchDetail()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    )
  }

  if (!ticket) {
    return <div>Ticket no encontrado</div>
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef] p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-8 space-y-6">

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {ticket.asunto}
          </h2>
          <Badge>{ticket.estado}</Badge>
        </div>

        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-md px-4 py-3 rounded-2xl ${
                msg.es_admin
                  ? "bg-amber-500 text-white"
                  : "bg-neutral-100"
              }`}
            >
              {msg.mensaje}
              <div className="text-xs opacity-70 mt-1">
                {new Date(msg.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {ticket.estado !== "cerrado" && (
          <div className="flex gap-4">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Escribe tu respuesta..."
              className="flex-1 px-4 py-3 border rounded-xl"
            />
            <Button onClick={handleReply}>
              Responder
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => router.push("/seller/tickets")}
        >
          Volver
        </Button>

      </div>
    </div>
  )
}
