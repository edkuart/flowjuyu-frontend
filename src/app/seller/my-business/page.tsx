'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, Pencil, Star, MapPin, Package } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import SellerStoreStats, {
  SellerStats,
} from '@/components/seller/SellerStoreStats'
import SellerStoreProducts from '@/components/seller/SellerStoreProducts'

import { apiGetVendedorPerfil } from '@/services/vendedorPerfil'
import { fetchMyProductsPreview } from '@/services/sellerProducts'

import BusinessStatusText from '@/components/seller/BusinessStatusText'

type SellerProfile = {
  id: number
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

export default function MyBusinessPage() {
  const [loading, setLoading] = useState(true)
  const [perfil, setPerfil] = useState<SellerProfile | null>(null)
  const [productos, setProductos] = useState<ProductoPreview[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const profileRes = await apiGetVendedorPerfil()

        if (profileRes.ok && profileRes.perfil) {
          setPerfil(profileRes.perfil)
        }

        const products = await fetchMyProductsPreview()
        setProductos(products)
      } catch (err) {
        console.error('Error cargando negocio:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

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

  const stats: SellerStats = {
    productosActivos: productos.length,
    visitasMes: 0,
    ratingAvg: perfil.rating_avg ?? 0,
  }

  return (
    <main className="min-h-screen px-4 py-10 space-y-12 max-w-6xl mx-auto">

      {/* HERO CARD */}
      <Card className="border shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-center">

            {/* LOGO */}
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

            {/* INFO CENTRAL */}
            <div className="flex-1 space-y-4">

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold">
                  {perfil.nombre_comercio}
                </h1>

                <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                  Negocio activo
                </span>
              </div>

              {(perfil.municipio || perfil.departamento) && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {[perfil.municipio, perfil.departamento]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="font-medium">
                  {perfil.rating_avg?.toFixed(1) ?? '—'}
                </span>
                <span className="text-muted-foreground">
                  ({perfil.rating_count ?? 0} reseñas)
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
                <span>Productos publicados: {productos.length}</span>
                <span>Desde 2024</span>
              </div>

              {/* NUEVO BLOQUE INTELIGENTE */}
              <BusinessStatusText
                estadoValidacion={perfil.estado_validacion ?? undefined}
                productosActivos={productos.length}
                stockBajo={0}
                ratingCount={perfil.rating_count ?? 0}
              />

            </div>

            {/* ACCIONES */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto">

              <Link href="/seller/profile" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full gap-2">
                  <Pencil className="w-4 h-4" />
                  Editar perfil
                </Button>
              </Link>

              <Link href={`/store/${perfil.id}`} className="w-full sm:w-auto">
                <Button className="w-full gap-2">
                  <Eye className="w-4 h-4" />
                  Ver como cliente
                </Button>
              </Link>

            </div>

          </div>
        </CardContent>
      </Card>

      {/* STATS */}
      <SellerStoreStats stats={stats} />

      {/* PRODUCTOS */}
      {productos.length > 0 ? (
        <SellerStoreProducts productos={productos} />
      ) : (
        <Card className="border shadow-sm">
          <CardContent className="p-10 text-center space-y-4">
            <Package className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Aún no has publicado productos.
            </p>
            <Link href="/seller/products/new">
              <Button>
                Agregar primer producto
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

    </main>
  )
}
