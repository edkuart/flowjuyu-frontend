'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Producto = {
  id: string
  nombre: string
  precio: number
  imagen_url?: string | null
}

type Props = {
  productos: Producto[]
}

export default function SellerStoreProducts({ productos }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Productos destacados</h2>

        <Link href="/seller/products">
          <Button variant="outline" size="sm">
            Gestionar productos
          </Button>
        </Link>
      </div>

      {productos.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Aún no tienes productos publicados.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {productos.slice(0, 4).map((p) => (
            <Link key={p.id} href={`/seller/products`}>
              <Card className="hover:shadow-md transition">
                <CardContent className="p-3 space-y-2">
                  <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={p.imagen_url || '/images/placeholder.jpg'}
                      alt={p.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium truncate">{p.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      Q{' '}
                      {Number(p.precio).toLocaleString('es-GT', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
