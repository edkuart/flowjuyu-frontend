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
  const [selectedImage, setSelectedImage] = useState<{
  url: string
  nombre: string
  id: string
} | null>(null)
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

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Error actualizando producto")
      }

      setProductos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, activo: !p.activo } : p
        )
      )

      Swal.fire("Actualizado", "Estado actualizado", "success")
    } catch (err: any) {
      Swal.fire(
        "No se pudo actualizar",
        err.message || "Error inesperado",
        "error"
      )
    } finally {
      setProcessingId(null)
    }
  }

  /* ==============================
     Render
  ============================== */
  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestión de productos
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Administra tu inventario y controla qué productos están visibles.
            </p>
          </div>

          <Link href="/seller/products/new">
            <Button className="bg-[#0F3D3A] hover:bg-[#0C2F2C] text-white rounded-xl px-5 py-2.5 shadow-sm">
              <PackagePlus className="w-4 h-4 mr-2" />
              Nuevo producto
            </Button>
          </Link>
        </header>

        {/* ================= CONTENT ================= */}
        {loading ? (
          <div className="text-center py-20 text-neutral-500">
            Cargando productos…
          </div>
        ) : productos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-sm">
            <h2 className="text-lg font-semibold mb-2">
              Aún no tienes productos
            </h2>
            <p className="text-neutral-500 mb-6">
              Agrega tu primer producto y comienza a vender.
            </p>
            <Link href="/seller/products/new">
              <Button className="bg-[#0F3D3A] hover:bg-[#0C2F2C] text-white">
                Agregar producto
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* ================= DESKTOP CARDS ================= */}
            <div className="hidden md:flex flex-col gap-4">
              {currentProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition p-5 flex justify-between items-center"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-4">

                    {/* Imagen clickeable */}
                    <div
                      onClick={() =>
                        setSelectedImage({
                          url: p.imagen_url || "/images/placeholder.jpg",
                          nombre: p.nombre,
                          id: p.id,
                        })
                      }
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-neutral-200 cursor-pointer group transition"
                    >
                      <Image
                        src={p.imagen_url || "/images/placeholder.jpg"}
                        alt={p.nombre}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-300"
                      />

                      {/* Overlay sutil en hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">
                        {p.nombre}
                      </h3>

                      <p className="text-sm text-neutral-600 mt-1">
                        Q {Number(p.precio).toLocaleString("es-GT", {
                          minimumFractionDigits: 2,
                        })}
                      </p>

                      <p
                        className={`text-xs mt-1 ${
                          p.stock > 5
                            ? "text-neutral-400"
                            : p.stock > 0
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {p.stock > 0 ? `Stock: ${p.stock}` : "Sin stock"}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-3">

                    <span
                      className={`px-3 py-1 text-xs rounded-full border ${
                        p.activo
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {p.activo ? "Publicado" : "Borrador"}
                    </span>

                    <Link href={`/seller/products/new?id=${p.id}`}>
                      <Button size="icon" variant="outline" className="rounded-lg">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processingId === p.id}
                      onClick={() => handleToggleActivo(p.id, p.activo)}
                      className="rounded-lg"
                    >
                      <Power className="w-4 h-4 mr-1" />
                      {p.activo ? "Despublicar" : "Publicar"}
                    </Button>

                    <Button
                      size="icon"
                      variant="destructive"
                      className="rounded-lg"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* ================= MOBILE CARDS ================= */}
            <div className="md:hidden flex flex-col gap-5">
              {currentProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 space-y-4"
                >
                  <div className="relative w-full h-40 rounded-xl overflow-hidden">
                    <Image
                      src={p.imagen_url || "/images/placeholder.jpg"}
                      alt={p.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">
                      {p.nombre}
                    </h3>

                    <p className="text-neutral-600">
                      Q {Number(p.precio).toLocaleString("es-GT", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Stock: {p.stock}</span>

                    <span
                      className={`px-2 py-1 rounded-full text-xs border ${
                        p.activo
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {p.activo ? "Publicado" : "Borrador"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/seller/products/new?id=${p.id}`}>
                      <Button variant="outline" className="w-full">
                        Editar
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      onClick={() => handleToggleActivo(p.id, p.activo)}
                      className="w-full"
                    >
                      {p.activo ? "Despublicar" : "Publicar"}
                    </Button>

                    <Button
                      variant="destructive"
                      className="col-span-2"
                      onClick={() => handleDelete(p.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* ================= PAGINATION ================= */}
            <div className="flex justify-between items-center text-sm pt-4">
              <span className="text-neutral-500">
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
      </div>
      {/* ================= IMAGE MODAL ================= */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => {
          if (!open) setSelectedImage(null)
        }}
      >
        <DialogContent className="max-w-3xl p-6">

          {selectedImage && (
            <div className="space-y-4">

              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  {selectedImage.nombre}
                </DialogTitle>
              </DialogHeader>

              <div className="relative w-full h-[450px]">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.nombre}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedImage(null)}
                >
                  Cerrar
                </Button>

                <Link href={`/seller/products/new?id=${selectedImage.id}`}>
                  <Button className="bg-[#0F3D3A] hover:bg-[#0C2F2C] text-white">
                    Editar producto
                  </Button>
                </Link>
              </div>

            </div>
          )}

        </DialogContent>
      </Dialog>
    </main>
  )
}
