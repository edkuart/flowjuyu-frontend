import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Trash2, Heart, ShoppingCart, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function FavoritosPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return redirect('/login')
  }

  const favoritos = [
    {
      id: 1,
      nombre: 'Blusa típica bordada',
      imagen: '/productos/blusa1.jpg',
      precio: 'Q 120.00',
      precioOriginal: 'Q 145.00',
      stock: true,
    },
    {
      id: 2,
      nombre: 'Faja multicolor artesanal',
      imagen: '/productos/faja1.jpg',
      precio: 'Q 90.00',
      stock: false,
    },
  ]

  return (
    <main className="min-h-screen bg-white px-4 py-10 md:py-16">
      <section className="max-w-6xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900">Favoritos</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Consulta y gestiona tus productos guardados para futuras compras.
          </p>
        </div>

        {favoritos.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            <Heart className="mx-auto w-8 h-8 mb-2 text-primary" />
            <p className="text-sm">Aún no tienes productos favoritos guardados.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {favoritos.map((producto) => (
              <Card
                key={producto.id}
                className="group rounded-2xl border border-muted/30 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={producto.imagen}
                    alt={producto.nombre}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <CardContent className="p-4 space-y-2">
                  <h2 className="font-medium text-base text-neutral-900 line-clamp-2">
                    {producto.nombre}
                  </h2>
                  <div className="flex items-center gap-2">
                    {producto.precioOriginal && (
                      <span className="text-sm text-muted-foreground line-through">
                        {producto.precioOriginal}
                      </span>
                    )}
                    <span className="text-sm text-foreground font-semibold">{producto.precio}</span>
                  </div>
                  <div>
                    {producto.stock ? (
                      <Badge variant="outline" className="text-green-600 border-green-500 text-xs">
                        En stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-500 text-xs">
                        Agotado
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      aria-label="Eliminar de favoritos"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                    <Button size="sm" className="gap-1" disabled={!producto.stock}>
                      <ShoppingCart className="w-4 h-4" /> Comprar ahora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
