"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import {
  Card,
  CardContent
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  Package,
  DollarSign,
  Star
} from "lucide-react"
import { useState } from "react"

export default function SellerDashboardPage() {
  const resumen = [
    { icon: <DollarSign className="text-green-600" />, label: "Ventas del mes", value: "Q 3,200.00" },
    { icon: <ShoppingCart className="text-blue-600" />, label: "Pedidos completados", value: "22" },
    { icon: <Package className="text-purple-600" />, label: "Productos activos", value: "10" },
    { icon: <Star className="text-yellow-500" />, label: "Calificación promedio", value: "4.6 / 5" },
  ]

  const [year, setYear] = useState(2025)
  const [detallePedidoIndex, setDetallePedidoIndex] = useState<number | null>(null)

  const ventasPorMes = [
    { mes: "Ene", ventas: 800 },
    { mes: "Feb", ventas: 1100 },
    { mes: "Mar", ventas: 950 },
    { mes: "Abr", ventas: 1200 },
    { mes: "May", ventas: 600 },
    { mes: "Jun", ventas: 1300 },
    { mes: "Jul", ventas: 500 },
    { mes: "Ago", ventas: 1000 },
    { mes: "Sep", ventas: 1150 },
    { mes: "Oct", ventas: 950 },
    { mes: "Nov", ventas: 1250 },
    { mes: "Dic", ventas: 1400 }
  ]

  const categorias: { name: string; value: number }[] = [
    { name: "Blusas", value: 8 },
    { name: "Trajes", value: 6 },
    { name: "Carteras", value: 4 },
    { name: "Otros", value: 2 },
  ]

  const ventasPorCategoria: { mes: string; blusas: number; trajes: number; carteras: number }[] = [
    { mes: "Ene", blusas: 200, trajes: 150, carteras: 80 },
    { mes: "Feb", blusas: 180, trajes: 120, carteras: 100 },
    { mes: "Mar", blusas: 210, trajes: 130, carteras: 90 },
    { mes: "Abr", blusas: 250, trajes: 160, carteras: 110 },
    { mes: "May", blusas: 140, trajes: 90, carteras: 60 },
    { mes: "Jun", blusas: 300, trajes: 200, carteras: 120 }
  ]

  const actividadReciente = [
    {
      cliente: "Ana López",
      productos: [
        { nombre: "Blusa típica", cantidad: 1, precio: 120.00 }
      ],
      total: 120.00,
      estado: "Completado",
      fecha: "24/jun"
    },
    {
      cliente: "Carlos Pérez",
      productos: [
        { nombre: "Faja multicolor", cantidad: 1, precio: 90.00 },
        { nombre: "Blusa típica", cantidad: 2, precio: 240.00 }
      ],
      total: 330.00,
      estado: "Enviado",
      fecha: "23/jun"
    }
  ]

  const colores = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50"]

  return (
    <main className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {resumen.map((item, idx) => (
          <Card key={idx} className="flex flex-col items-start gap-2 p-4">
            <div className="text-2xl">{item.icon}</div>
            <div className="text-sm text-muted-foreground">{item.label}</div>
            <div className="text-lg font-bold">{item.value}</div>
          </Card>
        ))}
      </section>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Ventas por mes - {year}</h2>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ventasPorMes}>
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="ventas" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-bold mb-2">Categorías más vendidas</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={categorias}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name }: { name: string }) => name}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categorias.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-bold mb-2">Evolución de ventas por categoría</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ventasPorCategoria}>
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="blusas" fill="#34d399" name="Blusas" />
            <Bar dataKey="trajes" fill="#6366f1" name="Trajes" />
            <Bar dataKey="carteras" fill="#fbbf24" name="Carteras" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-bold mb-2">Actividad reciente</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Cliente</th>
                <th className="text-left p-2">Productos</th>
                <th className="text-left p-2">Total</th>
                <th className="text-left p-2">Estado</th>
                <th className="text-left p-2">Fecha</th>
                <th className="text-left p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {actividadReciente.map((pedido, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 whitespace-nowrap">{pedido.cliente}</td>
                  <td className="p-2 whitespace-nowrap">
                    {detallePedidoIndex === index ? (
                      <ul className="list-disc ml-4">
                        {pedido.productos.map((prod, i) => (
                          <li key={i}>{prod.nombre} x{prod.cantidad} - Q {prod.precio.toFixed(2)}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>{pedido.productos.length} producto(s)</span>
                    )}
                  </td>
                  <td className="p-2 whitespace-nowrap">Q {pedido.total.toFixed(2)}</td>
                  <td className="p-2 whitespace-nowrap">{pedido.estado}</td>
                  <td className="p-2 whitespace-nowrap">{pedido.fecha}</td>
                  <td className="p-2 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDetallePedidoIndex(index === detallePedidoIndex ? null : index)}
                    >
                      {detallePedidoIndex === index ? "Ocultar" : "Ver productos"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  )
}
