'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  SellerActionButton,
  SellerDetailPanel,
  SellerPill,
  SellerSurfaceCard,
} from '@/components/seller/ui/SellerPrimitives'
import { sellerFieldClassName, sellerHelperTextClassName } from '@/components/seller/ui/sellerFormStyles'
import {
  CalendarDays,
  Loader2,
  Lock,
  ShieldCheck,
  Package,
  User,
  Truck,
  BarChart2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Share2,
  MessageCircle,
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

type PedidoProducto = { nombre: string; imagen?: string; precio: number; cantidad?: number }
type Pedido = {
  id: string
  fecha: string
  estado: 'Pendiente' | 'En preparación' | 'En camino' | 'Entregado' | 'Cancelado'
  total: number
  cliente: string
  envio: string
  metodo: string
  productos: PedidoProducto[]
}

const ESTADOS: Pedido['estado'][] = ['Pendiente', 'En preparación', 'En camino', 'Entregado', 'Cancelado']

const formatQ = (n: number) =>
  `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const estadoStyle = (estado: Pedido['estado']) => {
  switch (estado) {
    case 'Pendiente':      return 'border-amber-500 text-amber-600'
    case 'En preparación': return 'border-blue-500 text-blue-600'
    case 'En camino':      return 'border-orange-500 text-orange-600'
    case 'Entregado':      return 'border-green-600 text-green-700'
    case 'Cancelado':      return 'border-red-600 text-red-700'
    default:               return 'border-muted-foreground text-muted-foreground'
  }
}

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
      { nombre: 'Blusa típica bordada',      imagen: '/productos/blusa1.jpg', precio: 120, cantidad: 1 },
      { nombre: 'Faja multicolor artesanal', imagen: '/productos/faja1.jpg',  precio: 125, cantidad: 1 },
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

const pad   = (n: number) => (n < 10 ? `0${n}` : `${n}`)
const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function sameRange(aFrom: string, aTo: string, bFrom: string, bTo: string) {
  return aFrom === bFrom && aTo === bTo
}

/* ══════════════════════════════════════════
   LOCKED STATE COMPONENT
══════════════════════════════════════════ */

function SellerOrdersLockedState() {
  const router = useRouter()

  const benefits = [
    { icon: <Package   className="w-4 h-4 text-[#0F3D3A]" />, text: 'Recibir pedidos de clientes' },
    { icon: <User      className="w-4 h-4 text-[#0F3D3A]" />, text: 'Ver información del comprador' },
    { icon: <Truck     className="w-4 h-4 text-[#0F3D3A]" />, text: 'Gestionar envíos' },
    { icon: <BarChart2 className="w-4 h-4 text-[#0F3D3A]" />, text: 'Exportar tus ventas' },
  ]

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">

      {/* 1. MAIN BANNER */}
      <Card className="bg-white border border-neutral-100 shadow-sm overflow-hidden">
        <div className="h-1 bg-[#0F3D3A]" />
        <CardContent className="p-8 flex flex-col items-center text-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#f0f7f6] flex items-center justify-center">
            <Lock className="w-7 h-7 text-[#0F3D3A]" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-neutral-900">
              Tu tienda aún no puede recibir pedidos
            </h1>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Para comenzar a vender en Flowjuyu, primero debes completar tu verificación de identidad.
            </p>
          </div>
          <Button
            className="bg-[#0F3D3A] hover:bg-[#0a2e2c] text-white rounded-xl px-6"
            onClick={() => router.push('/seller/account')}
          >
            Completar verificación
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* 2. PREVIEW OF FUTURE ORDERS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            Así se verán tus pedidos
          </p>
          <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
            Vista previa
          </span>
        </div>

        {mockPedidos.slice(0, 2).map((pedido) => (
          <div key={pedido.id} className="relative select-none pointer-events-none">
            {/* EJEMPLO overlay badge */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <span className="bg-white/80 border border-neutral-200 text-neutral-500 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm tracking-widest uppercase">
                Ejemplo
              </span>
            </div>

            <Card className="opacity-50">
              <CardContent className="p-5 space-y-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-neutral-700">
                  <div className="space-y-1">
                    <p><span className="font-medium">Cliente:</span> {pedido.cliente}</p>
                    <p><span className="font-medium">Total:</span> {formatQ(pedido.total)}</p>
                    <p><span className="font-medium">Método:</span> {pedido.metodo}</p>
                    <p><span className="font-medium">Envío a:</span> {pedido.envio}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 items-start">
                    {pedido.productos.map((producto, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-md border bg-neutral-100 flex-shrink-0" />
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
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* 3. SALES POTENTIAL CARD */}
      <Card className="bg-[#f0f7f6] border border-[#c8e6e2] shadow-sm overflow-hidden">
        <div className="h-1 bg-[#0F3D3A]" />
        <CardContent className="p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-[#0F3D3A] uppercase tracking-wide">
              Potencial de ventas
            </p>
            <p className="text-sm text-neutral-500 mt-0.5">
              Esto es lo que podrías lograr con una tienda activa
            </p>
          </div>

          <div className="text-center py-2">
            <p className="text-3xl font-extrabold text-[#0F3D3A] tracking-tight">
              Q 1,200 – Q 3,500
            </p>
            <p className="text-sm text-neutral-500 mt-1">/ mes</p>
            <p className="text-xs text-neutral-400 mt-1">
              Estimación basada en tiendas similares en tu región
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { emoji: '👀', label: '120 vistas promedio' },
              { emoji: '💬', label: '8 contactos' },
              { emoji: '🛒', label: '2–5 pedidos' },
            ].map((m) => (
              <div key={m.label} className="bg-white rounded-xl py-3 px-2 border border-[#dceeed]">
                <p className="text-lg">{m.emoji}</p>
                <p className="text-xs font-medium text-neutral-700 mt-1 leading-snug">{m.label}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-center text-[#0F3D3A] font-medium bg-white border border-[#c8e6e2] rounded-xl px-4 py-3 leading-relaxed">
            Estás muy cerca de comenzar a vender. Solo falta completar tu verificación.
          </p>
        </CardContent>
      </Card>

      {/* 4. EDUCATIONAL BLOCK */}
      <Card className="bg-[#f0f7f6] border-0 shadow-none">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#0F3D3A]" />
            <p className="text-sm font-semibold text-[#0F3D3A]">
              Cuando tu tienda esté activa podrás:
            </p>
          </div>
          <ul className="space-y-2.5">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-neutral-700">
                <span className="flex-shrink-0">{b.icon}</span>
                {b.text}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 5. SECONDARY CTA */}
      <div className="flex justify-center pb-4">
        <Button
          variant="outline"
          className="rounded-xl text-sm"
          onClick={() => router.push('/seller/account')}
        >
          Ver estado de mi cuenta
        </Button>
      </div>

      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   EMPTY STATE COMPONENT
══════════════════════════════════════════ */

function SellerOrdersEmptyState({ slug }: { slug: string }) {
  const router = useRouter()

  const tips = [
    { icon: <Share2      className="w-4 h-4 text-[#0F3D3A]" />, text: 'Comparte tu tienda con clientes' },
    { icon: <Sparkles    className="w-4 h-4 text-[#0F3D3A]" />, text: 'Publica productos atractivos' },
    { icon: <CheckCircle2 className="w-4 h-4 text-[#0F3D3A]" />, text: 'Mejora fotos y descripciones' },
  ]

  return (
    <Card className="border border-neutral-100 shadow-sm overflow-hidden">
      <div className="h-1 bg-[#0F3D3A]" />
      <CardContent className="p-10 flex flex-col items-center text-center gap-6">

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#f0f7f6] flex items-center justify-center text-3xl select-none">
          📦
        </div>

        {/* Title + context */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-neutral-900">Aún no tienes pedidos</h2>
          <p className="text-sm text-neutral-500 max-w-xs mx-auto leading-relaxed">
            Tu tienda ya está activa. Ahora es momento de comenzar a vender.
          </p>
        </div>

        {/* Action tips */}
        <ul className="w-full max-w-xs space-y-3 text-left">
          {tips.map((t, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-neutral-700">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#f0f7f6] flex items-center justify-center">
                {t.icon}
              </span>
              {t.text}
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Button
            className="flex-1 bg-[#0F3D3A] hover:bg-[#0a2e2c] text-white rounded-xl"
            onClick={() => router.push(slug ? `/tienda/${slug}` : '/')}
          >
            Ver mi tienda
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => router.push('/seller/products/new')}
          >
            Agregar producto
          </Button>
        </div>

        {/* Hint */}
        <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
          Los primeros pedidos suelen llegar en las primeras 24–72 horas tras compartir tu tienda.
        </p>

      </CardContent>
    </Card>
  )
}

/* ══════════════════════════════════════════
   COMING SOON COMPONENT
══════════════════════════════════════════ */

function SellerOrdersComingSoon({ slug }: { slug: string }) {
  const router  = useRouter()
  const [copied, setCopied] = useState(false)

  const storeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tienda/${slug}`
    : `/tienda/${slug}`

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mi tienda en Flowjuyu', url: storeUrl })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(storeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-10 sm:px-6">

      {/* Hero card */}
      <Card className="bg-white border border-neutral-100 shadow-sm overflow-hidden">
        <div className="h-1 bg-amber-400" />
        <CardContent className="p-10 flex flex-col items-center text-center gap-5">

          {/* Icon + badge row */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Package className="w-8 h-8 text-amber-500" />
            </div>
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full tracking-wide">
              En desarrollo
            </span>
          </div>

          {/* Copy */}
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-neutral-900">
              Estamos preparando tus pedidos
            </h1>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
              El sistema de pedidos aún está en desarrollo. Muy pronto podrás gestionar tus ventas desde aquí.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs pt-1">
            <Button
              className="flex-1 bg-[#0F3D3A] hover:bg-[#0a2e2c] text-white rounded-xl"
              onClick={() => router.push(slug ? `/tienda/${slug}` : '/')}
            >
              Ver mi tienda
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => router.push('/seller/products/new')}
            >
              Agregar producto
            </Button>
          </div>

          {/* Psychological nudge */}
          <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
            Puedes comenzar a compartir tu tienda desde ahora mientras activamos esta función.
          </p>

        </CardContent>
      </Card>

      {/* Skeleton preview — makes it feel alive */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide pl-1">
          Así se verá tu historial
        </p>
        {[1, 2].map((n) => (
          <Card key={n} className="border border-dashed border-neutral-200 bg-neutral-50/60">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-neutral-200 rounded-full animate-pulse" />
                  <div className="h-4 w-16 bg-neutral-200 rounded-full animate-pulse" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-5 w-20 bg-amber-100 rounded-full animate-pulse ml-auto" />
                  <div className="h-3 w-28 bg-neutral-200 rounded-full animate-pulse ml-auto" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  {[40, 28, 36, 44].map((w) => (
                    <div key={w} className="h-3 rounded-full bg-neutral-200 animate-pulse" style={{ width: `${w * 2}px` }} />
                  ))}
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-12 h-12 rounded-md bg-neutral-200 animate-pulse flex-shrink-0" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3 w-24 bg-neutral-200 rounded-full animate-pulse" />
                    <div className="h-3 w-16 bg-neutral-200 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manual sales section */}
      <Card className="bg-[#f0f7f6] border border-[#c8e6e2] shadow-sm overflow-hidden">
        <div className="h-1 bg-[#0F3D3A]" />
        <CardContent className="p-6 space-y-5">

          {/* Header */}
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#0F3D3A]">
              Comienza a vender desde ahora
            </p>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Mientras activamos el sistema de pedidos, puedes recibir pedidos directamente de tus clientes.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 bg-[#0F3D3A] hover:bg-[#0a2e2c] text-white rounded-xl"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {copied ? '¡Enlace copiado!' : 'Compartir mi tienda'}
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-[#0F3D3A] text-[#0F3D3A] hover:bg-[#f0f7f6]"
              onClick={() =>
                window.open(
                  `https://wa.me/502XXXXXXXX?text=${encodeURIComponent(`Hola, visita mi tienda en Flowjuyu: ${storeUrl}`)}`,
                  '_blank'
                )
              }
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Recibir pedidos por WhatsApp
            </Button>
          </div>

          {/* Social proof nudge */}
          <p className="text-xs text-neutral-400 leading-relaxed">
            Muchos vendedores comienzan así sus primeras ventas.
          </p>

        </CardContent>
      </Card>

      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */

export default function SellerOrdersPage() {
  // account gate
  const [puedePublicar,  setPuedePublicar]  = useState<boolean | null>(null)
  const [accountLoading, setAccountLoading] = useState(true)
  const [slug,           setSlug]           = useState<string>('')

  // filters
  const [q,      setQ]      = useState('')
  const [estado, setEstado] = useState<Pedido['estado'] | 'Todos'>('Todos')
  const [from,   setFrom]   = useState<string>('')
  const [to,     setTo]     = useState<string>('')

  // data
  const [pedidos,  setPedidos]  = useState<Pedido[]>([])
  const [loading,  setLoading]  = useState(false)
  const [page,     setPage]     = useState(1)
  const [pageSize] = useState(8)
  const [hasMore,  setHasMore]  = useState(false)

  // modal
  const [open,    setOpen]    = useState(false)
  const [current, setCurrent] = useState<Pedido | null>(null)

  // quick ranges
  const today       = toYMD(new Date())
  const last7From   = toYMD(new Date(Date.now() - 6  * 24 * 60 * 60 * 1000))
  const last30From  = toYMD(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000))
  const monthStart  = (() => {
    const d = new Date()
    return toYMD(new Date(d.getFullYear(), d.getMonth(), 1))
  })()

  const quickRanges = [
    { key: 'hoy',        label: 'Hoy',            from: today,      to: today },
    { key: 'semana',     label: 'Últimos 7 días',  from: last7From,  to: today },
    { key: 'mes-actual', label: 'Este mes',        from: monthStart, to: today },
    { key: '30',         label: 'Últimos 30 días', from: last30From, to: today },
  ] as const

  /* ── fetch account status ── */
  useEffect(() => {
    async function checkStatus() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await fetch(`${API}/api/seller/account-status`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        })
        if (res.ok) {
          const { data } = await res.json()
          setPuedePublicar(Boolean(data.puede_publicar))
          if (data.slug) setSlug(String(data.slug))
        } else {
          setPuedePublicar(false)
        }
      } catch {
        setPuedePublicar(false)
      } finally {
        setAccountLoading(false)
      }
    }
    checkStatus()
  }, [])

  /* ── fetch orders ── */
  async function cargarPedidos(p = page) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(p))
      params.set('limit', String(pageSize))
      if (q.trim())           params.set('q',      q.trim())
      if (estado !== 'Todos') params.set('estado', estado)
      if (from) params.set('from', from)
      if (to)   params.set('to',   to)

      const res = await fetch(`${API}/api/seller/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        cache: 'no-store',
      })

      if (res.ok) {
        const json = await res.json()
        setPedidos(json.items ?? [])
        setHasMore(!!json.hasMore)
      } else {
        const filtered = filterLocal(mockPedidos, { q, estado, from, to })
        setPedidos(paginate(filtered, p, pageSize))
        setHasMore(p * pageSize < filtered.length)
      }
    } catch {
      const filtered = filterLocal(mockPedidos, { q, estado, from, to })
      setPedidos(paginate(filtered, p, pageSize))
      setHasMore(p * pageSize < filtered.length)
    } finally {
      setLoading(false)
    }
  }

  function filterLocal(
    items: Pedido[],
    f: { q: string; estado: Pedido['estado'] | 'Todos'; from: string; to: string }
  ) {
    return items.filter((it) => {
      const matchQ      = !f.q || it.id.toLowerCase().includes(f.q.toLowerCase()) || it.cliente.toLowerCase().includes(f.q.toLowerCase())
      const matchEstado = f.estado === 'Todos' || it.estado === f.estado
      const t   = new Date(it.fecha).getTime()
      const min = f.from ? new Date(f.from).getTime() : -Infinity
      const max = f.to   ? new Date(f.to).getTime()   :  Infinity
      return matchQ && matchEstado && t >= min && t <= max
    })
  }

  function paginate<T>(arr: T[], p: number, size: number) {
    return arr.slice((p - 1) * size, p * size)
  }

  useEffect(() => { cargarPedidos(1) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPage(1)
    cargarPedidos(1)
  }, [q, estado, from, to]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── CSV export ── */
  function exportCSV() {
    if (!pedidos.length) return
    const DELIM = ';'
    const norm  = (s: string) => String(s).replace(/\r?\n|\r/g, ' ').replace(/"/g, '""').trim()
    const money = (v: number) => v.toFixed(2)
    const mh    = (v: number) => `Q ${v.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const headers = ['ID','Fecha','Estado','Cliente','Total (num)','Total (texto)','Método','Envío','Productos']
    const rows = pedidos.map((p) => {
      const prods = p.productos.map((pp) => `${pp.nombre} x${pp.cantidad ?? 1} (${mh(pp.precio)})`).join(' / ')
      return [p.id, p.fecha, p.estado, p.cliente, money(p.total), mh(p.total), p.metodo, p.envio, prods]
        .map((c) => `"${norm(String(c))}"`)
        .join(DELIM)
    })
    const total  = pedidos.reduce((a, p) => a + p.total, 0)
    const footer = [`""`,`""`,`""`,`"TOTAL"`,`"${money(total)}"`,`"${mh(total)}"`,`""`,`""`,`""`].join(DELIM)
    const csv    = ['\uFEFF' + headers.map((h) => `"${norm(h)}"`).join(DELIM), ...rows, footer].join('\r\n')
    const blob   = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a      = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const totalPagina = useMemo(() => pedidos.reduce((acc, p) => acc + p.total, 0), [pedidos])
  const activeKey   = (() => {
    if (sameRange(from, to, today,      today)) return 'hoy'
    if (sameRange(from, to, last7From,  today)) return 'semana'
    if (sameRange(from, to, monthStart, today)) return 'mes-actual'
    if (sameRange(from, to, last30From, today)) return '30'
    return ''
  })()

  /* ── loading gate ── */
  if (accountLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5ef]">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--seller-muted)]" />
      </div>
    )
  }

  /* ── locked gate ── */
  if (puedePublicar === false) {
    return <SellerOrdersLockedState />
  }

  /* ── coming soon gate ── */
  if (!loading && pedidos.length === 0) {
    return <SellerOrdersComingSoon slug={slug} />
  }

  /* ══════════════════════════════════════════
     NORMAL ORDERS UI
  ══════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--seller-accent)] uppercase">
              Pedidos · Flowjuyu Seller
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--seller-ink)] sm:text-[28px] sm:leading-[1.05]">
              Historial de pedidos
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--seller-muted)]">
              Consulta, filtra y exporta tus pedidos desde una vista más clara y profesional.
            </p>
          </div>
          <SellerPill tone="neutral" className="shrink-0 self-start">{formatQ(totalPagina)} en página</SellerPill>
        </div>

        <SellerSurfaceCard className="overflow-hidden">
          <div className="grid gap-3 p-5 md:grid-cols-4">
          <SellerDetailPanel
            icon={<Package className="h-4 w-4" />}
            title={`${pedidos.length} pedidos`}
            description="Resultados visibles con los filtros actuales."
          />
          <SellerDetailPanel
            icon={<CalendarDays className="h-4 w-4" />}
            title={from || to ? `${from || 'Inicio'} - ${to || 'Hoy'}` : 'Rango completo'}
            description="Periodo aplicado en esta vista."
          />
          <SellerDetailPanel
            icon={<BarChart2 className="h-4 w-4" />}
            title={estado}
            description="Estado filtrado."
          />
          <SellerDetailPanel
            icon={<ShieldCheck className="h-4 w-4" />}
            title={formatQ(totalPagina)}
            description="Monto total de esta página."
          />
        </div>
      </SellerSurfaceCard>

      {/* Quick ranges */}
      <div className="flex flex-wrap gap-2">
        {quickRanges.map((r) => (
          <SellerActionButton
            key={r.key}
            tone={activeKey === r.key ? 'primary' : 'neutral'}
            className="px-3 py-2 text-xs"
            onClick={() => { setFrom(r.from); setTo(r.to); setPage(1) }}
          >
            {r.label}
          </SellerActionButton>
        ))}
        <SellerActionButton
          tone={!from && !to ? 'primary' : 'neutral'}
          className="px-3 py-2 text-xs"
          onClick={() => { setFrom(''); setTo('') }}
        >
          Todos
        </SellerActionButton>
      </div>

      {/* Filters */}
      <SellerSurfaceCard>
        <CardContent className="p-4 grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <Label className="text-xs text-[var(--seller-soft-text)]">Buscar (ID o cliente)</Label>
            <Input className={sellerFieldClassName} placeholder="Ej. 1248 o María" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-[var(--seller-soft-text)]">Estado</Label>
            <select
              className={`${sellerFieldClassName} w-full`}
              value={estado}
              onChange={(e) => setEstado(e.target.value as Pedido['estado'] | 'Todos')}
            >
              <option value="Todos">Todos</option>
              {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-[var(--seller-soft-text)]">Desde</Label>
            <Input className={sellerFieldClassName} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-[var(--seller-soft-text)]">Hasta</Label>
            <Input className={sellerFieldClassName} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="md:col-span-5 flex items-center justify-end gap-2">
            <SellerActionButton tone="neutral" onClick={() => { setQ(''); setEstado('Todos'); setFrom(''); setTo('') }}>
              Limpiar
            </SellerActionButton>
            <SellerActionButton onClick={exportCSV}>Exportar CSV</SellerActionButton>
          </div>
        </CardContent>
      </SellerSurfaceCard>

      {/* List */}
      <section className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
            </CardContent>
          </Card>
        ) : pedidos.length === 0 ? (
          q.trim() || estado !== 'Todos' || from || to ? (
            <SellerSurfaceCard>
              <CardContent className="p-8 text-center text-[var(--seller-muted)]">
                No hay pedidos con esos filtros.
              </CardContent>
            </SellerSurfaceCard>
          ) : (
            <SellerOrdersEmptyState slug={slug} />
          )
        ) : (
          pedidos.map((pedido) => (
            <SellerSurfaceCard key={pedido.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-sm text-[var(--seller-muted)]">
                      Pedido <span className="font-medium">#{pedido.id}</span>
                    </p>
                    <p className="text-base font-semibold text-[var(--seller-ink)]">
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

                <div className="grid grid-cols-1 gap-4 text-sm text-[var(--seller-text)] sm:grid-cols-2">
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
                          className="h-14 w-14 rounded-md border border-[var(--seller-line)] object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium">{producto.nombre}</p>
                          <p className="text-xs text-[var(--seller-muted)]">
                            {producto.cantidad ? `x${producto.cantidad} · ` : ''}
                            {formatQ(producto.precio)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <SellerActionButton tone="neutral" className="px-3 py-2 text-xs" onClick={() => { setCurrent(pedido); setOpen(true) }}>
                    Ver detalle
                  </SellerActionButton>
                </div>
              </CardContent>
            </SellerSurfaceCard>
          ))
        )}
      </section>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <SellerActionButton
          tone="neutral"
          disabled={page === 1 || loading}
          onClick={() => { const p = page - 1; setPage(p); cargarPedidos(p) }}
        >
          ← Anterior
        </SellerActionButton>
        <span className={sellerHelperTextClassName}>Página {page}</span>
        <SellerActionButton
          tone="neutral"
          disabled={!hasMore || loading}
          onClick={() => { const p = page + 1; setPage(p); cargarPedidos(p) }}
        >
          Siguiente →
        </SellerActionButton>
      </div>

      {/* Detail modal */}
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
                <div><div className="font-medium">Cliente</div><div>{current.cliente}</div></div>
                <div><div className="font-medium">Total</div><div>{formatQ(current.total)}</div></div>
                <div><div className="font-medium">Método</div><div>{current.metodo}</div></div>
                <div><div className="font-medium">Envío</div><div className="truncate">{current.envio}</div></div>
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

              <div className="pt-2 border-t space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal aprox.</span>
                  <span className="font-semibold">
                    {formatQ(current.productos.reduce((a, p) => a + p.precio * (p.cantidad ?? 1), 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total pedido</span>
                  <span className="font-semibold">{formatQ(current.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
