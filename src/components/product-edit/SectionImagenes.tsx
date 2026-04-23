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
import { Upload, Trash2, Star, StarOff, Loader2, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SellerEducationHint } from "@/components/seller/SellerEducationHint"
import { cn } from "@/lib/utils"
import { MAX_IMAGE_UPLOAD_MB } from "@/lib/imageCompression"
import type { ProductEditData, SectionSaveState } from "@/types/product-edit"
import type { ProductImageMode, StagedProductImage } from "@/types/product-editor"

const MAX_IMAGES = 5
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/avif"]
const MAX_SIZE_MB = MAX_IMAGE_UPLOAD_MB

interface Props {
  mode?: ProductImageMode
  product: ProductEditData
  stagedImages?: StagedProductImage[]
  isSaving: boolean
  sectionState: SectionSaveState
  completionLabel?: string
  onUpload: (files: File[]) => Promise<void>
  onDelete: (imageId: number | string) => Promise<void>
  onSetPrincipal: (imageUrlOrId: string) => Promise<void>
  onReorder?: (fromIndex: number, toIndex: number) => void
  defaultExpanded?: boolean
  priority?: "high" | "low"
}

export function SectionImagenes({
  mode = "persisted",
  product,
  stagedImages = [],
  isSaving,
  sectionState,
  completionLabel,
  onUpload,
  onDelete,
  onSetPrincipal,
  onReorder,
  defaultExpanded = false,
  priority: _priority = "high",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [deletingId, setDeletingId] = useState<number | string | null>(null)
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

    if (gallery.length + files.length > MAX_IMAGES) {
      setLocalError(`Máximo ${MAX_IMAGES} imágenes por producto.`)
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

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

  async function handleDelete(imageId: number | string) {
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

  async function handleSetPrincipal(imageUrlOrId: string) {
    setLocalError(null)
    setSettingPrincipalUrl(imageUrlOrId)
    try {
      await onSetPrincipal(imageUrlOrId)
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : "Error al cambiar imagen principal")
    } finally {
      setSettingPrincipalUrl(null)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const gallery =
    mode === "staged"
      ? stagedImages.map((image) => ({
          id: image.localId,
          url: image.previewUrl,
          principalKey: image.localId,
          isPrincipal: image.isPrincipal,
        }))
      : (product.imagenes ?? []).map((image) => ({
          id: image.id,
          url: image.url,
          principalKey: image.url,
          isPrincipal: image.url === product.imagen_principal,
        }))
  const principalUrl = product.imagen_principal

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-[#0f2e22]/8 bg-white shadow-[0_8px_28px_-18px_rgba(15,46,34,0.16)] transition-shadow duration-300 hover:shadow-[0_14px_38px_-22px_rgba(15,46,34,0.22)]"
      )}
    >
      <div className="h-[2px] bg-gradient-to-r from-[#0f2e22]/72 via-[#0f2e22]/18 to-transparent" />

      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-center justify-between gap-3 border-b border-[#0f2e22]/6 px-5 py-4 text-left transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0f2e22]/30",
          "bg-white hover:bg-[#f7f6f2]"
        )}
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-semibold leading-none tracking-tight text-[#14231c]">
            Imágenes
          </h2>
          {expanded && (
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
              La primera marcada como principal es la portada del producto.
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-mono text-[11px] tabular-nums text-neutral-300">
            {gallery.length}/{MAX_IMAGES}
          </span>
          {!expanded && sectionState.status === "success" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 leading-none">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Guardado
            </span>
          )}
          {!expanded && sectionState.status === "idle" && (
            <span
              className={cn(
                "text-[10px] font-medium",
                completionLabel === "Completo" ? "text-emerald-600" : "text-neutral-300"
              )}
            >
              {completionLabel ?? "Pendiente"}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-neutral-400 transition-transform duration-300 ease-out",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Collapsible body */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
      <div className="overflow-hidden">
      <div className="space-y-3 px-5 py-5">
        <SellerEducationHint title="Imagen">
          <p>Usa una foto clara, con buena luz y fondo simple.</p>
        </SellerEducationHint>

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
              const isPrincipal = img.isPrincipal || img.url === principalUrl
              const isDeleting = deletingId === img.id
              const isSettingThis = settingPrincipalUrl === img.principalKey
              const index = gallery.findIndex((item) => item.id === img.id)

              return (
                <div
                  key={img.id}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-colors ${
                    isPrincipal ? "border-primary" : "border-transparent"
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-square relative bg-gray-100">
                    {mode === "staged" ? (
                      <img
                        src={img.url}
                        alt="Imagen de producto"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={img.url}
                        alt="Imagen de producto"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    )}

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
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex gap-1 justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    {onReorder && index > 0 && (
                      <button
                        type="button"
                        title="Mover antes"
                        aria-label="Mover antes"
                        className="min-h-7 min-w-7 rounded bg-white/20 p-1 text-white transition-colors hover:bg-white/40 disabled:opacity-50"
                        onClick={() => onReorder(index, index - 1)}
                        disabled={isAnyImageBusy || isSaving}
                      >
                        ←
                      </button>
                    )}
                    {onReorder && index < gallery.length - 1 && (
                      <button
                        type="button"
                        title="Mover después"
                        aria-label="Mover después"
                        className="min-h-7 min-w-7 rounded bg-white/20 p-1 text-white transition-colors hover:bg-white/40 disabled:opacity-50"
                        onClick={() => onReorder(index, index + 1)}
                        disabled={isAnyImageBusy || isSaving}
                      >
                        →
                      </button>
                    )}
                    {/* Set as principal */}
                    {!isPrincipal && (
                      <button
                        type="button"
                        title="Usar como imagen principal"
                        aria-label="Usar como imagen principal"
                        className="min-h-7 min-w-7 rounded bg-white/20 p-1 text-white transition-colors hover:bg-white/40 disabled:opacity-50"
                        onClick={() => handleSetPrincipal(img.principalKey)}
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
                      className="min-h-7 min-w-7 rounded bg-white/20 p-1 text-white transition-colors hover:bg-red-500/80 disabled:opacity-50"
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
      </div>
      </div>
    </section>
  )
}
