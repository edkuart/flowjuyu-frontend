"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Pencil, Trash2, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import Swal from "sweetalert2"

type Producto = {
  id: string
  nombre: string
  precio: number
  stock: number
  activo: boolean
  imagen_url?: string | null
}

export default function SellerProductsPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

  // 🔄 Obtener productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.warn("⚠️ No se encontró token en localStorage")
          setLoading(false)
          return
        }

        const res = await fetch(`${API}/api/seller/productos`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Error al cargar productos")

        const data = await res.json()
        setProductos(data)
      } catch (e) {
        console.error("Error cargando productos:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
  }, [API])

  // 🗑️ Eliminar producto con SweetAlert2
  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    })

    if (!confirm.isConfirmed) return

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No hay token")

      const res = await fetch(`${API}/api/productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Error al eliminar producto")

      setProductos((prev) => prev.filter((p) => p.id !== id))
      Swal.fire("Eliminado", "El producto fue eliminado correctamente", "success")
    } catch (e) {
      console.error("Error eliminando producto:", e)
      Swal.fire("Error", "No se pudo eliminar el producto", "error")
    }
  }

  // ✅ Cambiar estado activo/inactivo
  const handleToggleActivo = async (id: string, activo: boolean) => {
    const accion = activo ? "desactivar" : "activar"
    const confirm = await Swal.fire({
      title: `¿Seguro que deseas ${accion} este producto?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
      confirmButtonColor: activo ? "#d33" : "#3085d6",
      cancelButtonColor: "#6c757d",
    })

    if (!confirm.isConfirmed) return

    setProcessingId(id)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No hay token")

      const res = await fetch(`${API}/api/productos/${id}/activo`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activo: !activo }),
      })

      if (!res.ok) throw new Error("Error al actualizar estado")

      setProductos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, activo: !p.activo } : p))
      )

      Swal.fire("Actualizado", `El producto fue ${accion} correctamente`, "success")
    } catch (e) {
      console.error("Error cambiando estado:", e)
      Swal.fire("Error", "No se pudo actualizar el estado", "error")
    } finally {
      setProcessingId(null)
    }
  }

  // =========================
  // Render
  // =========================
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis productos</h1>
        <Link href="/seller/products/new">
          <Button className="text-sm">Agregar producto</Button>
        </Link>
      </div>

      {loading ? (
        <p>Cargando productos...</p>
      ) : productos.length === 0 ? (
        <p>No tienes productos aún.</p>
      ) : (
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
              {productos.map((producto) => {
                const imageUrl = producto.imagen_url || "/images/placeholder.jpg"

                return (
                  <tr key={producto.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="relative w-12 h-12 rounded overflow-hidden border">
                        <Image
                          src={imageUrl}
                          alt={producto.nombre}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">{producto.nombre}</td>
                    <td className="px-4 py-2">Q {producto.precio}</td>
                    <td className="px-4 py-2">{producto.stock}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          producto.activo
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {producto.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      {/* ✏️ Editar */}
                      <Link href={`/seller/products/edit/${producto.id}`}>
                        <Button variant="outline" size="icon">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>

                      {/* 🔀 Activar/Desactivar */}
                      <Button
                        variant="secondary"
                        size="icon"
                        disabled={processingId === producto.id}
                        className={processingId === producto.id ? "opacity-50" : ""}
                        onClick={() => handleToggleActivo(producto.id, producto.activo)}
                      >
                        <Power className="w-4 h-4" />
                      </Button>

                      {/* 🗑️ Eliminar */}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(producto.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
