"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { authFetch } from "@/lib/authFetch"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

interface Ticket {
  id: number
  asunto: string
  estado: string
  prioridad: string
  createdAt: string
}

export default function SellerTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchTickets() {
    try {
      const res = await authFetch(`${API}/api/seller/tickets`)
      if (!res.ok) return

      const data = await res.json()
      setTickets(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

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

  return (
    <div className="min-h-screen bg-[#f8f5ef] p-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Mis tickets de soporte
        </h1>

        <Link href="/seller/tickets/new">
          <Button>Nuevo ticket</Button>
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  Cargando...
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  No tienes tickets aún
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Link
                      href={`/seller/tickets/${ticket.id}`}
                      className="text-amber-600 hover:underline"
                    >
                      #{ticket.id}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/seller/tickets/${ticket.id}`}
                      className="hover:underline"
                    >
                      {ticket.asunto}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <Badge className={statusColor(ticket.estado)}>
                      {ticket.estado}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {ticket.prioridad}
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
