// src/app/seller/profile/page.tsx
"use client"

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
import { departamentos } from "@/lib/guatemala"

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
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

  const promedio = reseñasSimuladas.length
    ? (reseñasSimuladas.reduce((a, r) => a + r.calificacion, 0) / reseñasSimuladas.length).toFixed(1)
    : "-"

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const res = await fetch(`${API}/api/seller/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) return

        const data = await res.json()
        const perfil = data.perfil || data

        setVendedor(perfil)
        setFormData(perfil)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPerfil()
  }, [])

  const onChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const onSubmit = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
  
    const body = new FormData()
    Object.entries(formData).forEach(([key, val]) => {
      if (val !== undefined && val !== null) body.append(key, val as string)
    })
  
    if (files.fotoPerfil) body.append("logo", files.fotoPerfil)
  
    const res = await fetch(`${API}/api/seller/profile`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
  
    if (res.ok) {
      const data = await res.json()
      const perfil = data.perfil || data
  
      setVendedor(perfil)
      setFormData(perfil)
      setEditando(false)
    }
  }
  

  if (loading) return <p className="p-8 text-center">Cargando perfil...</p>
  if (!vendedor) return <p className="p-8 text-center text-red-500">Perfil no encontrado</p>

  const esPropietario =
    Number(user?.id) === Number(vendedor.user_id)

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-12">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden rounded-3xl text-white min-h-[280px] md:min-h-[240px]">

        {/* Fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700" />

        <div className="relative p-8 flex flex-col items-center text-center space-y-4">

          {/* Logo */}
          <div className="relative">
            <Avatar className="w-28 h-28 md:w-36 md:h-36 border-4 border-white shadow-2xl">
              <AvatarImage
                src={previews["fotoPerfil"] || vendedor.logo || "/avatar-placeholder.png"}
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
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                  onClick={() => inputFileRef.current?.click()}
                >
                  Cambiar logo
                </Button>
              </>
            )}
          </div>

          {/* Nombre */}
          {editando ? (
            <Input
              value={formData.nombre_comercio || ""}
              onChange={(e) => onChange("nombre_comercio", e.target.value)}
              className="text-center text-2xl font-semibold max-w-sm bg-white text-black"
            />
          ) : (
            <h1 className="text-3xl font-semibold">
              {vendedor.nombre_comercio || "Tienda sin nombre"}
            </h1>
          )}

          {/* Ubicación */}
          <p className="text-sm opacity-90">
            📍 {vendedor.departamento || "—"}, {vendedor.municipio || "—"}
          </p>

          {/* Badges */}
          <div className="flex gap-3 flex-wrap justify-center pt-2">
            <Badge className="bg-white/20 text-white border-white/30">
              {vendedor.estado_validacion || "Pendiente"}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30">
              {vendedor.estado || "Activo"}
            </Badge>
          </div>

          {/* Botones */}
          {esPropietario && (
            <div className="flex gap-4 pt-4 flex-wrap justify-center">
              <Button
                variant="secondary"
                onClick={() => setEditando(!editando)}
              >
                {editando ? "Cancelar" : "Editar perfil"}
              </Button>

              {editando && (
                <Button className="bg-white text-emerald-900" onClick={onSubmit}>
                  Guardar cambios
                </Button>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ================= INFO ================= */}
      <section className="space-y-6 bg-white rounded-3xl p-8 shadow-sm border">

        <div>
          <Label>Descripción</Label>
          {editando ? (
            <Textarea
              value={formData.descripcion || ""}
              onChange={(e) => onChange("descripcion", e.target.value)}
            />
          ) : (
            <p>{vendedor.descripcion || "Sin descripción"}</p>
          )}
        </div>

        {/* Departamento */}
          <div>
            <Label>Departamento</Label>

            {editando ? (
              <select
                value={formData.departamento || ""}
                onChange={(e) => {
                  onChange("departamento", e.target.value)
                  onChange("municipio", "") // reset municipio
                }}
                className="w-full border rounded-md px-3 py-2 mt-1"
              >
                <option value="">Seleccionar departamento</option>
                {departamentos.map((dep) => (
                  <option key={dep.nombre} value={dep.nombre}>
                    {dep.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <p>{vendedor.departamento || "—"}</p>
            )}
          </div>

          {/* Municipio */}
          <div>
            <Label>Municipio</Label>

            {editando ? (
              <select
                value={formData.municipio || ""}
                onChange={(e) => onChange("municipio", e.target.value)}
                disabled={!formData.departamento}
                className="w-full border rounded-md px-3 py-2 mt-1 disabled:bg-gray-100"
              >
                <option value="">Seleccionar municipio</option>
                {departamentos
                  .find((d) => d.nombre === formData.departamento)
                  ?.municipios.map((mun) => (
                    <option key={mun} value={mun}>
                      {mun}
                    </option>
                  ))}
              </select>
            ) : (
              <p>{vendedor.municipio || "—"}</p>
            )}
          </div>

        <div>
          <Label>Dirección</Label>
          {editando ? (
            <Textarea
              value={formData.direccion || ""}
              onChange={(e) => onChange("direccion", e.target.value)}
            />
          ) : (
            <p>{vendedor.direccion || "Sin dirección"}</p>
          )}
        </div>

        <div>
          <Label>Teléfono</Label>
          {editando ? (
            <Input
              value={formData.telefono_comercio || ""}
              onChange={(e) => onChange("telefono_comercio", e.target.value)}
              className="w-40"
            />
          ) : (
            <p>+502 {vendedor.telefono_comercio || "—"}</p>
          )}
        </div>

        <div>
          <Label>WhatsApp (número con código de país)</Label>
          {editando ? (
            <div className="space-y-1">
              <Input
                value={formData.whatsapp_numero || ""}
                onChange={(e) => onChange("whatsapp_numero", e.target.value)}
                placeholder="Ej: 50299887766"
                className="w-52"
              />
              <p className="text-xs text-muted-foreground">
                Incluye el código de país sin "+" — ej: <strong>502</strong>99887766
              </p>
            </div>
          ) : (
            <p>
              {vendedor.whatsapp_numero
                ? `+${vendedor.whatsapp_numero}`
                : <span className="text-muted-foreground text-sm">Sin número de WhatsApp</span>
              }
            </p>
          )}
        </div>

      </section>

      {/* ================= RESEÑAS ================= */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">
          ⭐ Calificación general: {promedio} / 5
        </h2>

        {reseñasSimuladas.map((r) => (
          <div key={r.id} className="flex items-start gap-4 border p-4 rounded-md">
            <Link href={`/product/${r.producto.id}`}>
              <img
                src={r.producto.imagen}
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
      </section>

    </main>
  )
}
