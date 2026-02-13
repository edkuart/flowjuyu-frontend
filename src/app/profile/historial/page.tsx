import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays } from 'lucide-react'
import Image from 'next/image'

export default async function HistorialPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return redirect('/login')
  }

  const pedidosMock = [
    {
      id: '1248',
      estado: 'En camino',
      fecha: '13 mayo 2024',
      total: 'Q 395.00',
      metodo: 'Tarjeta crédito',
      direccion: 'Zona 3, Quetzaltenango',
      productos: [
        {
          nombre: 'Blusa bordada típica',
          imagen: '/productos/blusa1.jpg',
          cantidad: 1,
          precio: 'Q 120.00',
        },
        {
          nombre: 'Cinta tradicional',
          imagen: '/productos/cinta1.jpg',
          cantidad: 1,
          precio: 'Q 35.00',
        },
        {
          nombre: 'Faja maya multicolor',
          imagen: '/productos/faja1.jpg',
          cantidad: 1,
          precio: 'Q 95.00',
        },
        {
          nombre: 'Bolsa artesanal pequeña',
          imagen: '/productos/bolsa1.jpg',
          cantidad: 1,
          precio: 'Q 145.00',
        },
      ],
    },
  ]

  return (
    <main className="min-h-screen bg-white px-4 py-10 md:py-16">
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900">Historial de pedidos</h1>
          <p className="text-muted-foreground mt-2">Consulta tus pedidos anteriores y su estado</p>
        </div>

        <Separator />

        <div className="space-y-6">
          {pedidosMock.map((pedido) => (
            <Card key={pedido.id} className="shadow-sm border border-muted/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Pedido #{pedido.id}</p>
                    <h2 className="text-lg font-semibold text-neutral-900">
                      {pedido.productos.length} artículo{pedido.productos.length > 1 && 's'}
                    </h2>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-500">
                      {pedido.estado}
                    </Badge>
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                      <CalendarDays className="w-4 h-4" /> {pedido.fecha}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pedido.productos.map((producto, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded overflow-hidden border">
                        <Image
                          src={producto.imagen}
                          alt={producto.nombre}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-neutral-900">{producto.nombre}</p>
                        <p className="text-muted-foreground">Cantidad: {producto.cantidad}</p>
                        <p className="text-muted-foreground">Precio: {producto.precio}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground space-y-1 pt-2">
                  <p>Total: <span className="text-foreground font-medium">{pedido.total}</span></p>
                  <p>Método: {pedido.metodo}</p>
                  <p>Envío a: {pedido.direccion}</p>
                </div>

                <div className="pt-4 text-right">
                  <Button size="sm" variant="secondary">Ver detalle</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}