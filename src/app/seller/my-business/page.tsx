'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, Pencil, Star, MapPin, Package, TrendingUp } from 'lucide-react'

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
  departamento?: string | null
  municipio?: string | null
  rating_avg?: number | null
  rating_count?: number | null
  estado_validacion?: string | null
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
        <p className="text-muted-foreground">Cargando mi tienda…</p>
      </main>
    )
  }

  if (!perfil) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          No se encontró información del negocio.
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-10 space-y-12 max-w-6xl mx-auto">

      {/* HERO */}
      <Card className="border shadow-sm bg-white">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-center">

            <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-muted border shrink-0">
              {perfil.logo ? (
                <Image
                  src={perfil.logo}
                  alt={perfil.nombre_comercio}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                  Sin logo
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">

              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">
                  {perfil.nombre_comercio}
                </h1>

                <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                  Negocio activo
                </span>
              </div>

              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {[perfil.municipio, perfil.departamento]
                  .filter(Boolean)
                  .join(', ')}
              </div>

              <div className="flex items-center gap-4 text-sm pt-4 border-t">

                <div>
                  <p className="text-xs text-muted-foreground">Productos activos</p>
                  <p className="font-semibold">{productos.length}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Visitas totales</p>
                  <p className="font-semibold">
                    {(analytics?.totalProductViews || 0) +
                      (analytics?.totalProfileViews || 0)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Visitas este mes</p>
                  <p className="font-semibold">{visitasMes}</p>
                </div>

                {productoTop && (
                  <div>
                    <p className="text-xs text-muted-foreground">Producto más visto</p>
                    <p className="font-semibold text-amber-600">
                      {productoTop.nombre}
                    </p>
                  </div>
                )}

              </div>

            </div>

            <div className="flex flex-col gap-2">
              <Link href="/seller/profile">
                <Button variant="outline" className="gap-2">
                  <Pencil className="w-4 h-4" />
                  Editar perfil
                </Button>
              </Link>

              <Link href={`/store/${perfil.user_id}`} className="w-full sm:w-auto">
                <Button className="w-full gap-2">
                  <Eye className="w-4 h-4" />
                  Ver como cliente
                </Button>
              </Link>

            </div>

          </div>
        </CardContent>
      </Card>

      {/* Insight Card */}
      {productoTop && (
        <Card className="border shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <TrendingUp className="w-6 h-6 text-amber-500" />
            <p className="text-sm">
              <span className="font-medium">{productoTop.nombre}</span> es tu producto más visto actualmente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* PRODUCTOS DESTACADOS */}
      {productos.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
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
            {productos.slice(0, 3).map((producto) => (
              <Card
                key={producto.id}
                className="border shadow-sm hover:shadow-md transition"
              >
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
                      <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-medium">
                      {producto.nombre}
                    </p>
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

    </main>
  )
}
