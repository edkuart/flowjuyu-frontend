'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Eye, Package, Star } from 'lucide-react'

export type SellerStats = {
  productosActivos: number
  totalProductos?: number
  visitasMes: number
  ratingAvg: number
}

type Props = {
  stats: SellerStats
}

export default function SellerStoreStats({ stats }: Props) {
  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Productos visibles"
        value={stats.productosActivos}
        icon={<Package className="w-5 h-5" />}
      />

      <StatCard
        label="Visualizaciones este mes"
        value={stats.visitasMes}
        icon={<Eye className="w-5 h-5" />}
      />

      <StatCard
        label="Calificación promedio"
        value={stats.ratingAvg ? stats.ratingAvg.toFixed(1) : '—'}
        icon={<Star className="w-5 h-5" />}
      />
    </section>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
}) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-neutral-600">{icon}</div>
      </CardContent>
    </Card>
  )
}
