'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart as BarChartIcon,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  PlusCircle,
  Boxes,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts'

type PedidoResumen = {
  id: string
  cliente: string
  total: number
  estado: 'Pendiente' | 'En preparación' | 'En camino' | 'Entregado' | 'Cancelado'
  fecha: string // ISO
}

type KPI = {
  ventasMes: number
  pedidosMes: number
  ticketPromedio: number
  productosActivos: number
}

type VentasMes = { mes: string; ventas: number }

const colores = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7']

const Q = (n: number) =>
  `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function SellerDashboardPage() {
  const [kpi, setKpi] = useState<KPI>({
    ventasMes: 0,
    pedidosMes: 0,
    ticketPromedio: 0,
    productosActivos: 0,
  })
  const [ventasPorMes, setVentasPorMes] = useState<VentasMes[]>([])
  const [topCategorias, setTopCategorias] = useState<{ name: string; value: number }[]>([])
  const [actividadReciente, setActividadReciente] = useState<PedidoResumen[]>([])
  const [lowStock, setLowStock] = useState<{ id: string; nombre: string; stock: number }[]>([])
  const [validacionesPendientes, setValidacionesPendientes] = useState<string[]>([])

  useEffect(() => {
    // Intenta cargar de tu API; si falla, usa mock
    ;(async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL
        const token = localStorage.getItem('token') || ''
        const headers = { Authorization: `Bearer ${token}` }

        const [kpiRes, ventasRes, topRes, actividadRes, stockRes, valRes] = await Promise.all([
          fetch(`${base}/api/seller/dashboard/kpis`, { headers }),
          fetch(`${base}/api/seller/dashboard/sales-by-month`, { headers }),
          fetch(`${base}/api/seller/dashboard/top-categories`, { headers }),
          fetch(`${base}/api/seller/orders?limit=5`, { headers }),
          fetch(`${base}/api/seller/products/low-stock?limit=3`, { headers }),
          fetch(`${base}/api/seller/profile/pending-validations`, { headers }),
        ])

        if (kpiRes.ok) setKpi(await kpiRes.json())
        else
          setKpi({
            ventasMes: 3200,
            pedidosMes: 22,
            ticketPromedio: 145.45,
            productosActivos: 10,
          })

        if (ventasRes.ok) setVentasPorMes(await ventasRes.json())
        else
          setVentasPorMes([
            { mes: 'Ene', ventas: 800 },
            { mes: 'Feb', ventas: 1100 },
            { mes: 'Mar', ventas: 950 },
            { mes: 'Abr', ventas: 1200 },
            { mes: 'May', ventas: 600 },
            { mes: 'Jun', ventas: 1300 },
            { mes: 'Jul', ventas: 500 },
            { mes: 'Ago', ventas: 1000 },
            { mes: 'Sep', ventas: 1150 },
            { mes: 'Oct', ventas: 950 },
            { mes: 'Nov', ventas: 1250 },
            { mes: 'Dic', ventas: 1400 },
          ])

        if (topRes.ok) setTopCategorias(await topRes.json())
        else
          setTopCategorias([
            { name: 'Blusas', value: 8 },
            { name: 'Trajes', value: 6 },
            { name: 'Carteras', value: 4 },
            { name: 'Accesorios', value: 3 },
            { name: 'Otros', value: 2 },
          ])

        if (actividadRes.ok) {
          const json = await actividadRes.json()
          setActividadReciente(json.items ?? [])
        } else {
          setActividadReciente([
            {
              id: '1249',
              cliente: 'Ana López',
              total: 120,
              estado: 'Entregado',
              fecha: '2025-06-24',
            },
            {
              id: '1250',
              cliente: 'Carlos Pérez',
              total: 330,
              estado: 'En camino',
              fecha: '2025-06-23',
            },
            {
              id: '1251',
              cliente: 'Luis García',
              total: 90,
              estado: 'Pendiente',
              fecha: '2025-06-22',
            },
          ])
        }

        if (stockRes.ok) setLowStock(await stockRes.json())
        else
          setLowStock([
            { id: 'P-101', nombre: 'Blusa roja bordada', stock: 2 },
            { id: 'P-143', nombre: 'Faja multicolor', stock: 1 },
          ])

        if (valRes.ok) setValidacionesPendientes(await valRes.json())
        else setValidacionesPendientes(['Selfie con DPI (seller#123)'])
      } catch {
        // ya tenemos mocks arriba si algo falla
      }
    })()
  }, [])

  return (
    <main className="min-h-screen px-4 py-8 space-y-8">
      {/* Header + acción rápida */}
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Bienvenido al Panel del Vendedor
          </h1>
          <p className="text-muted-foreground text-sm">
            Consulta métricas generales de tu tienda y gestiona tus productos y pedidos.
          </p>
        </div>

        <Link href="/seller/reports">
          <Button className="gap-2">
            <BarChartIcon className="w-4 h-4" />
            Reportes
          </Button>
        </Link>
      </section>

      {/* KPIs */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-muted/30 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ventas del mes</p>
                <h2 className="text-2xl font-bold text-neutral-900">{Q(kpi.ventasMes)}</h2>
              </div>
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-muted/30 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos del mes</p>
                <h2 className="text-2xl font-bold text-neutral-900">{kpi.pedidosMes}</h2>
              </div>
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-muted/30 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket promedio</p>
                <h2 className="text-2xl font-bold text-neutral-900">{Q(kpi.ticketPromedio)}</h2>
              </div>
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-muted/30 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Productos activos</p>
                <h2 className="text-2xl font-bold text-neutral-900">{kpi.productosActivos}</h2>
              </div>
              <Package className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Gráficos */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Ventas por mes */}
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Ventas por mes</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ventasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(v: any) => Q(Number(v))} />
              <Bar dataKey="ventas" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top categorías */}
        <Card className="p-4">
          <h2 className="text-lg font-bold mb-2">Top categorías</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={topCategorias}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {topCategorias.map((_, i) => (
                  <Cell key={i} fill={colores[i % colores.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Actividad reciente + Alertas */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Actividad reciente */}
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Actividad reciente</h2>
            <Link href="/seller/orders">
              <Button variant="outline" className="h-8">Ver todos</Button>
            </Link>
          </div>
          <div className="divide-y">
            {actividadReciente.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Pedido #{p.id} — {p.cliente}</div>
                    <div className="text-muted-foreground">
                      {new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-semibold">{Q(p.total)}</div>
                  <Badge
                    variant="outline"
                    className={
                      p.estado === 'Entregado' ? 'border-green-600 text-green-700' :
                      p.estado === 'En camino' ? 'border-orange-500 text-orange-600' :
                      p.estado === 'En preparación' ? 'border-blue-500 text-blue-600' :
                      p.estado === 'Pendiente' ? 'border-amber-500 text-amber-600' :
                      'border-red-600 text-red-700'
                    }
                  >
                    {p.estado}
                  </Badge>
                </div>
              </div>
            ))}
            {actividadReciente.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">Sin actividad reciente.</div>
            )}
          </div>
        </Card>

        {/* Alertas */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-bold">Alertas</h2>

          {/* Stock bajo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Stock bajo</span>
            </div>
            {lowStock.length ? (
              <ul className="text-sm space-y-1">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span className="truncate">{p.nombre}</span>
                    <Badge variant="outline" className="border-amber-500 text-amber-700">
                      {p.stock} uds
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">Todo OK.</div>
            )}
          </div>

          {/* Validaciones pendientes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Validaciones pendientes</span>
            </div>
            {validacionesPendientes.length ? (
              <ul className="list-disc pl-5 text-sm">
                {validacionesPendientes.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">Sin pendientes.</div>
            )}
          </div>
        </Card>
      </section>

      {/* Atajos */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/seller/products/new">
          <Button className="w-full justify-start gap-2" variant="secondary">
            <PlusCircle className="w-4 h-4" />
            Publicar nuevo producto
          </Button>
        </Link>
        <Link href="/seller/products">
          <Button className="w-full justify-start gap-2" variant="secondary">
            <Boxes className="w-4 h-4" />
            Gestionar inventario
          </Button>
        </Link>
        <Link href="/seller/reports">
          <Button className="w-full justify-start gap-2" variant="secondary">
            <BarChartIcon className="w-4 h-4" />
            Ver reportes detallados
          </Button>
        </Link>
      </section>
    </main>
  )
}
