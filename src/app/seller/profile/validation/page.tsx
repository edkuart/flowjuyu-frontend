'use client'

import { useCallback, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle2, Info, UploadCloud } from "lucide-react"
import Image from "next/image"
import { useFileUpload } from "@/hooks/useFileUpload"

// TIP: trae estos datos reales desde tu sesión/estado global
const SELLER_ID = "seller123"

// Estados permitidos
type EstadoDoc = "Validado" | "En revisión" | "Rechazado" | "Pendiente"

type CampoId = "dpiFrente" | "dpiReverso" | "selfieDpi"

const CAMPOS: Array<{ id: CampoId; label: string; hint?: string }> = [
  { id: "dpiFrente", label: "DPI - Frente", hint: "Fotografía clara del frente del DPI" },
  { id: "dpiReverso", label: "DPI - Reverso", hint: "Fotografía clara del reverso del DPI" },
  { id: "selfieDpi", label: "Selfie con DPI", hint: "Sostén tu DPI junto a tu rostro" },
]

// Paleta de badges
function EstadoBadge({ estado }: { estado: EstadoDoc }) {
  switch (estado) {
    case "Validado":
      return <Badge className="bg-green-100 text-green-700 border-green-200" variant="outline">Validado</Badge>
    case "En revisión":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" variant="outline">En revisión</Badge>
    case "Rechazado":
      return <Badge className="bg-red-100 text-red-700 border-red-200" variant="outline">Rechazado</Badge>
    default:
      return <Badge variant="secondary">Pendiente</Badge>
  }
}

