import Image from 'next/image'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const productos = [
  {
    id: 1,
    nombre: 'Blusa típica bordada',
    imagen: '/productos/blusa1.jpg',
    precio: 'Q 120.00',
    stock: 8,
    activo: true,
  },
  {
    id: 2,
    nombre: 'Faja artesanal multicolor',
    imagen: '/productos/faja1.jpg',
    precio: 'Q 90.00',
    stock: 0,
    activo: false,
  },
]

export default function SellerProductsPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis productos</h1>
        <Link href="/seller/products/new">
          <Button className="text-sm">Agregar producto</Button>
        </Link>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm border rounded-md overflow-hidden">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Imagen</th>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Precio</th>
              <th className="text-left px-4 py-3">Stock</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id} className="border-t">
                <td className="px-4 py-2">
                  <div className="relative w-12 h-12 rounded overflow-hidden">
                    <Image
                      src={producto.imagen}
                      alt={producto.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="px-4 py-2">{producto.nombre}</td>
                <td className="px-4 py-2">{producto.precio}</td>
                <td className="px-4 py-2">{producto.stock}</td>
                <td className="px-4 py-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                      producto.activo
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {producto.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <Button variant="outline" size="icon">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
