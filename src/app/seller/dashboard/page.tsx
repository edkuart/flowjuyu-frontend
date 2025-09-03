import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, Package, DollarSign } from 'lucide-react'

export default function SellerDashboardPage() {
  return (
    <main className="min-h-screen px-4 py-8 space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Bienvenido al Panel del Vendedor</h1>
        <p className="text-muted-foreground text-sm">
          Consulta métricas generales de tu tienda y gestiona tus productos y pedidos.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        <Card className="border border-muted/30 shadow-sm">
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

        <Card className="border border-muted/30 shadow-sm">
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

        <Card className="border border-muted/30 shadow-sm">
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
      </section>
    </main>
  )
}
