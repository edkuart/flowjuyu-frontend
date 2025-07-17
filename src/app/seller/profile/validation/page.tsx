"use client"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useFileUpload } from "@/hooks/useFileUpload"

export default function SellerValidationPage() {
  const sellerId = "seller123" // TODO: reemplazar con ID real desde sesión o props

  const [editando, setEditando] = useState(false)
  const [motivosRechazo, setMotivosRechazo] = useState<{ [key: string]: string }>({
    selfieDpi: "El documento está borroso"
  })

  const estados: Record<string, "Validado" | "En revisión" | "Rechazado" | "Pendiente"> = {
    dpiFrente: "Validado",
    dpiReverso: "En revisión",
    selfieDpi: "Rechazado"
  }

  const { previews, files, handleFile } = useFileUpload()

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

  const campos = [
    { id: "dpiFrente", label: "DPI - Frente" },
    { id: "dpiReverso", label: "DPI - Reverso" },
    { id: "selfieDpi", label: "Selfie con DPI" }
  ]

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Validación de Identidad</h1>
        <p className="text-sm text-muted-foreground">
          Información cargada para validar tu identidad como vendedor. Solo se puede modificar si decides editar y los cambios serán revisados por un administrador.
        </p>
      </header>

      <form className="space-y-6">
        {campos.map(({ id, label }) => (
          <div key={id} className="space-y-1">
            <Label htmlFor={id}>{label}</Label>
            {editando ? (
              <div className="space-y-2">
                <Input
                  id={id}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e, id, sellerId)}
                />
                {previews[id] && (
                  <img
                    src={previews[id] || ""}
                    alt={label}
                    className="w-40 rounded border"
                  />
                )}
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">Documento cargado (no editable)</div>
                {/* 👇 Aquí podrías renderizar imagen actual si tienes su URL */}
              </>
            )}
            <div className="text-sm mt-1">{renderEstado(id)}</div>
            {estados[id] === "Rechazado" && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-md">
                Motivo del rechazo: {motivosRechazo[id] || "-"}
              </div>
            )}
          </div>
        ))}

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
            <Button type="submit">Guardar y enviar para revisión</Button>
          )}
        </div>
      </form>
    </main>
  )
}
