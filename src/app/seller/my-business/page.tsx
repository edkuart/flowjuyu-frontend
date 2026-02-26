'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, Pencil, MapPin } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { apiGetVendedorPerfil } from '@/services/vendedorPerfil'
import { fetchMyProductsPreview } from '@/services/sellerProducts'

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
  plan?: "free" | "founder"
  plan_activo?: boolean
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

export default function MyBusinessPage() {
  const [loading, setLoading] = useState(true)
  const [perfil, setPerfil] = useState<SellerProfile | null>(null)
  const [productos, setProductos] = useState<ProductoPreview[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [daily, setDaily] = useState<DailyAnalytics[]>([])
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [deletingBanner, setDeletingBanner] = useState(false)

  const [mensaje, setMensaje] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  /* ================================
     LOAD DATA
  ================================= */
  useEffect(() => {
    async function loadData() {
      try {
        const profileRes = await apiGetVendedorPerfil()
        if (profileRes.ok && profileRes.perfil) {
          setPerfil(profileRes.perfil)
        }

        const products = await fetchMyProductsPreview()
        setProductos(products)

        const token = localStorage.getItem('token')

        const analyticsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/seller/analytics`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const analyticsJson = await analyticsRes.json()
        setAnalytics(analyticsJson)

        const dailyRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/seller/analytics/daily`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

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

  /* ================================
     SYNC MENSAJE
  ================================= */
  useEffect(() => {
    setMensaje(perfil?.mensaje_destacado || "")
  }, [perfil])

  /* ================================
     SAVE MENSAJE
  ================================= */
  async function handleGuardarMensaje() {
    try {
      setSaving(true)

      const token = localStorage.getItem("token")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/seller/customization`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mensaje_destacado: mensaje,
          }),
        }
      )

      if (!res.ok) {
        alert("Error guardando mensaje")
        return
      }

      alert("Mensaje guardado correctamente")

    } catch (err) {
      console.error(err)
      alert("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  /* ================================
     UPLOAD BANNER
  ================================= */
  async function handleBannerSelect(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)

    setBannerPreview(previewUrl)
    setBannerFile(file)
  }

  async function confirmBannerUpload() {
    if (!bannerFile) return

    try {
      setUploadingBanner(true)

      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("banner", bannerFile)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/seller/banner`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      )

      const data = await res.json()

      if (!res.ok) {
        alert("Error subiendo banner")
        return
      }

      setPerfil(prev =>
        prev ? { ...prev, banner_url: data.banner_url } : prev
      )

      setBannerPreview(null)
      setBannerFile(null)

    } catch (err) {
      console.error(err)
      alert("Error subiendo banner")
    } finally {
      setUploadingBanner(false)
    }
  }

  async function cancelBannerUpload() {
    setBannerPreview(null)
    setBannerFile(null)
  }

  async function handleDeleteBanner() {
    const confirmDelete = window.confirm(
      "¿Seguro que deseas eliminar el banner?"
    )
    if (!confirmDelete) return

    try {
      setDeletingBanner(true)

      const token = localStorage.getItem("token")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/seller/banner`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      if (!res.ok) {
        alert(data?.message || "Error eliminando banner")
        return
      }

      // 🔥 Limpia estado local
      setPerfil(prev =>
        prev ? { ...prev, banner_url: null } : prev
      )

      setBannerPreview(null)
      setBannerFile(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

    } catch (err) {
      console.error("Error eliminando banner:", err)
      alert("Error eliminando banner")
    } finally {
      setDeletingBanner(false)
    }
  }

  /* ================================
     MÉTRICAS
  ================================= */
  const visitasMes = useMemo(() => {
    return daily.reduce(
      (acc, d) => acc + d.product_views + d.profile_views,
      0
    )
  }, [daily])

  const productoTop = analytics?.topProducts?.[0]

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Cargando mi tienda…
      </main>
    )
  }

  if (!perfil) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        No se encontró información del negocio.
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-10 space-y-12 max-w-6xl mx-auto">

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl text-white min-h-[340px] md:min-h-[260px] md:aspect-[16/6]">
        {/* Fondo dinámico */}
        {bannerPreview ? (
          <div className="absolute inset-0">
            <Image
              src={bannerPreview}
              alt="Preview banner"
              fill
              className="object-cover blur-[2px]"
            />
            <div className="absolute inset-0 bg-emerald-900/60 mix-blend-multiply pointer-events-none" />
          </div>
        ) : perfil.banner_url ? (
          <div className="absolute inset-0">
            <Image
              src={perfil.banner_url}
              alt="Banner tienda"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-emerald-900/60 mix-blend-multiply pointer-events-none" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700" />
        )}

        {/* Contenido */}
        <div className="relative p-6 md:p-10 flex flex-col md:flex-row gap-6 md:gap-10 md:items-center">

          {/* LOGO */}
          <div className="relative w-24 h-24 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white shadow-2xl shrink-0 mx-auto md:mx-0">
            {perfil.logo ? (
              <Image
                src={perfil.logo}
                alt={perfil.nombre_comercio}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/20 text-sm">
                Sin logo
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="flex-1 space-y-5 text-center md:text-left">

            <h1 className="text-3xl md:text-4xl font-bold">
              {perfil.nombre_comercio}
            </h1>

            <div className="flex items-center gap-2 text-sm opacity-90">
              <MapPin className="w-4 h-4" />
              {[perfil.municipio, perfil.departamento]
                .filter(Boolean)
                .join(', ')}
            </div>

            {perfil.mensaje_destacado && (
              <p className="max-w-2xl text-sm md:text-base opacity-90 leading-relaxed">
                {perfil.mensaje_destacado}
              </p>
            )}

            {/* MÉTRICAS */}
            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-8 pt-4 border-t border-white/20 text-sm">

              <div>
                <p className="opacity-70">Productos activos</p>
                <p className="text-xl font-semibold">{productos.length}</p>
              </div>

              <div>
                <p className="opacity-70">Visitas totales</p>
                <p className="text-xl font-semibold">
                  {(analytics?.totalProductViews || 0) +
                    (analytics?.totalProfileViews || 0)}
                </p>
              </div>

              <div>
                <p className="opacity-70">Visitas este mes</p>
                <p className="text-xl font-semibold">{visitasMes}</p>
              </div>

              {productoTop && (
                <div className="bg-amber-400/10 border border-amber-300/30 px-4 py-2 rounded-xl">
                  <p className="opacity-70 text-xs">Producto más visto</p>
                  <p className="text-amber-300 font-semibold">
                    {productoTop.nombre}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* ACCIONES */}
          <div className="flex flex-col gap-3 w-full md:w-auto">

          <Link href="/seller/profile" className="w-full md:w-auto">
            <Button variant="secondary" className="w-full md:w-auto">
              <Pencil className="w-4 h-4 mr-2" />
              Editar perfil
            </Button>
          </Link>

          <Link href={`/store/${perfil.user_id}`} className="w-full md:w-auto">
            <Button className="bg-white text-emerald-900 hover:bg-neutral-100 w-full md:w-auto">
              <Eye className="w-4 h-4 mr-2" />
              Ver tienda pública
            </Button>
          </Link>

          <Button
            variant="secondary"
            disabled={uploadingBanner}
            onClick={() => fileInputRef.current?.click()}
            className="w-full md:w-auto"
          >
            {uploadingBanner ? "Subiendo..." : "Cambiar banner"}
          </Button>

          {perfil.banner_url && !bannerPreview && (
            <Button
              variant="outline"
              onClick={handleDeleteBanner}
              disabled={deletingBanner}
              className="w-full md:w-auto text-red-600 border-red-300 hover:bg-red-50"
            >
              {deletingBanner ? "Eliminando..." : "Eliminar banner"}
            </Button>
          )}

          {bannerPreview && (
            <div className="flex gap-2 w-full">
              <Button
                onClick={confirmBannerUpload}
                disabled={uploadingBanner}
                className="flex-1 bg-white text-emerald-900"
              >
                Confirmar
              </Button>

              <Button
                variant="outline"
                onClick={cancelBannerUpload}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          )}

        </div>

        </div>
      </div>

      {/* INPUT OCULTO */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleBannerSelect}
      />

      {/* MENSAJE */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            Mensaje público de tu tienda
          </h2>

          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="w-full border rounded-lg p-3 text-sm resize-none"
            rows={4}
          />

          <Button onClick={handleGuardarMensaje} disabled={saving}>
            {saving ? "Guardando..." : "Guardar mensaje"}
          </Button>
        </CardContent>
      </Card>

      {/* PRODUCTOS */}
      {productos.length > 0 && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Productos destacados
            </h2>

            <Link href="/seller/products">
              <Button variant="outline">
                Gestionar productos
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.slice(0, 3).map(producto => (
              <Card key={producto.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-muted">
                    {producto.imagen_url ? (
                      <Image
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-medium">{producto.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      Q {producto.precio.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {perfil?.plan === "free" && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mt-10 flex flex-col md:flex-row items-center justify-between gap-6">

          <div>
            <h3 className="font-semibold text-amber-800 text-lg">
              Activa el plan Founder
            </h3>
            <p className="text-sm text-amber-700 mt-2">
              Habilita contacto directo por WhatsApp, mayor visibilidad y distintivo premium.
            </p>
          </div>

          <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-6 py-3">
            Conocer plan Founder
          </Button>

        </div>
      )}

    </main>
  )
}