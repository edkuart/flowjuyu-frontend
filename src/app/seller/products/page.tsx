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

  // ==============================
  // Obtener productos del vendedor
  // ==============================
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

  // ==============================
  // Paginación
  // ==============================
  const totalPages = useMemo(
    () => Math.ceil(productos.length / perPage),
    [productos, perPage]
  )

  const currentProducts = useMemo(() => {
    const start = (page - 1) * perPage
    return productos.slice(start, start + perPage)
  }, [productos, page, perPage])

  // ==============================
  // Eliminar producto
  // ==============================
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

  // ==============================
  // Activar / Desactivar producto
  // ==============================
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

  // ==============================
  // Render principal
  // ==============================
  return (
    <main className="min-h-screen px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Mis productos</h1>

        <div className="flex items-center gap-4">
          <label className="text-sm text-muted-foreground">
            Mostrar{" "}
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setPage(1)
              }}
              className="ml-2 border rounded-md px-2 py-1 text-sm"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>{" "}
            por página
          </label>

          <Link href="/seller/products/new">
            <Button className="text-sm">Agregar producto</Button>
          </Link>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <p>Cargando productos...</p>
      ) : productos.length === 0 ? (
        <p>No tienes productos aún.</p>
      ) : (
        <>
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
                {currentProducts.map((p) => {
                  const imageUrl = p.imagen_url || "/images/placeholder.jpg"

                  return (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td
                        className="px-4 py-2 cursor-pointer"
                        onClick={() => {
                          setSelected(p)
                          setImgIndex(0)
                        }}
                      >
                        <div className="relative w-12 h-12 rounded overflow-hidden border">
                          <Image
                            src={imageUrl}
                            alt={p.nombre}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td
                        className="px-4 py-2 cursor-pointer"
                        onClick={() => {
                          setSelected(p)
                          setImgIndex(0)
                        }}
                      >
                        {p.nombre}
                      </td>
                      <td className="px-4 py-2">
                      Q {Number(p.precio).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-2">{p.stock}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            p.activo
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {p.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <Link href={`/seller/products/edit/${p.id}`}>
                          <Button variant="outline" size="icon">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="secondary"
                          size="icon"
                          disabled={processingId === p.id}
                          onClick={() => handleToggleActivo(p.id, p.activo)}
                        >
                          <Power className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(p.id)}
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

          {/* Paginación */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {Math.min(productos.length, (page - 1) * perPage + 1)}–
              {Math.min(page * perPage, productos.length)} de {productos.length} productos
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
              <span className="text-sm font-medium">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
{/* ==============================
     Modal de detalle del producto
   ============================== */}
<Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
  <DialogContent className="max-w-2xl">
    {selected && (
      <>
        <DialogHeader>
          <DialogTitle className="capitalize">{selected.nombre}</DialogTitle>
          <DialogDescription>
            Detalles completos del producto
          </DialogDescription>
        </DialogHeader>

        {/* 📸 Carrusel de imágenes */}
        <div className="relative w-full h-72 rounded-lg overflow-hidden mb-4 bg-gray-100">
          <Image
            src={
              selected.imagenes?.[imgIndex] ||
              selected.imagen_url ||
              "/images/placeholder.jpg"
            }
            alt={selected.nombre}
            fill
            className="object-cover"
          />

          {selected.imagenes && selected.imagenes.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setImgIndex((i) =>
                    i === 0 ? selected.imagenes!.length - 1 : i - 1
                  )
                }
                className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setImgIndex((i) =>
                    i === selected.imagenes!.length - 1 ? 0 : i + 1
                  )
                }
                className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Pequeños indicadores debajo */}
              <div className="absolute bottom-2 w-full flex justify-center gap-1">
                {selected.imagenes.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i === imgIndex ? "bg-white" : "bg-gray-400/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 🧾 Detalles del producto */}
        <div className="space-y-2 text-sm">
          <p>
            <strong>Precio:</strong> Q{" "}
            {Number(selected.precio).toLocaleString("es-GT", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p>
            <strong>Stock:</strong> {selected.stock}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                selected.activo
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {selected.activo ? "Activo" : "Inactivo"}
            </span>
          </p>

          {/* 🏷 Datos opcionales */}
          {selected.categoria?.nombre && (
            <p>
              <strong>Categoría:</strong> {selected.categoria.nombre}
            </p>
          )}
          {selected.clase?.nombre && (
            <p>
              <strong>Clase:</strong> {selected.clase.nombre}
            </p>
          )}
          {selected.tela?.nombre && (
            <p>
              <strong>Tela:</strong> {selected.tela.nombre}
            </p>
          )}
          {selected.region?.nombre && (
            <p>
              <strong>Región:</strong> {selected.region.nombre}
            </p>
          )}

          {/* 🕓 Fecha */}
          {selected.created_at && (
            <p>
              <strong>Publicado el:</strong>{" "}
              {new Date(selected.created_at).toLocaleDateString("es-GT", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          {selected.descripcion && (
            <p className="pt-2 text-gray-700 dark:text-gray-300">
              <strong>Descripción:</strong> {selected.descripcion}
            </p>
          )}
        </div>

        {/* 🔘 Botones */}
        <div className="flex justify-end pt-4 gap-2">
          <Button variant="outline" onClick={() => setSelected(null)}>
            <X className="w-4 h-4 mr-1" /> Cerrar
          </Button>
          <Link href={`/seller/products/edit/${selected.id}`}>
            <Button>
              <Pencil className="w-4 h-4 mr-1" /> Editar
            </Button>
          </Link>
        </div>
      </>
    )}
  </DialogContent>
</Dialog>

    </main>
  )
}
