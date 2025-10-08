"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

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
          precio: Number(data.precio), // asegurar número
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
  const handleSave = async () => {
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

      if (file) {
        // 👈 importante: debe llamarse igual que en multer (imagenes[])
        formData.append("imagenes[]", file)
      }

      const res = await fetch(`${API}/api/productos/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText)
      }

      router.push("/seller/products")
    } catch (e) {
      console.error("❌ Error guardando producto:", e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Cargando...</p>
  if (!producto) return <p>No se encontró el producto</p>

  return (
    <main className="max-w-xl mx-auto py-10 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Editar producto</h1>

      <div>
        <Label>Nombre</Label>
        <Input
          value={producto.nombre}
          onChange={(e) => setProducto({ ...producto, nombre: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Descripción</Label>
        <Textarea
          value={producto.descripcion}
          onChange={(e) =>
            setProducto({ ...producto, descripcion: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label>Precio</Label>
        <Input
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
        <Label>Stock</Label>
        <Input
          type="number"
          value={producto.stock}
          onChange={(e) =>
            setProducto({ ...producto, stock: parseInt(e.target.value) })
          }
          required
        />
      </div>

      <div>
        <Label>Estado</Label>
        <Button
          type="button"
          variant={producto.activo ? "secondary" : "default"}
          onClick={() =>
            setProducto({ ...producto, activo: !producto.activo })
          }
        >
          {producto.activo ? "Activo ✅" : "Inactivo ⛔"}
        </Button>
      </div>

      <div>
        <Label>Imagen actual</Label>
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt="Imagen actual"
            className="rounded-lg mt-2 w-full max-h-60 object-cover"
          />
        ) : (
          <p className="text-sm text-muted-foreground">Sin imagen</p>
        )}
      </div>

      <div>
        <Label>Nueva imagen</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-6"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </main>
  )
}
