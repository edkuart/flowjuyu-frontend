'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { validarTelefonoGT } from "@/lib/utils/validations"

const prefijo = "+502"

export default function SellerProfileNegocioPage() {
  const [nombre, setNombre] = useState("Tienda Artesanal Xela")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("3a Calle 4-55, Zona 1, Quetzaltenango")
  const [descripcion, setDescripcion] = useState("Somos una tienda dedicada a la venta de productos típicos guatemaltecos hechos a mano.")
  const email = "tienda@example.com"

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900">Perfil del negocio</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Administra la información visible para los clientes
        </p>
      </header>

      <section className="flex flex-col items-center gap-4">
        <Avatar className="w-28 h-28">
          <AvatarImage src="/avatar-placeholder.png" alt="Logo del negocio" />
          <AvatarFallback>TX</AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm">Cambiar logo</Button>
      </section>

      <form className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del comercio</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono de contacto</Label>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-1 border rounded-md px-2 py-1 text-sm bg-white">
              <span className="text-muted-foreground">{prefijo}</span>
              <Input
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(validarTelefonoGT(e.target.value))}
                placeholder="Ej: 55555555"
                maxLength={8}
                className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-32"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="direccion">Dirección del negocio</Label>
          <Textarea
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button type="submit" className="w-full sm:w-auto">
            Guardar cambios
          </Button>

          <Link href="/seller/profile/validacion">
            <Button variant="secondary" className="w-full sm:w-auto">
              Ir a datos de validación
            </Button>
          </Link>
        </div>
      </form>
    </main>
  )
}