//src/app/seller/products/page.tsx

"use client"

import { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Pencil,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
  X,
  PackagePlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Swal from "sweetalert2"
import { useRouter } from "next/navigation"

type Producto = {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  stock: number
  activo: boolean
  imagenes?: string[]
  imagen_url?: string | null
}

export default function SellerProductsPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Producto | null>(null)
  const [imgIndex, setImgIndex] = useState(0)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"
  const router = useRouter()

  /* ==============================
     Fetch productos del vendedor
  ============================== */
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const res = await fetch(`${API}/api/seller/products`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Error al cargar productos")

        const data = await res.json()
        setProductos(Array.isArray(data) ? data : data.data || [])
      } catch (error) {
        console.error("❌ Error cargando productos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
  }, [API, router])

  /* ==============================
     Paginación
  ============================== */
  const totalPages = useMemo(
    () => Math.ceil(productos.length / perPage),
    [productos, perPage]
  )

  const currentProducts = useMemo(() => {
    const start = (page - 1) * perPage
    return productos.slice(start, start + perPage)
  }, [productos, page, perPage])

  /* ==============================
     Acciones
  ============================== */
  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
    })

    if (!confirm.isConfirmed) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API}/api/productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error()

      setProductos((prev) => prev.filter((p) => p.id !== id))
      Swal.fire("Eliminado", "Producto eliminado correctamente", "success")
    } catch {
      Swal.fire("Error", "No se pudo eliminar el producto", "error")
    }
  }

  const handleToggleActivo = async (id: string, activo: boolean) => {
    const accion = activo ? "despublicar" : "publicar"
    const confirm = await Swal.fire({
      title: `¿Deseas ${accion} este producto?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
    })

    if (!confirm.isConfirmed) return

    setProcessingId(id)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API}/api/productos/${id}/activo`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activo: !activo }),
      })

      if (!res.ok) throw new Error()

      setProductos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, activo: !p.activo } : p
        )
      )

      Swal.fire("Actualizado", "Estado actualizado", "success")
    } catch {
      Swal.fire("Error", "No se pudo actualizar el estado", "error")
    } finally {
      setProcessingId(null)
    }
  }

  /* ==============================
     Render
  ============================== */
  return (
    <main className="min-h-screen px-4 py-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de productos</h1>
          <p className="text-sm text-muted-foreground">
            Controla qué productos aparecen en tu tienda pública.
          </p>
        </div>

        <Link href="/seller/products/new">
          <Button className="gap-2">
            <PackagePlus className="w-4 h-4" />
            Nuevo producto
          </Button>
        </Link>
      </header>

      {/* Contenido */}
      {loading ? (
        <p className="text-muted-foreground">Cargando productos…</p>
      ) : productos.length === 0 ? (
        <div className="border rounded-lg p-10 text-center space-y-4">
          <p className="text-lg font-medium">
            Aún no has publicado productos
          </p>
          <p className="text-sm text-muted-foreground">
            Empieza agregando tu primer producto para que los compradores puedan verlo.
          </p>
          <Link href="/seller/products/new">
            <Button>Agregar producto</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Tabla */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded overflow-hidden border">
                        <Image
                          src={p.imagen_url || "/images/placeholder.jpg"}
                          alt={p.nombre}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium">{p.nombre}</span>
                    </td>

                    <td className="px-4 py-3">
                      Q {Number(p.precio).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-3">{p.stock}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          p.activo
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.activo ? "Publicado" : "Borrador"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right space-x-2">
                      <Link href={`/seller/products/new?id=${p.id}`}>
                        <Button size="icon" variant="outline">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant={p.activo ? "secondary" : "default"}
                        disabled={processingId === p.id}
                        onClick={() => handleToggleActivo(p.id, p.activo)}
                      >
                        <Power className="w-4 h-4 mr-1" />
                        {p.activo ? "Despublicar" : "Publicar"}
                      </Button>

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-between items-center text-sm">
            <span>
              Página {page} de {totalPages}
            </span>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
