"use client"

import { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

type DocState = "Validado" | "En revisión" | "Rechazado" | "Pendiente"

export default function IdentityValidationPage() {
  const [readOnly, setReadOnly] = useState(true)
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)

  // Estados mock
  const dpiFront: DocState = "Validado"
  const dpiBack: DocState = "En revisión"
  const selfie: DocState = "Rechazado"

  function badgeOf(s: DocState) {
    switch (s) {
      case "Validado":
        return <Badge variant="success">Validado</Badge>
      case "En revisión":
        return <Badge variant="warning">En revisión</Badge>
      case "Rechazado":
        return <Badge variant="destructive">Rechazado</Badge>
      default:
        return <Badge variant="secondary">Pendiente</Badge>
    }
  }

  function handleSave() {
    // Aquí harías el POST/PUT al backend con FormData.
    // Dejamos solo feedback visual.
    setReadOnly(true)
    setFrontFile(null)
    setBackFile(null)
    setSelfieFile(null)
    alert("Documentos enviados para revisión.")
  }

  return (
    <main className="container mx-auto px-4 py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Validación de identidad</h1>
        <p className="text-muted-foreground">
          Carga y gestiona tus documentos. Si editas, los cambios quedarán{" "}
          <span className="font-medium">En revisión</span> hasta que un administrador los apruebe.
        </p>
      </header>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-2 text-sm">
        <Badge variant="success">Validado</Badge>
        <Badge variant="warning">En revisión</Badge>
        <Badge variant="destructive">Rechazado</Badge>
        <Badge variant="secondary">Pendiente</Badge>
      </div>

      {/* Aviso modo lectura */}
      {readOnly && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Estás en modo lectura. Haz clic en{" "}
            <span className="font-medium">Editar</span> para reemplazar archivos rechazados
            o actualizar tus documentos.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* DPI Frente */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>DPI - Frente</CardTitle>
                <CardDescription>Fotografía clara del frente del DPI</CardDescription>
              </div>
              {badgeOf(dpiFront)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56 rounded-md border border-dashed flex items-center justify-center text-sm text-muted-foreground bg-muted/10">
              {/* aquí podrías mostrar la imagen actual si existe */}
              DPI - Frente
            </div>
            <div className="mt-3">
              {readOnly ? (
                <p className="text-sm text-muted-foreground">Documento actual</p>
              ) : (
                <Input type="file" accept="image/*" onChange={(e) => setFrontFile(e.target.files?.[0] || null)} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* DPI Reverso */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>DPI - Reverso</CardTitle>
                <CardDescription>Fotografía clara del reverso del DPI</CardDescription>
              </div>
              {badgeOf(dpiBack)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56 rounded-md border border-dashed flex items-center justify-center text-sm text-muted-foreground bg-muted/10">
              No hay imagen disponible
            </div>
            <div className="mt-3">
              {readOnly ? (
                <p className="text-sm text-muted-foreground">Sin documento</p>
              ) : (
                <Input type="file" accept="image/*" onChange={(e) => setBackFile(e.target.files?.[0] || null)} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selfie con DPI (ocupa ancho completo) */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Selfie con DPI</CardTitle>
                <CardDescription>Sostén tu DPI junto a tu rostro</CardDescription>
              </div>
              {badgeOf(selfie)}
            </div>
          </CardHeader>
          <CardContent>
            {/* Mensaje de rechazo (mock) */}
            <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">
              <span className="font-medium">Motivo:</span> El documento está borroso
            </div>

            <div className="h-56 rounded-md border border-dashed flex items-center justify-center text-sm text-muted-foreground bg-muted/10">
              {/* placeholder */}
              Selfie + DPI
            </div>

            <div className="mt-3">
              {readOnly ? (
                <p className="text-sm text-muted-foreground">—</p>
              ) : (
                <Input type="file" accept="image/*" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)} />
              )}
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            {readOnly ? (
              <Button onClick={() => setReadOnly(false)}>Editar</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setReadOnly(true)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!frontFile && !backFile && !selfieFile}
                >
                  Guardar cambios
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
