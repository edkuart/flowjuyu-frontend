"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"

const pedidos = [
  {
    id: "1248",
    fecha: "2024-06-20",
    estado: "En camino",
    total: 245.0,
    cliente: "María López",
    envio: "Zona 3, Quetzaltenango",
    metodo: "Tarjeta crédito",
    productos: [
      { nombre: "Blusa típica bordada", imagen: "/productos/blusa1.jpg", precio: 120 },
      { nombre: "Faja multicolor artesanal", imagen: "/productos/faja1.jpg", precio: 125 },
    ],
  },
  {
    id: "1249",
    fecha: "2024-06-15",
    estado: "Entregado",
    total: 300.0,
    cliente: "Ana Gómez",
    envio: "Zona 1, Totonicapán",
    metodo: "Pago contra entrega",
    productos: [
      { nombre: "Traje regional", imagen: "/productos/traje1.jpg", precio: 300 },
    ],
  },
]

export default function SellerOrdersPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-neutral-900">Historial de pedidos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Consulta tus pedidos anteriores y su estado
        </p>
      </header>

      <section className="space-y-4">
        {pedidos.map((pedido) => (
          <Card key={pedido.id}>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pedido <span className="font-medium">#{pedido.id}</span>
                  </p>
                  <p className="text-base font-semibold">
                    {pedido.productos.length} {pedido.productos.length > 1 ? "artículos" : "artículo"}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                    {pedido.estado}
                  </Badge>
                  <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(pedido.fecha).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-neutral-700">
                <div>
                  <p><span className="font-medium">Total:</span> Q {pedido.total.toFixed(2)}</p>
                  <p><span className="font-medium">Método:</span> {pedido.metodo}</p>
                  <p><span className="font-medium">Envío a:</span> {pedido.envio}</p>
                </div>
                <div className="flex flex-wrap gap-4 items-start">
                  {pedido.productos.map((producto, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <img src={producto.imagen} alt={producto.nombre} className="w-14 h-14 object-cover rounded-md border" />
                      <div>
                        <p className="text-sm font-medium">{producto.nombre}</p>
                        <p className="text-xs text-muted-foreground">Q {producto.precio.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <Button size="sm" variant="secondary">Ver detalle</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  )
}
