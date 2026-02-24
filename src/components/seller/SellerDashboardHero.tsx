'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Eye, Star } from 'lucide-react'

type Props = {
  nombreComercio: string
  descripcion?: string
  logo?: string | null
  visitasMes?: number
  ratingAvg?: number
  ratingCount?: number
}

export default function SellerDashboardHero({
  nombreComercio,
  descripcion,
  logo,
  visitasMes = 0,
  ratingAvg = 0,
  ratingCount = 0,
}: Props) {
  return (
    <section className="w-full bg-[#f7f2e8]">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-6 items-start justify-between">
        <div className="flex gap-4 items-start">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted border">
            {logo ? (
              <Image src={logo} alt={nombreComercio} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                Mi tienda
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{nombreComercio}</h1>
            <p className="text-sm text-muted-foreground">Perfil visible para compradores</p>

            {descripcion ? (
              <p className="text-sm text-neutral-700 max-w-xl">{descripcion}</p>
            ) : (
              <p className="text-sm text-neutral-600 max-w-xl">
                Agrega una descripción para que los compradores entiendan tu estilo.
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
              <span className="inline-flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {visitasMes} visitas este mes
              </span>
              <span className="inline-flex items-center gap-2">
                <Star className="w-4 h-4" />
                {ratingAvg.toFixed(1)} ({ratingCount} reseñas)
              </span>
            </div>

            <div className="pt-4">
              <Link href="/seller/my-business">
                <Button className="rounded-full">Ir a Mi negocio</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[320px] bg-white border rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-muted-foreground mb-2">Tu tienda ya está visible</p>
          <p className="font-semibold">
            Sigue mejorando tu perfil para atraer más visitas
          </p>
        </div>
      </div>
    </section>
  )
}
