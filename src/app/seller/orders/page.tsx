'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CalendarDays, Loader2 } from 'lucide-react'

type PedidoProducto = { nombre: string; imagen?: string; precio: number; cantidad?: number }
type Pedido = {
  id: string
  fecha: string // ISO
  estado: 'Pendiente' | 'En preparación' | 'En camino' | 'Entregado' | 'Cancelado'
  total: number
  cliente: string
  envio: string
  metodo: string
  productos: PedidoProducto[]
}

const ESTADOS: Pedido['estado'][] = ['Pendiente', 'En preparación', 'En camino', 'Entregado', 'Cancelado']

// ===== Helpers =====
const formatQ = (n: number) =>
  `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const estadoStyle = (estado: Pedido['estado']) => {
  switch (estado) {
    case 'Pendiente':
      return 'border-amber-500 text-amber-600'
    case 'En preparación':
      return 'border-blue-500 text-blue-600'
    case 'En camino':
      return 'border-orange-500 text-orange-600'
    case 'Entregado':
      return 'border-green-600 text-green-700'
    case 'Cancelado':
      return 'border-red-600 text-red-700'
    default:
      return 'border-muted-foreground text-muted-foreground'
  }
}

// Mock por si el backend no está listo
const mockPedidos: Pedido[] = [
  {
    id: '1248',
    fecha: '2025-06-20',
    estado: 'En camino',
    total: 245.0,
    cliente: 'María López',
    envio: 'Zona 3, Quetzaltenango',
    metodo: 'Tarjeta crédito',
    productos: [
      { nombre: 'Blusa típica bordada', imagen: '/productos/blusa1.jpg', precio: 120, cantidad: 1 },
      { nombre: 'Faja multicolor artesanal', imagen: '/productos/faja1.jpg', precio: 125, cantidad: 1 },
    ],
  },
  {
    id: '1249',
    fecha: '2025-06-15',
    estado: 'Entregado',
    total: 300.0,
    cliente: 'Ana Gómez',
    envio: 'Zona 1, Totonicapán',
    metodo: 'Pago contra entrega',
    productos: [{ nombre: 'Traje regional', imagen: '/productos/traje1.jpg', precio: 300, cantidad: 1 }],
  },
]

// ===== Utilidades de fechas (YYYY-MM-DD) =====
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Rango rápido activo (para resaltar botón)
function sameRange(aFrom: string, aTo: string, bFrom: string, bTo: string) {
  return aFrom === bFrom && aTo === bTo
}

export default function SellerOrdersPage() {
  // filtros
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState<Pedido['estado'] | 'Todos'>('Todos')
  const [from, setFrom] = useState<string>('') // YYYY-MM-DD
  const [to, setTo] = useState<string>('')     // YYYY-MM-DD

  // data
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(8)
  const [hasMore, setHasMore] = useState(false)

  // modal detalle
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<Pedido | null>(null)

  // ===== RANGOS RÁPIDOS =====
  const today = toYMD(new Date())
  const last7From = toYMD(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)) // incluye hoy
  const last30From = toYMD(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000))
  const monthStart = (() => {
    const d = new Date()
    return toYMD(new Date(d.getFullYear(), d.getMonth(), 1))
  })()

  const quickRanges = [
    { key: 'hoy', label: 'Hoy', from: today, to: today },
    { key: 'semana', label: 'Últimos 7 días', from: last7From, to: today },
    { key: 'mes-actual', label: 'Este mes', from: monthStart, to: today },
    { key: '30', label: 'Últimos 30 días', from: last30From, to: today },
  ] as const

  function applyQuickRange(f: string, t: string) {
    setFrom(f)
    setTo(t)
    setPage(1)
    // El useEffect de filtros recargará automáticamente
  }

  // ===== Cargar pedidos =====
  async function cargarPedidos(p = page) {
    setLoading(true)
    try {
      // adapta tu endpoint; ejemplo con query params
      const params = new URLSearchParams()
      params.set('page', String(p))
      params.set('limit', String(pageSize))
      if (q.trim()) params.set('q', q.trim())
      if (estado !== 'Todos') params.set('estado', estado)
      if (from) params.set('from', from)
      if (to) params.set('to', to)

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/seller/orders?${params.toString()}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        cache: 'no-store',
      })

      if (res.ok) {
        // Espera algo como { items: Pedido[], hasMore: boolean }
        const json = await res.json()
        setPedidos(json.items ?? [])
        setHasMore(!!json.hasMore)
      } else {
        // si tu backend aún no existe, usa mock con filtro en cliente
        const filtered = filterLocal(mockPedidos, { q, estado, from, to })
        setPedidos(paginate(filtered, p, pageSize))
        setHasMore(p * pageSize < filtered.length)
      }
    } catch (e) {
      console.error(e)
      const filtered = filterLocal(mockPedidos, { q, estado, from, to })
      setPedidos(paginate(filtered, p, pageSize))
      setHasMore(p * pageSize < filtered.length)
    } finally {
      setLoading(false)
    }
  }

  // util local para mocks
  function filterLocal(items: Pedido[], f: { q: string; estado: Pedido['estado'] | 'Todos'; from: string; to: string }) {
    return items.filter((it) => {
      const matchQ =
        !f.q ||
        it.id.toLowerCase().includes(f.q.toLowerCase()) ||
        it.cliente.toLowerCase().includes(f.q.toLowerCase())
      const matchEstado = f.estado === 'Todos' || it.estado === f.estado
      const t = new Date(it.fecha).getTime()
      const min = f.from ? new Date(f.from).getTime() : -Infinity
      const max = f.to ? new Date(f.to).getTime() : Infinity
      const matchDate = t >= min && t <= max
      return matchQ && matchEstado && matchDate
    })
  }
  function paginate<T>(arr: T[], p: number, size: number) {
    const start = (p - 1) * size
    return arr.slice(start, start + size)
  }

  // carga inicial
  useEffect(() => {
    cargarPedidos(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // cuando cambian filtros, vuelve a página 1 y recarga
  useEffect(() => {
    setPage(1)
    cargarPedidos(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, estado, from, to])

  // ===== Exportar CSV "amigable para Excel" =====
  function exportCSV() {
    if (!pedidos.length) return

    const DELIM = ';' // mejor que coma en entornos ES (coma decimal)
    const normalizeText = (s: string) =>
      String(s).replace(/\r?\n|\r/g, ' ').replace(/"/g, '""').trim()

    const toMoneyNumber = (n: number) => n.toFixed(2) // 2 decimales, sin "Q "
    const toMoneyHuman = (n: number) =>
      `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    const headers = [
      'ID',
      'Fecha',
      'Estado',
      'Cliente',
      'Total (num)',
      'Total (texto)',
      'Método',
      'Envío',
      'Productos',
    ]

    const rows = pedidos.map((p) => {
      const productosTxt = p.productos
        .map((pp) => `${pp.nombre} x${pp.cantidad ?? 1} (${toMoneyHuman(pp.precio)})`)
        .join(' / ')

      const cols = [
        p.id,
        p.fecha,                // o: new Date(p.fecha).toISOString().slice(0,10)
        p.estado,
        p.cliente,
        toMoneyNumber(p.total), // num puro
        toMoneyHuman(p.total),  // bonito
        p.metodo,
        p.envio,
        productosTxt,
      ]

      return cols.map((c) => `"${normalizeText(c)}"`).join(DELIM)
    })

    const totalNum = pedidos.reduce((acc, p) => acc + p.total, 0)
    const footer = [
      '""', // ID
      '""', // Fecha
      '""', // Estado
      '"TOTAL"', // Cliente
      `"${toMoneyNumber(totalNum)}"`,
      `"${toMoneyHuman(totalNum)}"`,
      '""',
      '""',
      '""',
    ].join(DELIM)

    const csv = [
      '\uFEFF' + headers.map((h) => `"${normalizeText(h)}"`).join(DELIM), // BOM + cabecera
      ...rows,
      footer,
    ].join('\r\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  // totales visibles en la página actual
  const totalPagina = useMemo(() => pedidos.reduce((acc, p) => acc + p.total, 0), [pedidos])

  // detectar rango activo para resaltar botón
  const activeKey = (() => {
    if (sameRange(from, to, today, today)) return 'hoy'
    if (sameRange(from, to, last7From, today)) return 'semana'
    if (sameRange(from, to, monthStart, today)) return 'mes-actual'
    if (sameRange(from, to, last30From, today)) return '30'
    return ''
  })()

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Historial de pedidos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Consulta, filtra y exporta tus pedidos
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Total en página</div>
          <div className="text-lg font-semibold">{formatQ(totalPagina)}</div>
        </div>
      </header>

      {/* Botones de rango rápido */}
      <div className="flex flex-wrap gap-2">
        {quickRanges.map((r) => (
          <Button
            key={r.key}
            variant={activeKey === r.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => applyQuickRange(r.from, r.to)}
          >
            {r.label}
          </Button>
        ))}
        <Button
          variant={!from && !to ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setFrom(''); setTo('') }}
        >
          Todos
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <Label className="text-xs">Buscar (ID o cliente)</Label>
            <Input
              placeholder="Ej. 1248 o María"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Estado</Label>
            <select
              className="w-full h-9 border rounded-md bg-background"
              value={estado}
              onChange={(e) => setEstado(e.target.value as any)}
            >
              <option value="Todos">Todos</option>
              {ESTADOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs">Desde</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Hasta</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="md:col-span-5 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => { setQ(''); setEstado('Todos'); setFrom(''); setTo('') }}>
              Limpiar
            </Button>
            <Button variant="secondary" onClick={exportCSV}>Exportar CSV</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <section className="space-y-4">
        {loading ? (
          <Card><CardContent className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
          </CardContent></Card>
        ) : pedidos.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No hay pedidos con esos filtros.</CardContent></Card>
        ) : (
          pedidos.map((pedido) => (
            <Card key={pedido.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pedido <span className="font-medium">#{pedido.id}</span>
                    </p>
                    <p className="text-base font-semibold">
                      {pedido.productos.length}{' '}
                      {pedido.productos.length > 1 ? 'artículos' : 'artículo'}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline" className={`text-xs ${estadoStyle(pedido.estado)}`}>
                      {pedido.estado}
                    </Badge>
                    <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-neutral-700">
                  <div className="space-y-1">
                    <p><span className="font-medium">Cliente:</span> {pedido.cliente}</p>
                    <p><span className="font-medium">Total:</span> {formatQ(pedido.total)}</p>
                    <p><span className="font-medium">Método:</span> {pedido.metodo}</p>
                    <p><span className="font-medium">Envío a:</span> {pedido.envio}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 items-start">
                    {pedido.productos.map((producto, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <img
                          src={producto.imagen || '/placeholder.svg'}
                          alt={producto.nombre}
                          className="w-14 h-14 object-cover rounded-md border"
                        />
                        <div>
                          <p className="text-sm font-medium">{producto.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {producto.cantidad ? `x${producto.cantidad} · ` : ''}
                            {formatQ(producto.precio)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => { setCurrent(pedido); setOpen(true) }}
                  >
                    Ver detalle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {/* Paginación */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          disabled={page === 1 || loading}
          onClick={() => { const p = page - 1; setPage(p); cargarPedidos(p) }}
        >
          ← Anterior
        </Button>
        <span className="text-xs text-muted-foreground">Página {page}</span>
        <Button
          variant="outline"
          disabled={!hasMore || loading}
          onClick={() => { const p = page + 1; setPage(p); cargarPedidos(p) }}
        >
          Siguiente →
        </Button>
      </div>

      {/* Modal detalle */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del pedido {current?.id}</DialogTitle>
          </DialogHeader>
          {current && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <div className="text-muted-foreground">
                  {new Date(current.fecha).toLocaleString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </div>
                <Badge variant="outline" className={`text-xs ${estadoStyle(current.estado)}`}>
                  {current.estado}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="font-medium">Cliente</div>
                  <div>{current.cliente}</div>
                </div>
                <div>
                  <div className="font-medium">Total</div>
                  <div>{formatQ(current.total)}</div>
                </div>
                <div>
                  <div className="font-medium">Método</div>
                  <div>{current.metodo}</div>
                </div>
                <div>
                  <div className="font-medium">Envío</div>
                  <div className="truncate">{current.envio}</div>
                </div>
              </div>

              <div className="pt-2">
                <div className="font-medium mb-2">Productos</div>
                <div className="space-y-2">
                  {current.productos.map((p, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={p.imagen || '/placeholder.svg'}
                          alt={p.nombre}
                          className="w-10 h-10 rounded border object-cover"
                        />
                        <div>
                          <div className="font-medium text-sm">{p.nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.cantidad ? `x${p.cantidad} · ` : ''}{formatQ(p.precio)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {formatQ((p.cantidad ?? 1) * p.precio)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground">Subtotal aprox.</div>
                  <div className="font-semibold">{formatQ(current.productos.reduce((a, p) => a + (p.precio * (p.cantidad ?? 1)), 0))}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground">Total pedido</div>
                  <div className="font-semibold">{formatQ(current.total)}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
