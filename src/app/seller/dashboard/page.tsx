'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Package, DollarSign, BarChart3 } from 'lucide-react'

export default function SellerDashboardPage() {
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

      {/* boton de reportes */}
        <Link href="/seller/reports">
          <Button className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Reportes
          </Button>
        </Link>
      </section>

      {/* Tarjetas (clicables) */}
      <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        <Link href="/seller/orders" className="group focus:outline-none">
          <Card className="border border-muted/30 shadow-sm transition hover:shadow-md group-focus:ring-2 group-focus:ring-primary">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pedidos del mes</p>
                  <h2 className="text-2xl font-bold text-neutral-900">32</h2>
                </div>
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/seller/reportes" className="group focus:outline-none">
          <Card className="border border-muted/30 shadow-sm transition hover:shadow-md group-focus:ring-2 group-focus:ring-primary">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos acumulados</p>
                  <h2 className="text-2xl font-bold text-neutral-900">Q 4,560.00</h2>
                </div>
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/seller/products" className="group focus:outline-none">
          <Card className="border border-muted/30 shadow-sm transition hover:shadow-md group-focus:ring-2 group-focus:ring-primary">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Productos publicados</p>
                  <h2 className="text-2xl font-bold text-neutral-900">17</h2>
                </div>
                <Package className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>
    </main>
  )
}
