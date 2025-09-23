"use client"

import { useMemo, useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type OrderItem = {
  name: string
  price: number
  qty: number
  image?: string
}

type Order = {
  id: number
  status: "Entregado" | "En camino" | "Pendiente" | "Cancelado"
  date: string // ISO o legible
  customer: string
  total: number
  payment: string
  address: string
  items: OrderItem[]
}

const MOCK: Order[] = [
  {
    id: 1249,
    status: "Entregado",
    date: "14 de junio de 2025",
    customer: "Ana Gómez",
    total: 300,
    payment: "Pago contra entrega",
    address: "Zona 1, Totonicapán",
    items: [{ name: "Traje regional", price: 300, qty: 1 }],
  },
  {
    id: 1248,
    status: "En camino",
    date: "19 de junio de 2025",
    customer: "Carlos Pérez",
    total: 245,
    payment: "Tarjeta crédito",
    address: "Zona 3, Quetzaltenango",
    items: [
      { name: "Blusa típica bordada", price: 120, qty: 1 },
      { name: "Faja multicolor artesanal", price: 125, qty: 1 },
    ],
  },
]

function money(n: number) {
  return `Q ${n.toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function OrdersHistoryPage() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"" | Order["status"]>("Entregado")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const filtered = useMemo(() => {
    return MOCK.filter((o) => {
      const q = query.trim().toLowerCase()
      if (q) {
        const hit =
          String(o.id).includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q))
        if (!hit) return false
      }
      if (status && o.status !== status) return false

      // Filtro por fechas sólo si vienen (usa YYYY-MM-DD del <input type="date">)
      if (from) {
        try {
          const f = new Date(from).getTime()
          const od = new Date(o.date).getTime() || Date.now()
          if (od < f) return false
        } catch {}
      }
      if (to) {
        try {
          const t = new Date(to).getTime()
          const od = new Date(o.date).getTime() || Date.now()
          if (od > t) return false
        } catch {}
      }

      return true
    })
  }, [query, status, from, to])

  const totalPage = filtered.reduce((acc, o) => acc + o.total, 0)

  function clearFilters() {
    setQuery("")
    setStatus("" as any)
    setFrom("")
    setTo("")
  }

  function exportCSV() {
    const headers = [
      "Pedido",
      "Fecha",
      "Cliente",
      "Estado",
      "Total",
      "Método",
      "Dirección",
    ]
    const rows = filtered.map((o) => [
      `#${o.id}`,
      o.date,
      o.customer,
      o.status,
      o.total,
      o.payment,
      o.address,
    ])
    const csv =
      [headers, ...rows]
        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
        .join("\n") + "\n"

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "historial_pedidos.csv"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <main className="container mx-auto px-4 py-10 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Historial de pedidos</h1>
          <p className="text-muted-foreground">
            Consulta, filtra y exporta tus pedidos
          </p>
        </div>
        <div className="text-right text-sm">
          <div className="text-muted-foreground">Total en página</div>
          <div className="text-lg font-semibold">{money(totalPage)}</div>
        </div>
      </header>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-1">
              <label className="text-sm font-medium">Buscar (ID o cliente)</label>
              <Input
                placeholder="Ej. 1248 o María"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Estado</label>
              <select
                className="border rounded-md h-10 px-3 w-full text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="">Todos</option>
                <option>Entregado</option>
                <option>En camino</option>
                <option>Pendiente</option>
                <option>Cancelado</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Desde</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Hasta</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Limpiar
            </Button>
            <Button variant="outline" onClick={exportCSV}>
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Listado */}
      {filtered.map((o) => (
        <Card key={o.id}>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-[1fr_auto] gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Pedido #{o.id}</div>
                <div className="font-semibold mt-1">
                  {o.items.reduce((a, it) => a + it.qty, 0)} artículo
                  {o.items.reduce((a, it) => a + it.qty, 0) > 1 ? "s" : ""}
                </div>

                <div className="mt-4 space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Cliente:</span> {o.customer}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> {money(o.total)}
                  </div>
                  <div>
                    <span className="font-medium">Método:</span> {o.payment}
                  </div>
                  <div>
                    <span className="font-medium">Envío a:</span> {o.address}
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 space-y-3">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="size-12 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        {it.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={it.name}
                            src={it.image}
                            className="size-12 rounded-md object-cover"
                          />
                        ) : (
                          "img"
                        )}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{it.name}</div>
                        <div className="text-muted-foreground">
                          x{it.qty} · {money(it.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      o.status === "Entregado"
                        ? "success"
                        : o.status === "En camino"
                        ? "warning"
                        : o.status === "Pendiente"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {o.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground">{o.date}</div>
                </div>

                <Button variant="outline" className="mt-4">Ver detalle</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Paginación simple (mock visual) */}
      <div className="flex items-center justify-between">
        <Button variant="outline" disabled>
          ← Anterior
        </Button>
        <div className="text-sm text-muted-foreground">Página 1</div>
        <Button variant="outline" disabled>
          Siguiente →
        </Button>
      </div>
    </main>
  )
}
