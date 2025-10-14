"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import Swal from "sweetalert2"

type Producto = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  activo: boolean
  imagen_url?: string | null
}

export default function EditProductPage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const router = useRouter()
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  // 🔄 Obtener producto por ID
  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const res = await fetch(`${API}/api/productos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Error al cargar producto")
        const data = await res.json()
        setProducto({
          ...data,
          precio: Number(data.precio),
        })
      } catch (e) {
        console.error("❌ Error cargando producto:", e)
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
      if (!token) throw new Error("No hay token de autenticación")

      const formData = new FormData()
      formData.append("nombre", producto.nombre)
      formData.append("descripcion", producto.descripcion)
      formData.append("precio", String(producto.precio))
      formData.append("stock", String(producto.stock))
      formData.append("activo", producto.activo ? "true" : "false")

      if (file) formData.append("imagenes[]", file)

      const res = await fetch(`${API}/api/productos/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText)
      }

      await Swal.fire({
        icon: "success",
        title: "Producto actualizado",
        text: "Los cambios fueron guardados correctamente",
        confirmButtonColor: "#2563eb",
      })

      router.push("/seller/products")
    } catch (e) {
      console.error("❌ Error guardando producto:", e)
      Swal.fire("Error", "No se pudo guardar el producto", "error")
    } finally {
      setSaving(false)
    }
  }

  // 🖼️ Previsualizar nueva imagen
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)

    if (selected) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(selected)
    } else {
      setPreview(null)
    }
  }

  if (loading)
    return <p className="text-center py-10 text-muted-foreground">Cargando producto...</p>
  if (!producto)
    return <p className="text-center py-10 text-muted-foreground">Producto no encontrado</p>

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-neutral-900">Editar producto</h1>

      <form
        onSubmit={handleSave}
        className="bg-white border rounded-lg shadow-sm p-6 space-y-6"
      >
        {/* Nombre */}
        <div>
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            value={producto.nombre}
            onChange={(e) => setProducto({ ...producto, nombre: e.target.value })}
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            rows={3}
            value={producto.descripcion}
            onChange={(e) =>
              setProducto({ ...producto, descripcion: e.target.value })
            }
            required
          />
        </div>

        {/* Precio y Stock */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="precio">Precio (Q)</Label>
            <Input
              id="precio"
              type="number"
              step="0.01"
              value={producto.precio}
              onChange={(e) =>
                setProducto({ ...producto, precio: parseFloat(e.target.value) })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              value={producto.stock}
              onChange={(e) =>
                setProducto({ ...producto, stock: parseInt(e.target.value) })
              }
              required
            />
          </div>
        </div>

        {/* Estado activo */}
        <div className="flex items-center gap-3">
          <Label htmlFor="activo">Estado</Label>
          <Switch
            id="activo"
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

        {/* Imagen actual */}
        <div>
          <Label>Imagen actual</Label>
          {producto.imagen_url ? (
            <div className="relative w-full max-w-xs mt-2">
              <Image
                src={producto.imagen_url}
                alt="Imagen actual"
                width={400}
                height={300}
                className="rounded-md border shadow-sm object-cover"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">Sin imagen</p>
          )}
        </div>

        {/* Nueva imagen */}
        <div>
          <Label>Nueva imagen</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          {preview && (
            <div className="relative w-full max-w-xs mt-3">
              <Image
                src={preview}
                alt="Vista previa"
                width={400}
                height={300}
                className="rounded-md border shadow-sm object-cover"
              />
              <p className="text-xs text-center text-muted-foreground mt-1">
                Vista previa de la nueva imagen
              </p>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/seller/products")}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </main>
  )
}
