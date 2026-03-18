'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Eye,
  Pencil,
  MapPin,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  Users,
  Package,
  Star,
  ImageIcon,
  Camera,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

import { apiGetVendedorPerfil } from '@/services/vendedorPerfil'
import { fetchMyProductsPreview } from '@/services/sellerProducts'

/* =========================================================
   TYPES
========================================================= */

type SellerProfile = {
  id: number
  user_id: number
  nombre_comercio: string
  descripcion?: string | null
  logo?: string | null
  banner_url?: string | null
  departamento?: string | null
  municipio?: string | null
  mensaje_destacado?: string | null
  plan?: 'free' | 'founder'
  plan_activo?: boolean
  whatsapp_numero?: string | null
  identidad_tags?: string[] | null
  estado_validacion?: 'pendiente' | 'aprobado' | 'rechazado' | null
}

type ProductoPreview = {
  id: string
  nombre: string
  precio: number
  imagen_url?: string | null
}

type AnalyticsResponse = {
  totalProductViews: number
  totalProfileViews: number
  topProducts: { id: string; nombre: string; total_views: number }[]
}

type DailyAnalytics = {
  date: string
  product_views: number
  profile_views: number
}

/* =========================================================
   PRODUCT CARD (vitrina)
========================================================= */

function StoreProductCard({ p }: { p: ProductoPreview }) {
  return (
    <Link href={`/product/${p.id}`}>
      <div className="group relative bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
        <div className="relative w-full aspect-[3/4] bg-neutral-50 overflow-hidden">
          {p.imagen_url ? (
            <Image
              src={p.imagen_url}
              alt={p.nombre}
              fill
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-neutral-300">
              <ImageIcon className="w-8 h-8" />
              <span className="text-xs">Sin imagen</span>
            </div>
          )}

          {/* Artesanal badge */}
          <div className="absolute top-2 left-2">
            <span className="bg-white/90 backdrop-blur-sm text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200 shadow-sm">
              Artesanal
            </span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[#0F3D3A]/0 group-hover:bg-[#0F3D3A]/10 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <span className="bg-[#0F3D3A] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
              Ver producto
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div className="p-3 space-y-0.5">
          <h3 className="font-semibold text-neutral-800 text-sm leading-snug line-clamp-2 group-hover:text-[#0F3D3A] transition-colors">
            {p.nombre}
          </h3>
          <p className="font-black text-[#0F3D3A] text-base tracking-tight">
            Q{p.precio.toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  )
}

/* =========================================================
   STAT TILE
========================================================= */

function StatTile({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div
      className={`flex flex-col gap-1 px-4 py-3 rounded-2xl ${
        highlight
          ? 'bg-amber-400/15 border border-amber-300/30'
          : 'bg-white/10'
      }`}
    >
      <div className="flex items-center gap-1.5 opacity-70">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-xl font-bold ${highlight ? 'text-amber-300' : ''}`}>
        {value}
      </p>
    </div>
  )
}

/* =========================================================
   PAGE
========================================================= */

export default function MyBusinessPage() {
  const [loading, setLoading]           = useState(true)
  const [perfil, setPerfil]             = useState<SellerProfile | null>(null)
  const [productos, setProductos]       = useState<ProductoPreview[]>([])
  const [analytics, setAnalytics]       = useState<AnalyticsResponse | null>(null)
  const [daily, setDaily]               = useState<DailyAnalytics[]>([])
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [bannerFile, setBannerFile]     = useState<File | null>(null)
  const fileInputRef                    = useRef<HTMLInputElement | null>(null)
  const [deletingBanner, setDeletingBanner] = useState(false)
  const [mensaje, setMensaje]           = useState('')
  const [saving, setSaving]             = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  /* ── Load ── */
  useEffect(() => {
    async function loadData() {
      try {
        const profileRes = await apiGetVendedorPerfil()
        if (profileRes.ok && profileRes.perfil) {
          setPerfil(profileRes.perfil as unknown as SellerProfile)
        }

        const products = await fetchMyProductsPreview()
        setProductos(products)

        const token = localStorage.getItem('token')

        const [analyticsRes, dailyRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/seller/analytics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/seller/analytics/daily`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const analyticsJson = await analyticsRes.json()
        setAnalytics(analyticsJson)

        const dailyJson = await dailyRes.json()
        setDaily(dailyJson.data || [])
      } catch (err) {
        console.error('Error cargando negocio:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    setMensaje(perfil?.mensaje_destacado || '')
  }, [perfil])

  /* ── Save mensaje ── */
  async function handleGuardarMensaje() {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/seller/customization`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mensaje_destacado: mensaje }),
        }
      )
      if (!res.ok) { alert('Error guardando mensaje'); return }
      setPerfil(prev => prev ? { ...prev, mensaje_destacado: mensaje } : prev)
      alert('Mensaje guardado correctamente')
    } catch (err) {
      console.error(err)
      alert('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  /* ── Banner ── */
  function handleBannerSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerPreview(URL.createObjectURL(file))
    setBannerFile(file)
  }

  async function confirmBannerUpload() {
    if (!bannerFile) return
    try {
      setUploadingBanner(true)
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('banner', bannerFile)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/seller/banner`,
        { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: formData }
      )
      const data = await res.json()
      if (!res.ok) { alert('Error subiendo banner'); return }
      setPerfil(prev => prev ? { ...prev, banner_url: data.banner_url } : prev)
      setBannerPreview(null)
      setBannerFile(null)
    } catch (err) {
      console.error(err)
      alert('Error subiendo banner')
    } finally {
      setUploadingBanner(false)
    }
  }

  async function handleDeleteBanner() {
    if (!window.confirm('¿Seguro que deseas eliminar el banner?')) return
    try {
      setDeletingBanner(true)
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/seller/banner`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (!res.ok) { alert(data?.message || 'Error eliminando banner'); return }
      setPerfil(prev => prev ? { ...prev, banner_url: null } : prev)
      setBannerPreview(null)
      setBannerFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error('Error eliminando banner:', err)
      alert('Error eliminando banner')
    } finally {
      setDeletingBanner(false)
    }
  }

  /* ── Computed ── */
  const visitasMes = useMemo(
    () => daily.reduce((acc, d) => acc + d.product_views + d.profile_views, 0),
    [daily]
  )
  const totalVisitas =
    (analytics?.totalProductViews || 0) + (analytics?.totalProfileViews || 0)
  const productoTop = analytics?.topProducts?.[0]

  const showWhatsapp =
    perfil?.plan === 'founder' &&
    perfil?.plan_activo === true &&
    !!perfil?.whatsapp_numero

  /* ── Loading / error ── */
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-neutral-500">
        Cargando tu tienda…
      </main>
    )
  }

  if (!perfil) {
    return (
      <main className="min-h-screen flex items-center justify-center text-neutral-500">
        No se encontró información del negocio.
      </main>
    )
  }

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* ══════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-[32px] text-white shadow-xl">

          {/* Background */}
          {bannerPreview ? (
            <>
              <div className="absolute inset-0">
                <Image src={bannerPreview} alt="Preview" fill className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-emerald-950/70 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-900/50 to-transparent" />
            </>
          ) : perfil.banner_url ? (
            <>
              <div className="absolute inset-0">
                <Image src={perfil.banner_url} alt="Banner" fill className="object-cover" priority />
              </div>
              <div className="absolute inset-0 bg-emerald-950/65 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-900/50 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800" />
          )}

          {/* Content */}
          <div className="relative px-6 py-8 md:px-10 md:py-10">
            <div className="flex flex-col md:flex-row gap-7 md:gap-10">

              {/* Logo */}
              <div className="relative w-24 h-24 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-white/80 shadow-2xl shrink-0 mx-auto md:mx-0 bg-white">
                {perfil.logo ? (
                  <Image
                    src={perfil.logo}
                    alt={perfil.nombre_comercio}
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/10 text-xs opacity-60">
                    Sin logo
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-4 text-center md:text-left">

                {/* Name + badges */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                    {perfil.estado_validacion === 'aprobado' && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-blue-600/80 backdrop-blur text-white text-[10px] font-bold rounded-full border border-blue-400/30">
                        ✔ Verificado
                      </span>
                    )}
                    {perfil.plan === 'founder' && perfil.plan_activo && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-amber-500/90 text-black text-[10px] font-bold rounded-full">
                        ⭐ Founder
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-white/15 backdrop-blur text-white/80 text-[10px] font-semibold rounded-full border border-white/20">
                      🧵 Hecho a mano
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                    {perfil.nombre_comercio}
                  </h1>

                  {(perfil.municipio || perfil.departamento) && (
                    <p className="flex items-center gap-1.5 text-sm opacity-80 justify-center md:justify-start">
                      <MapPin className="w-3.5 h-3.5" />
                      {[perfil.municipio, perfil.departamento].filter(Boolean).join(', ')}
                    </p>
                  )}

                  {perfil.descripcion && (
                    <p className="text-sm opacity-80 leading-relaxed max-w-xl line-clamp-2">
                      {perfil.descripcion}
                    </p>
                  )}
                </div>

                {/* Identity tags */}
                {perfil.identidad_tags && perfil.identidad_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {perfil.identidad_tags.slice(0, 4).map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/10 backdrop-blur border border-white/20 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-1">
                  <StatTile icon={Package}    label="Productos activos" value={productos.length} />
                  <StatTile icon={TrendingUp} label="Visitas este mes"   value={visitasMes} />
                  <StatTile icon={Users}      label="Visitas totales"    value={totalVisitas} />
                  {productoTop && (
                    <StatTile icon={Star} label="Producto top" value={productoTop.nombre} highlight />
                  )}
                </div>

                {/* WhatsApp CTA (founder only) */}
                {showWhatsapp && (
                  <div className="pt-1 flex justify-center md:justify-start">
                    <a
                      href={`https://wa.me/${perfil.whatsapp_numero}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contactar por WhatsApp
                    </a>
                    <p className="mt-2 text-xs text-white/50 pl-1 self-end mb-0.5 ml-2">
                      Visible en tu tienda pública
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-row md:flex-col gap-2 flex-wrap justify-center md:justify-start md:w-44 shrink-0">
                <Link href="/seller/profile">
                  <Button
                    variant="secondary"
                    className="w-full bg-white/15 hover:bg-white/25 text-white border-white/20 border backdrop-blur gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar perfil
                  </Button>
                </Link>

                <Link href={`/store/${perfil.user_id}`}>
                  <Button className="w-full bg-white text-emerald-900 hover:bg-neutral-100 gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Ver tienda
                  </Button>
                </Link>

                <Button
                  variant="secondary"
                  disabled={uploadingBanner}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-white/15 hover:bg-white/25 text-white border-white/20 border backdrop-blur gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {uploadingBanner ? 'Subiendo…' : 'Cambiar banner'}
                </Button>

                {perfil.banner_url && !bannerPreview && (
                  <Button
                    variant="ghost"
                    onClick={handleDeleteBanner}
                    disabled={deletingBanner}
                    className="w-full text-red-300 hover:text-red-200 hover:bg-red-900/30 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deletingBanner ? 'Eliminando…' : 'Quitar banner'}
                  </Button>
                )}

                {bannerPreview && (
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={confirmBannerUpload}
                      disabled={uploadingBanner}
                      className="flex-1 bg-white text-emerald-900 text-xs"
                      size="sm"
                    >
                      Confirmar
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => { setBannerPreview(null); setBannerFile(null) }}
                      className="flex-1 text-white/70 text-xs"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleBannerSelect}
        />

        {/* ══════════════════════════════════════════════════
            PRODUCT VITRINA
        ══════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">
                Vista previa
              </p>
              <h2 className="text-xl font-bold text-neutral-900">
                Tu vitrina de productos
              </h2>
            </div>
            <Link href="/seller/products">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
                Gestionar
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {productos.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {productos.map(p => (
                  <StoreProductCard key={p.id} p={p} />
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href={`/store/${perfil.user_id}`}>
                  <Button variant="outline" className="gap-2 rounded-full">
                    <Eye className="w-4 h-4" />
                    Ver tienda pública completa
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-100 py-16 flex flex-col items-center gap-4 text-center">
              <p className="text-4xl opacity-30">🛍</p>
              <p className="text-neutral-500 font-medium">
                Aún no tienes productos activos.
              </p>
              <Link href="/seller/products/new">
                <Button className="bg-[#0F3D3A] hover:bg-[#0d3330] text-white rounded-full gap-2">
                  Agregar primer producto
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════════════
            CUSTOMIZATION
        ══════════════════════════════════════════════════ */}
        <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">
              Personalización
            </p>
            <h2 className="text-lg font-bold text-neutral-900">
              Mensaje público de tu tienda
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Aparece en el hero de tu tienda pública. Cuéntale a los clientes qué te hace único.
            </p>
          </div>

          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            placeholder="Ej: Somos artesanos guatemaltecos con 20 años tejiendo cortes tradicionales con técnicas heredadas de generación en generación…"
            className="w-full border border-neutral-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]/20 focus:border-[#0F3D3A] transition"
            rows={3}
            maxLength={300}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              {mensaje.length}/300 caracteres
            </span>
            <Button
              onClick={handleGuardarMensaje}
              disabled={saving}
              className="bg-[#0F3D3A] hover:bg-[#0d3330] text-white rounded-full px-6"
            >
              {saving ? 'Guardando…' : 'Guardar mensaje'}
            </Button>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FOUNDER UPGRADE
        ══════════════════════════════════════════════════ */}
        {perfil.plan === 'free' && (
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-200/30 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-amber-300/20 rounded-full" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                    Plan Founder
                  </span>
                </div>
                <h3 className="text-xl font-bold text-amber-900">
                  Lleva tu tienda al siguiente nivel
                </h3>
                <ul className="text-sm text-amber-800 space-y-1 mt-2">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    Botón de contacto por WhatsApp en tu tienda
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    Badge Founder + mayor visibilidad en el marketplace
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    Productos destacados en la página principal
                  </li>
                </ul>
              </div>

              <Button className="shrink-0 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all gap-2">
                Conocer plan Founder
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
