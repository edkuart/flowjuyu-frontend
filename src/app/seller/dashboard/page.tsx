"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Package,
  Truck,
  PlusCircle,
  Bell,
} from "lucide-react"
import Link from "next/link"

export default function SellerDashboardPage() {
  return (
    <main className="min-h-screen px-6 py-10 space-y-10 bg-gradient-to-b from-white to-slate-50">
      {/* 🏪 Bienvenida */}
      <section>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
          Panel del Vendedor
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Visualiza tus métricas principales y gestiona tus productos, pedidos y stock.
        </p>
      </section>

      {/* 📊 Métricas principales */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-muted/30 shadow-sm hover:shadow-md transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos del mes</p>
                <h2 className="text-2xl font-bold text-neutral-900">32</h2>
              </div>
              <ShoppingCart className="w-7 h-7 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-muted/30 shadow-sm hover:shadow-md transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos acumulados</p>
                <h2 className="text-2xl font-bold text-neutral-900">Q 4,560.00</h2>
              </div>
              {/* 💰 Se quitó el icono de dólar */}
              <span className="text-indigo-600 font-semibold text-lg">Q</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-muted/30 shadow-sm hover:shadow-md transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Productos publicados</p>
                <h2 className="text-2xl font-bold text-neutral-900">17</h2>
              </div>
              <Package className="w-7 h-7 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-muted/30 shadow-sm hover:shadow-md transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos pendientes</p>
                <h2 className="text-2xl font-bold text-neutral-900">5</h2>
              </div>
              <Truck className="w-7 h-7 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ⚡ Acciones rápidas */}
      <section>
        <h3 className="text-lg font-semibold mb-4 text-neutral-800">Acciones rápidas</h3>
        <div className="flex gap-4 flex-wrap">
          <Link href="/seller/products/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow">
              <PlusCircle className="w-4 h-4 mr-2" />
              Publicar producto
            </Button>
          </Link>
          <Link href="/seller/products">
            <Button variant="outline" className="hover:bg-slate-100">
              Gestionar productos
            </Button>
          </Link>
          <Link href="/seller/orders">
            <Button variant="outline" className="hover:bg-slate-100">
              Revisar pedidos
            </Button>
          </Link>
        </div>
      </section>

      {/* 🔔 Consejos / Notificaciones */}
      <section>
        <Card className="border border-muted/30 shadow-sm hover:shadow-md transition">
          <CardContent className="p-5 flex items-start gap-3">
            <Bell className="w-5 h-5 text-indigo-600 mt-1" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                💡 Mantené actualizado tu stock para evitar cancelaciones.
              </p>
              <p className="text-sm text-muted-foreground">
                📸 Tip: Las fotos claras y bien iluminadas pueden aumentar tus ventas hasta un 40%.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
