'use client'

import { useEffect, useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useFileUpload } from "@/hooks/useFileUpload"

const reseñasSimuladas = [
  {
    id: 1,
    producto: {
      id: "123",
      nombre: "Huipil tradicional",
      imagen: "/ejemplo-producto-1.jpg"
    },
    calificacion: 5,
    comentario: "Excelente calidad y atención al cliente."
  },
  {
    id: 2,
    producto: {
      id: "124",
      nombre: "Faja artesanal",
      imagen: "/ejemplo-producto-2.jpg"
    },
    calificacion: 4,
    comentario: "Muy bonito, aunque tardó un poco el envío."
  }
]

const productosIniciales = [
  {
    id: "123",
    nombre: "Huipil tradicional",
    imagen: "/ejemplo-producto-1.jpg",
    disponible: true
  },
  {
    id: "124",
    nombre: "Faja artesanal",
    imagen: "/ejemplo-producto-2.jpg",
    disponible: false
  }
]

export default function SellerPublicProfilePage() {
  const { data: session } = useSession()
  const [nombre, setNombre] = useState("Tienda Artesanal Xela")
  const [descripcion, setDescripcion] = useState("Somos una tienda dedicada a la venta de productos típicos guatemaltecos hechos a mano.")
  const [direccion, setDireccion] = useState("3a Calle 4-55, Zona 1, Quetzaltenango")
  const [telefono, setTelefono] = useState("12345678")
  const [productosDisponibles, setProductosDisponibles] = useState(productosIniciales)
  const [editando, setEditando] = useState(false)
  const inputFileRef = useRef<HTMLInputElement>(null)

  const { previews, files, handleFile } = useFileUpload()

  const editable = Boolean(session)
  const promedio = reseñasSimuladas.length
    ? (reseñasSimuladas.reduce((a, r) => a + r.calificacion, 0) / reseñasSimuladas.length).toFixed(1)
    : "-"

  const toggleDisponibilidad = (id: string) => {
    setProductosDisponibles(prev =>
      prev.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p)
    )
  }

  const validarTelefono = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, "")
    if (soloNumeros.length <= 8) {
      setTelefono(soloNumeros)
    }
  }

  const onSubmit = async () => {
    if (!session?.user?.id || !session.user.email) {
      console.error("❌ Falta el ID o email de la sesión.")
      return
    }

    const form = new FormData()
    form.append("id", session.user.id.toString())
    form.append("nombre", nombre)
    form.append("email", session.user.email)
    form.append("telefono", telefono)
    form.append("direccion", direccion)
    if (files.logo) {
      form.append("logo", files.logo)
    }

    const res = await fetch("http://localhost:8800/vendedor/perfil", {
      method: "POST",
      body: form,
    })

    if (res.ok) {
      setEditando(false)
    } else {
      alert("Error al guardar el perfil.")
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900">Perfil del vendedor</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Información pública visible para los compradores
        </p>
      </header>

      <section className="flex flex-col items-center gap-4">
        <Avatar className="w-28 h-28">
          <AvatarImage src={previews["fotoPerfil"] || "/avatar-placeholder.png"} alt="Logo del negocio" />
          <AvatarFallback>TX</AvatarFallback>
        </Avatar>
        {editable && editando && (
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

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Nombre del comercio</Label>
          {editando ? <Input value={nombre} onChange={(e) => setNombre(e.target.value)} /> : <p className="text-lg font-semibold">{nombre}</p>}
        </div>
        <div className="space-y-2">
          <Label>Descripción</Label>
          {editando ? <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} /> : <p>{descripcion}</p>}
        </div>
        <div className="space-y-2">
          <Label>Dirección</Label>
          {editando ? <Textarea value={direccion} onChange={(e) => setDireccion(e.target.value)} rows={2} /> : <p>{direccion}</p>}
        </div>
        <div className="space-y-2">
          <Label>Teléfono</Label>
          {editando ? (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">+502</span>
              <Input
                inputMode="numeric"
                pattern="[0-9]*"
                value={telefono}
                onChange={(e) => validarTelefono(e.target.value)}
                placeholder="Ej: 12345678"
                className="w-32"
              />
            </div>
          ) : (
            <p>+502 {telefono}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Estado de verificación</Label>
          <Badge className="bg-green-100 text-green-700" variant="outline">Verificado</Badge>
        </div>

        {editable && (
          <div className="flex gap-4">
            <Button onClick={() => setEditando(!editando)} variant="secondary">
              {editando ? "Cancelar edición" : "Editar perfil"}
            </Button>
            {editando && <Button onClick={onSubmit}>Guardar cambios</Button>}
          </div>
        )}
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">⭐ Calificación general: {promedio} / 5</h2>
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Reseñas recientes</h3>
          {reseñasSimuladas.map((r) => (
            <div key={r.id} className="flex items-start gap-4 border p-4 rounded-md">
              <Link href={`/product/${r.producto.id}`}>
                <img src={r.producto.imagen} alt={r.producto.nombre} className="w-16 h-16 rounded object-cover" />
              </Link>
              <div>
                <p className="font-medium">{r.producto.nombre}</p>
                <p className="text-sm text-muted-foreground">{"★".repeat(r.calificacion)}{"☆".repeat(5 - r.calificacion)}</p>
                <p className="text-sm mt-1">{r.comentario}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">📦 Catálogo disponible</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {productosDisponibles.map((p) => (
            <div key={p.id} className="border p-3 rounded text-center space-y-2">
              <Link href={`/product/${p.id}`}>
                <img src={p.imagen} alt={p.nombre} className="w-full h-24 object-cover rounded" />
                <p className="font-medium mt-2">{p.nombre}</p>
              </Link>
              {editable ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDisponibilidad(p.id)}
                >
                  {p.disponible ? "Marcar como NO disponible" : "Marcar como disponible"}
                </Button>
              ) : (
                <Badge className={p.disponible ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}>
                  {p.disponible ? "Disponible" : "No disponible"}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
