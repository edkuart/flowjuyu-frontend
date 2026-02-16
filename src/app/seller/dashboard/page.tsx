// src/app/seller/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Boxes, PlusCircle, Eye } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchSellerDashboard } from '@/services/sellerDashboard'

export default function SellerDashboardPage() {
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    stock_bajo: 0,
  })

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSellerDashboard()

        setStats({
          total: data.productoStats?.total ?? 0,
          activos: data.productoStats?.activos ?? 0,
          inactivos: data.productoStats?.inactivos ?? 0,
          stock_bajo: data.productoStats?.stock_bajo ?? 0,
        })
      } catch (e) {
        console.error('❌ Error cargando dashboard:', e)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando panel…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-10 space-y-10 max-w-6xl mx-auto">

      {/* HEADER */}
      <section>
        <h1 className="text-3xl font-bold">Panel del vendedor</h1>
        <p className="text-muted-foreground">
          Accesos rápidos y estado general de tu tienda
        </p>
      </section>

      {/* STATS */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total productos" value={stats.total} />
        <Stat label="Activos" value={stats.activos} />
        <Stat label="Inactivos" value={stats.inactivos} />
        <Stat label="Stock bajo" value={stats.stock_bajo} />
      </section>

      {/* ACCIONES */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Action
          href="/seller/my-business"
          icon={<Eye />}
          text="Ver mi negocio público"
        />
        <Action
          href="/seller/products"
          icon={<Boxes />}
          text="Gestionar productos"
        />
        <Action
          href="/seller/products/new"
          icon={<PlusCircle />}
          text="Agregar producto"
        />
      </section>

    </main>
  )
}

/* ---------------- */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

function Action({ href, icon, text }: any) {
  return (
    <Link href={href}>
      <Button variant="secondary" className="w-full justify-start gap-2">
        {icon}
        {text}
      </Button>
    </Link>
  )
}
