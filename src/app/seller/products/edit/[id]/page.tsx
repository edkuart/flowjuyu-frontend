// src/app/seller/products/edit/[id]/page.tsx

"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Swal from "sweetalert2"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type Producto = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  activo: boolean
  imagen_principal?: string | null
  imagenes: { id: number; url: string }[]
}

export default function EditProductPage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const router = useRouter()
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<string[]>([])

  const toImageUrl = useMemo(
    () => (url?: string | null) => {
      if (!url) return null
      if (/^https?:\/\//i.test(url)) return url
      return `${API}${url.startsWith("/") ? "" : "/"}${url}`
    },
    [API]
  )

  // 🔄 Obtener producto
  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const res = await fetch(`${API}/api/productos/${id}/edit`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Error al cargar producto")
        const data = await res.json()
        const product = data?.product ?? data

        setProducto({
          ...product,
          precio: Number(product.precio),
          imagenes: Array.isArray(product.imagenes) ? product.imagenes : [],
        })
      } catch (error) {
        console.error("❌ Error cargando producto:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProducto()
  }, [API, id, router])

  // 💾 Guardar cambios
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!producto) return

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No hay token")

      const formData = new FormData()
      formData.append("nombre", producto.nombre)
      formData.append("descripcion", producto.descripcion)
      formData.append("precio", String(producto.precio))
      formData.append("stock", String(producto.stock))
      formData.append("activo", producto.activo ? "true" : "false")

      files.forEach((file) => formData.append("imagenes[]", file))

      const res = await fetch(`${API}/api/productos/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) throw new Error(await res.text())

      await Swal.fire({
        icon: "success",
        title: "Producto actualizado",
        text: "Los cambios fueron guardados correctamente",
        confirmButtonColor: "#2563eb",
      })

      router.push("/seller/products")
    } catch (error) {
      console.error("❌ Error guardando producto:", error)
      Swal.fire("Error", "No se pudo guardar el producto", "error")
    } finally {
      setSaving(false)
    }
  }

  // 🖼️ Manejo de imágenes nuevas
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : []
    setFiles(selectedFiles)

    const previews = selectedFiles.map((file) => URL.createObjectURL(file))
    setPreview(previews)
  }

  useEffect(() => {
    return () => preview.forEach((url) => URL.revokeObjectURL(url))
  }, [preview])

  if (loading)
    return (
      <p className="text-center py-10 text-muted-foreground">
        Cargando producto...
      </p>
    )

  if (!producto)
    return (
      <p className="text-center py-10 text-muted-foreground">
        Producto no encontrado
      </p>
    )

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Editar producto</h1>

      <form
        onSubmit={handleSave}
        className="bg-white border rounded-lg shadow-sm p-6 space-y-6"
      >
        {/* Nombre */}
        <div>
          <Label>Nombre</Label>
          <Input
            value={producto.nombre}
            onChange={(e) =>
              setProducto({ ...producto, nombre: e.target.value })
            }
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <Label>Descripción</Label>
          <Textarea
            value={producto.descripcion}
            onChange={(e) =>
              setProducto({ ...producto, descripcion: e.target.value })
            }
          />
        </div>

        {/* Precio y stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Precio</Label>
            <Input
              type="number"
              value={producto.precio}
              onChange={(e) =>
                setProducto({ ...producto, precio: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <Label>Stock</Label>
            <Input
              type="number"
              value={producto.stock}
              onChange={(e) =>
                setProducto({ ...producto, stock: Number(e.target.value) })
              }
            />
          </div>
        </div>

        {/* Estado */}
        <div className="flex items-center gap-3">
          <Label>Estado</Label>
          <Switch
            checked={producto.activo}
            onCheckedChange={(checked) =>
              setProducto({ ...producto, activo: checked })
            }
          />
          <span
            className={`text-sm ${
              producto.activo ? "text-green-600" : "text-red-600"
            }`}
          >
            {producto.activo ? "Activo" : "Inactivo"}
          </span>
        </div>

        {/* Imagen principal */}
        <div>
          <Label>Imagen principal</Label>
          {producto.imagen_principal ? (
            <div className="relative w-full max-w-xs mt-2 aspect-[4/3]">
              <Image
                src={toImageUrl(producto.imagen_principal)!}
                alt="Imagen principal"
                fill
                className="rounded-md border object-cover"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin imagen</p>
          )}
        </div>

        {/* Imágenes extra */}
        <div>
          <Label>Imágenes extra actuales</Label>
          {producto.imagenes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {producto.imagenes.map((img) => (
                <div key={img.id} className="relative aspect-[4/3]">
                  <Image
                    src={toImageUrl(img.url)!}
                    alt="Imagen extra"
                    fill
                    className="rounded-md border object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay imágenes extra
            </p>
          )}
        </div>

        {/* Nuevas imágenes */}
        <div>
          <Label>Nuevas imágenes</Label>
          <Input type="file" multiple accept="image/*" onChange={handleFileChange} />

          {preview.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {preview.map((src) => (
                <div key={src} className="relative aspect-[4/3]">
                  <Image
                    src={src}
                    alt="Preview"
                    fill
                    className="rounded-md border object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/seller/products")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </main>
  )
}