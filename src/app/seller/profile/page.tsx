'use client'

import { useEffect, useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { useFileUpload } from "@/hooks/useFileUpload"

// 🔹 Datos de ejemplo temporal (luego vendrán del backend)
const reseñasSimuladas = [
  {
    id: 1,
    producto: { id: "123", nombre: "Huipil tradicional", imagen: "/ejemplo-producto-1.jpg" },
    calificacion: 5,
    comentario: "Excelente calidad y atención al cliente.",
  },
  {
    id: 2,
    producto: { id: "124", nombre: "Faja artesanal", imagen: "/ejemplo-producto-2.jpg" },
    calificacion: 4,
    comentario: "Muy bonito, aunque tardó un poco el envío.",
  },
]

export default function SellerPublicProfilePage() {
  const { user } = useAuth()
  const [vendedor, setVendedor] = useState<any>(null)
  const [editando, setEditando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<any>({})
  const inputFileRef = useRef<HTMLInputElement>(null)
  const { previews, files, handleFile } = useFileUpload()
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800/api"

  const promedio = reseñasSimuladas.length
    ? (reseñasSimuladas.reduce((a, r) => a + r.calificacion, 0) / reseñasSimuladas.length).toFixed(1)
    : "-"

  // 🔹 Cargar perfil del vendedor autenticado
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.warn("⚠️ No hay token de autenticación en localStorage.")
          return
        }

        const res = await fetch(`${API}/vendedores`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          console.error("❌ Error al obtener el perfil:", res.status, await res.text())
          setLoading(false)
          return
        }

        const data = await res.json()
        setVendedor(data)
        setFormData(data)
      } catch (err) {
        console.error("Error al obtener perfil:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPerfil()
  }, [])

  // 🔹 Cambiar valores de inputs
  const onChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  // 🔹 Enviar actualización de perfil
  const onSubmit = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("No hay sesión activa.")
      return
    }

    try {
      const body = new FormData()
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== undefined && val !== null) body.append(key, val as string)
      })

      if (files.fotoPerfil) body.append("logo", files.fotoPerfil)

      const res = await fetch(`${API}/seller`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body,
      })

      if (res.ok) {
        const updated = await res.json()
        setVendedor(updated.perfil || updated)
        setEditando(false)
      } else {
        console.error("Error al actualizar perfil:", await res.text())
        alert("❌ No se pudo guardar los cambios")
      }
    } catch (error) {
      console.error("Error al guardar:", error)
    }
  }

  if (loading) return <p className="p-8 text-center">Cargando perfil...</p>
  if (!vendedor) return <p className="p-8 text-center text-red-500">No se encontró el perfil del vendedor</p>

  // Solo el dueño puede editar
  const esPropietario = user?.id === vendedor.user_id

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      {/* Encabezado */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900">Perfil del vendedor</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Información pública visible para los compradores
        </p>
      </header>

      {/* Logo y botón de cambio */}
      <section className="flex flex-col items-center gap-4">
        <Avatar className="w-28 h-28">
          <AvatarImage
            src={previews["fotoPerfil"] || vendedor.logo || "/avatar-placeholder.png"}
            alt="Logo del negocio"
          />
          <AvatarFallback>TX</AvatarFallback>
        </Avatar>

        {esPropietario && editando && (
          <>
            <input
              type="file"
              accept="image/*"
              ref={inputFileRef}
              onChange={(e) => handleFile(e, "fotoPerfil", "perfil-vendedor")}
              className="hidden"
            />
            <Button variant="outline" size="sm" onClick={() => inputFileRef.current?.click()}>
              Cambiar logo
            </Button>
          </>
        )}
      </section>

      {/* Datos del vendedor */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Nombre del comercio</Label>
          {editando ? (
            <Input
              value={formData.nombre_comercio || ""}
              onChange={(e) => onChange("nombre_comercio", e.target.value)}
            />
          ) : (
            <p className="text-lg font-semibold">{vendedor.nombre_comercio || "Sin nombre"}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Descripción</Label>
          {editando ? (
            <Textarea
              value={formData.descripcion || ""}
              onChange={(e) => onChange("descripcion", e.target.value)}
              rows={3}
            />
          ) : (
            <p>{vendedor.descripcion || "Sin descripción"}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Dirección</Label>
          {editando ? (
            <Textarea
              value={formData.direccion || ""}
              onChange={(e) => onChange("direccion", e.target.value)}
              rows={2}
            />
          ) : (
            <p>{vendedor.direccion || "Sin dirección"}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Teléfono</Label>
          {editando ? (
            <Input
              value={formData.telefono_comercio || ""}
              onChange={(e) => onChange("telefono_comercio", e.target.value)}
              placeholder="Ej: 12345678"
              className="w-40"
            />
          ) : (
            <p>+502 {vendedor.telefono_comercio || "—"}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Estado de verificación</Label>
          <Badge
            className={
              vendedor.estado_validacion === "verificado"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }
            variant="outline"
          >
            {vendedor.estado_validacion || "Pendiente"}
          </Badge>
        </div>

        {/* Botones */}
        {esPropietario && (
          <div className="flex gap-4">
            <Button onClick={() => setEditando(!editando)} variant="secondary">
              {editando ? "Cancelar edición" : "Editar perfil"}
            </Button>
            {editando && <Button onClick={onSubmit}>Guardar cambios</Button>}
          </div>
        )}
      </div>

      {/* ⭐ Reseñas simuladas */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">⭐ Calificación general: {promedio} / 5</h2>
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Reseñas recientes</h3>
          {reseñasSimuladas.map((r) => (
            <div key={r.id} className="flex items-start gap-4 border p-4 rounded-md">
              <Link href={`/product/${r.producto.id}`}>
                <img
                  src={r.producto.imagen}
                  alt={r.producto.nombre}
                  className="w-16 h-16 rounded object-cover"
                />
              </Link>
              <div>
                <p className="font-medium">{r.producto.nombre}</p>
                <p className="text-sm text-muted-foreground">
                  {"★".repeat(r.calificacion)}{"☆".repeat(5 - r.calificacion)}
                </p>
                <p className="text-sm mt-1">{r.comentario}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
