"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function SellerValidationPage() {
  const [editando, setEditando] = useState(false)
  const [archivos, setArchivos] = useState<{ [key: string]: File | null }>({})
  const [preview, setPreview] = useState<{ [key: string]: string | null }>({})
  const [nit, setNit] = useState("")
  const [nitError, setNitError] = useState("")
  const [motivosRechazo, setMotivosRechazo] = useState<{ [key: string]: string }>({
    selfieDpi: "El documento está borroso"
  })

  const estados: Record<string, "Validado" | "En revisión" | "Rechazado" | "Pendiente"> = {
    dpiFrente: "Validado",
    dpiReverso: "En revisión",
    selfieDpi: "Rechazado",
    nit: "Pendiente",
  }

  const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>, campo: string) => {
    const file = e.target.files?.[0] || null
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview((prev) => ({ ...prev, [campo]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
    setArchivos((prev) => ({ ...prev, [campo]: file }))
  }

  const renderEstado = (campo: string) => {
    const estado = estados[campo]
    switch (estado) {
      case "Validado":
        return <Badge className="bg-green-100 text-green-700" variant="outline">Validado</Badge>
      case "En revisión":
        return <Badge className="bg-yellow-100 text-yellow-800" variant="outline">En revisión</Badge>
      case "Rechazado":
        return <Badge className="bg-red-100 text-red-700" variant="outline">Rechazado</Badge>
      default:
        return <Badge variant="secondary">Pendiente</Badge>
    }
  }

  const validarNit = (valor: string) => {
    const limpio = valor.replace(/[^0-9]/g, "")
    if ([8, 9, 13].includes(limpio.length)) {
      setNitError("")
    } else {
      setNitError("El NIT debe tener 8, 9 o 13 dígitos válidos")
    }
    setNit(limpio)
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Validación de Identidad</h1>
        <p className="text-sm text-muted-foreground">
          Información cargada para validar tu identidad como vendedor. Solo se puede modificar si decides editar y los cambios serán revisados por un administrador.
        </p>
      </header>

      <form className="space-y-6">
        {[ 
          { id: "dpiFrente", label: "DPI - Frente", tipo: "file" },
          { id: "dpiReverso", label: "DPI - Reverso", tipo: "file" },
          { id: "selfieDpi", label: "Selfie con DPI", tipo: "file" }
        ].map(({ id, label }) => (
          <div key={id} className="space-y-1">
            <Label htmlFor={id}>{label}</Label>
            {editando ? (
              <div className="space-y-2">
                <Input
                  id={id}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleArchivo(e, id)}
                />
                {preview[id] && (
                  <img src={preview[id] || ""} alt={label} className="w-40 rounded border" />
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Documento cargado (no editable)</div>
            )}
            <div className="text-sm mt-1">{renderEstado(id)}</div>
            {estados[id] === "Rechazado" && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-md">
                Motivo del rechazo: {motivosRechazo[id] || "-"}
              </div>
            )}
          </div>
        ))}

        <div className="space-y-1">
          <Label htmlFor="nit">Número de NIT</Label>
          {editando ? (
            <div className="space-y-1">
              <Input
                id="nit"
                type="text"
                inputMode="numeric"
                value={nit}
                onChange={(e) => validarNit(e.target.value)}
                placeholder="Ej: 12345678, 123456789 o 1234567891234"
              />
              {nitError && <p className="text-sm text-red-600">{nitError}</p>}
            </div>
          ) : (
            <p className="text-muted-foreground">1234567-8</p>
          )}
          <div className="text-sm mt-1">{renderEstado("nit")}</div>
        </div>

        {editando && (
          <div className="bg-yellow-50 border border-yellow-300 text-sm text-yellow-800 p-4 rounded-md">
            ⚠️ Los cambios realizados serán enviados a un administrador para su validación. Deberás esperar aprobación para que se reflejen en tu perfil.
          </div>
        )}

        <div className="flex justify-between gap-4">
          <Button type="button" variant="secondary" onClick={() => setEditando(!editando)}>
            {editando ? "Cancelar" : "Editar datos"}
          </Button>
          {editando && (
            <Button type="submit" disabled={!!nitError}>Guardar y enviar para revisión</Button>
          )}
        </div>
      </form>
    </main>
  )
}
