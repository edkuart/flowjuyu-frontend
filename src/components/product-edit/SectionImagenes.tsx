// src/components/product-edit/SectionImagenes.tsx
//
// Manages the product image gallery.
//
// This section does NOT use the full PUT pattern.
// Instead it uses three dedicated endpoints:
//   upload new images → PUT /api/productos/:id (multipart — handled by hook's uploadImages)
//   delete an image   → DELETE /api/productos/:id/imagenes/:imageId
//   set principal     → PATCH  /api/productos/:id/set-principal
//
// The hook's uploadImages() calls reload() after success, so the gallery
// automatically reflects the server state (correct IDs, updated imagen_principal).
//
// MAX_IMAGES = 5 (backend limit per request, Multer config)

"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Upload, Trash2, Star, StarOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProductEditData, SectionSaveState } from "@/types/product-edit"

const MAX_IMAGES = 5
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/avif"]
const MAX_SIZE_MB = 3

interface Props {
  product: ProductEditData
  isSaving: boolean
  sectionState: SectionSaveState
  onUpload: (files: File[]) => Promise<void>
  onDelete: (imageId: number) => Promise<void>
  onSetPrincipal: (imageUrl: string) => Promise<void>
}

export function SectionImagenes({
  product,
  isSaving,
  sectionState,
  onUpload,
  onDelete,
  onSetPrincipal,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [settingPrincipalUrl, setSettingPrincipalUrl] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const isUploading = sectionState.status === "saving"
  const isAnyImageBusy = isUploading || deletingId !== null || settingPrincipalUrl !== null

  // ── File input validation ──────────────────────────────────────────────────

  function validateFiles(files: File[]): string | null {
    if (files.length === 0) return null
    if (files.length > MAX_IMAGES) {
      return `Máximo ${MAX_IMAGES} imágenes por subida.`
    }
    for (const f of files) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        return `Tipo no permitido: ${f.type}. Solo PNG, JPEG, WEBP, GIF, AVIF.`
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        return `"${f.name}" supera el límite de ${MAX_SIZE_MB} MB.`
      }
    }
    return null
  }

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    setLocalError(null)
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    const validationErr = validateFiles(files)
    if (validationErr) {
      setLocalError(validationErr)
      // Reset input so the same file can be picked again after fixing the error
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    await onUpload(files)
    // Reset input after upload so the user can upload the same file name again
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleDelete(imageId: number) {
    setLocalError(null)
    setDeletingId(imageId)
    try {
      await onDelete(imageId)
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : "Error al eliminar imagen")
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSetPrincipal(imageUrl: string) {
    setLocalError(null)
    setSettingPrincipalUrl(imageUrl)
    try {
      await onSetPrincipal(imageUrl)
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : "Error al cambiar imagen principal")
    } finally {
      setSettingPrincipalUrl(null)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const gallery = product.imagenes ?? []
  const principalUrl = product.imagen_principal

  return (
    <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-sm text-gray-800 tracking-tight">Imágenes</h2>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
            La imagen marcada como principal es la portada del producto.
          </p>
        </div>
        <span className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5 tabular-nums font-mono">
          {gallery.length}/{MAX_IMAGES}
        </span>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Upload button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            multiple
            className="sr-only"
            onChange={handleFilePick}
            disabled={isAnyImageBusy || isSaving}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnyImageBusy || isSaving}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Subir imágenes
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Máx {MAX_IMAGES} imágenes · {MAX_SIZE_MB} MB c/u · PNG, JPEG, WEBP, AVIF
          </p>
        </div>

        {/* Status messages */}
        {(localError || sectionState.error) && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{localError ?? sectionState.error}</span>
          </div>
        )}

        {sectionState.status === "success" && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Imágenes actualizadas</span>
          </div>
        )}

        {/* Gallery grid */}
        {gallery.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="w-8 h-8 opacity-30" />
            <p className="text-sm">Sin imágenes. Sube la primera.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gallery.map((img) => {
              const isPrincipal = img.url === principalUrl
              const isDeleting = deletingId === img.id
              const isSettingThis = settingPrincipalUrl === img.url

              return (
                <div
                  key={img.id}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-colors ${
                    isPrincipal ? "border-primary" : "border-transparent"
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-square relative bg-gray-100">
                    <Image
                      src={img.url}
                      alt="Imagen de producto"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />

                    {/* Loading overlay for delete/set-principal operations */}
                    {(isDeleting || isSettingThis) && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Principal badge */}
                  {isPrincipal && (
                    <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5" />
                      Principal
                    </div>
                  )}

                  {/* Action overlay — visible on hover or on touch */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex gap-1 justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    {/* Set as principal */}
                    {!isPrincipal && (
                      <button
                        type="button"
                        title="Usar como imagen principal"
                        aria-label="Usar como imagen principal"
                        className="bg-white/20 hover:bg-white/40 text-white rounded p-1 transition-colors disabled:opacity-50"
                        onClick={() => handleSetPrincipal(img.url)}
                        disabled={isAnyImageBusy || isSaving}
                      >
                        <StarOff className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      title="Eliminar imagen"
                      aria-label="Eliminar imagen"
                      className="bg-white/20 hover:bg-red-500/80 text-white rounded p-1 transition-colors disabled:opacity-50"
                      onClick={() => handleDelete(img.id)}
                      disabled={isAnyImageBusy || isSaving}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          La imagen marcada con <Star className="w-3 h-3 inline" /> aparece en
          los resultados de búsqueda y en la vista de catálogo.
        </p>
      </div>
    </section>
  )
}