export default function SellerValidationPage() {
  // Estados que te lleguen desde backend
  const [estados, setEstados] = useState<Record<CampoId, EstadoDoc>>({
    dpiFrente: "Validado",
    dpiReverso: "En revisión",
    selfieDpi: "Rechazado",
  })

  // Motivos de rechazo por campo (si aplica)
  const [motivosRechazo, setMotivosRechazo] = useState<Record<CampoId, string>>({
    selfieDpi: "El documento está borroso",
  })

  // URLs actuales (si ya están guardadas en tu backend/S3/etc.)
  const [imagenesActuales] = useState<Record<CampoId, string | null>>({
    dpiFrente: "/ejemplos/dpi_frente.jpg",  // TODO: reemplaza con URL real o null
    dpiReverso: null,
    selfieDpi: null,
  })

  // Modo edición
  const [editando, setEditando] = useState(false)

  // Subida de archivos (tu hook)
  const { previews, files, handleFile } = useFileUpload()

  // Validaciones locales
  const MAX_MB = 5
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/heic"]

  function validateFile(file: File) {
    if (!allowedTypes.includes(file.type)) {
      return `Formato no permitido (${file.type}). Usa JPG/PNG/WEBP/HEIC.`
    }
    const sizeMb = file.size / (1024 * 1024)
    if (sizeMb > MAX_MB) {
      return `El archivo supera ${MAX_MB} MB.`
    }
    return null
  }

  // Soporte “arrastrar y soltar” simple
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, id: CampoId) => {
      e.preventDefault()
      if (!editando) return
      const file = e.dataTransfer.files?.[0]
      if (!file) return
      const err = validateFile(file)
      if (err) {
        alert(err)
        return
      }
      // Adaptamos a tu hook: simulamos el shape del evento esperado
      const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFile(fakeEvent, id, SELLER_ID)
    },
    [editando, handleFile]
  )

  const prevent = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Envío al backend
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Empaqueta solo lo que el user cambió
    const form = new FormData()
    form.set("sellerId", SELLER_ID)

    (Object.keys(files) as CampoId[]).forEach((k) => {
      const f = (files as any)[k] as File | undefined
      if (f) form.append(k, f)
    })

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/seller/validation`
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: form,
      })

      if (!res.ok) {
        const msg = await res.text().catch(() => "")
        throw new Error(msg || "No se pudo enviar la validación")
      }

      // Opcional: refresca estados desde backend
      // const updated = await res.json()
      // setEstados(updated.estados)
      // setMotivosRechazo(updated.motivos || {})
      // setImagenesActuales(updated.urls || {})

      setEditando(false)
      alert("Enviado para revisión. Te notificaremos cuando sea validado.")
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Error al enviar. Intenta de nuevo.")
    }
  }

  // Leyenda de estados
  const Legend = useMemo(() => (
    <div className="flex flex-wrap gap-2 items-center text-xs">
      <span className="text-muted-foreground">Leyenda:</span>
      <EstadoBadge estado="Validado" />
      <EstadoBadge estado="En revisión" />
      <EstadoBadge estado="Rechazado" />
      <EstadoBadge estado="Pendiente" />
    </div>
  ), [])

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-neutral-900">Validación de identidad</h1>
        <p className="text-sm text-muted-foreground">
          Carga y gestiona tus documentos. Si editas, los cambios quedarán <b>En revisión</b> hasta que un administrador los apruebe.
        </p>
        {Legend}
      </header>

      {/* Avisos */}
      {!editando ? (
        <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm">
          <Info className="h-4 w-4 text-blue-700 mt-0.5" />
          <p>
            Estás en modo lectura. Haz clic en <b>Editar</b> para reemplazar archivos rechazados o actualizar tus documentos.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-700 mt-0.5" />
          <p>
            Al guardar, tus archivos pasarán a <b>En revisión</b>. Tamaño máx: {MAX_MB} MB. Formatos: JPG/PNG/WEBP/HEIC.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {CAMPOS.map(({ id, label, hint }) => {
            const estado = estados[id] || "Pendiente"
            const rejected = estado === "Rechazado"
            const canEditThis = editando || rejected

            const showPreview = previews[id]
            const showActual = !showPreview && imagenesActuales[id]

            return (
              <Card key={id} className="relative overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {/* Header campo */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Label htmlFor={id} className="text-sm">{label}</Label>
                      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
                    </div>
                    <EstadoBadge estado={estado} />
                  </div>

                  {/* Motivo de rechazo */}
                  {estado === "Rechazado" && (
                    <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-2 rounded-md">
                      Motivo: {motivosRechazo[id] || "—"}
                    </div>
                  )}

                  {/* Zona de documento */}
                  <div
                    onDragEnter={prevent}
                    onDragOver={prevent}
                    onDrop={(e) => onDrop(e, id)}
                    className={`group relative rounded-md border p-3 transition ${
                      canEditThis
                        ? "border-dashed hover:border-primary hover:bg-primary/5 cursor-pointer"
                        : "bg-muted/40"
                    }`}
                    onClick={() => {
                      if (!canEditThis) return
                      const input = document.getElementById(`file-${id}`) as HTMLInputElement | null
                      input?.click()
                    }}
                  >
                    {/* Imagen actual o preview */}
                    {(showPreview || showActual) ? (
                      <div className="relative w-full h-52 overflow-hidden rounded">
                        <Image
                          src={(showPreview || showActual)!}
                          alt={label}
                          fill
                          className="object-contain bg-white"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-center text-sm text-muted-foreground">
                        <UploadCloud className="h-6 w-6 mb-2 opacity-70" />
                        {canEditThis ? (
                          <>
                            <div><b>Arrastra y suelta</b> o haz clic para seleccionar</div>
                            <div className="text-xs mt-1">Máx {MAX_MB} MB · JPG/PNG/WEBP/HEIC</div>
                          </>
                        ) : (
                          <div>No hay imagen disponible</div>
                        )}
                      </div>
                    )}

                    {/* Input real (oculto) */}
                    <Input
                      id={`file-${id}`}
                      type="file"
                      accept={allowedTypes.join(",")}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        const err = validateFile(f)
                        if (err) {
                          alert(err)
                          // limpia el input
                          e.currentTarget.value = ""
                          return
                        }
                        handleFile(e as any, id, SELLER_ID)
                      }}
                      disabled={!canEditThis}
                    />
                  </div>

                  {/* Pie de tarjeta */}
                  <div className="flex items-center justify-between text-xs">
                    {showPreview ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Listo para enviar
                      </span>
                    ) : imagenesActuales[id] ? (
                      <span className="text-muted-foreground">Documento actual</span>
                    ) : (
                      <span className="text-muted-foreground">Sin documento</span>
                    )}

                    {canEditThis && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          // limpiar selección local de este campo
                          const input = document.getElementById(`file-${id}`) as HTMLInputElement | null
                          if (input) input.value = ""
                          // Si tu hook expone una forma de limpiar, úsala:
                          // clearFile(id)
                          // Por ahora, re-cargamos la página/estado mínimo:
                          alert("Si subiste un archivo por error, vuelve a seleccionarlo correctamente.")
                        }}
                      >
                        Limpiar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Barra de acciones */}
        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant={editando ? "secondary" : "default"}
            onClick={() => setEditando((v) => !v)}
          >
            {editando ? "Cancelar" : "Editar"}
          </Button>

          {editando && (
            <Button type="submit">
              Guardar y enviar para revisión
            </Button>
          )}
        </div>
      </form>
    </main>
  )
}
