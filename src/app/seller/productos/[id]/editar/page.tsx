// src/app/seller/productos/[id]/editar/page.tsx
//
// Section-based product edit page.
// Replaces the wizard reuse for editing — the wizard remains at
// /seller/products/new for initial product creation only.
//
// Data flow:
//   GET /api/productos/:id/edit  → full product state (single source of truth)
//   PUT /api/productos/:id       → every section save sends the FULL object
//   DELETE /api/productos/:id/imagenes/:imageId → image removal
//   PATCH  /api/productos/:id/set-principal     → principal image change
//   PUT    /api/productos/:id (multipart)       → new image upload

"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProductEdit } from "@/hooks/useProductEdit"
import { ProductEditHeader } from "@/components/product-edit/ProductEditHeader"
import { ProductEditPreview } from "@/components/product-edit/ProductEditPreview"
import { SectionInformacion } from "@/components/product-edit/SectionInformacion"
import { SectionClasificacion } from "@/components/product-edit/SectionClasificacion"
import { SectionPrecioInventario } from "@/components/product-edit/SectionPrecioInventario"
import { SectionUbicacion } from "@/components/product-edit/SectionUbicacion"
import { SectionImagenes } from "@/components/product-edit/SectionImagenes"

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function EditSkeleton() {
  return (
    <div className="min-h-screen bg-[#f5f4f2]">
      <div className="h-14 bg-white border-b shadow-sm" />
      <div className="max-w-5xl mx-auto px-4 py-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-24 bg-white border rounded-xl" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-xl p-5 space-y-3 bg-white">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-2 bg-gray-100 rounded w-1/2" />
              <div className="h-10 bg-gray-100 rounded mt-4" />
              <div className="h-10 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        <div className="hidden lg:block space-y-4 mt-0">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function EditError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
      <AlertCircle className="w-12 h-12 text-destructive" />
      <h2 className="text-lg font-semibold">No se pudo cargar el producto</h2>
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onRetry}>
          Reintentar
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/seller/products">Volver a mis productos</Link>
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string
  const router = useRouter()

  const {
    product,
    loadStatus,
    loadError,
    isSaving,
    getSectionState,
    updateFields,
    saveSection,
    uploadImages,
    deleteImage,
    setPrincipalImage,
    reload,
  } = useProductEdit(productId)

  // ── Loading ────────────────────────────────────────────────────────────
  if (loadStatus === "idle" || loadStatus === "loading") {
    return <EditSkeleton />
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (loadStatus === "error" || !product) {
    return (
      <EditError
        message={loadError ?? "Producto no encontrado"}
        onRetry={reload}
      />
    )
  }

  // ── Loaded ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f4f2]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/seller/products")}
            aria-label="Volver a mis productos"
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </Button>
          <p className="text-sm font-semibold text-gray-800 truncate flex-1">
            {product.nombre || "Editar producto"}
          </p>
          {isSaving && (
            <span className="text-xs text-gray-400 animate-pulse">
              Guardando…
            </span>
          )}
        </div>
      </div>

      {/* Two-column layout: form (left) + preview (right, sticky) */}
      <div className="max-w-5xl mx-auto px-4 py-7">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-7 lg:items-start">

          {/* ── Left: sections ── */}
          <div className="space-y-5">
            {/* Header card — product identity, activo badge */}
            <ProductEditHeader product={product} />

            {/* Section 1 — Información básica */}
            <SectionInformacion
              product={product}
              updateFields={updateFields}
              onSave={() => saveSection("informacion")}
              sectionState={getSectionState("informacion")}
              isSaving={isSaving}
            />

            {/* Section 2 — Clasificación (categoria, clase, tela, accesorios) */}
            <SectionClasificacion
              product={product}
              updateFields={updateFields}
              onSave={() => saveSection("clasificacion")}
              sectionState={getSectionState("clasificacion")}
              isSaving={isSaving}
            />

            {/* Section 3 — Precio e inventario */}
            <SectionPrecioInventario
              product={product}
              updateFields={updateFields}
              onSave={() => saveSection("precio")}
              sectionState={getSectionState("precio")}
              isSaving={isSaving}
            />

            {/* Section 4 — Ubicación de origen */}
            <SectionUbicacion
              product={product}
              updateFields={updateFields}
              onSave={() => saveSection("ubicacion")}
              sectionState={getSectionState("ubicacion")}
              isSaving={isSaving}
            />

            {/* Section 5 — Imágenes (dedicated endpoints, no full PUT) */}
            <SectionImagenes
              product={product}
              isSaving={isSaving}
              onUpload={uploadImages}
              onDelete={deleteImage}
              onSetPrincipal={setPrincipalImage}
              sectionState={getSectionState("imagenes")}
            />

            <div className="h-8" />
          </div>

          {/* ── Right: sticky preview ── */}
          <div className="hidden lg:block lg:sticky lg:top-20">
            <ProductEditPreview product={product} />
          </div>

        </div>
      </div>
    </div>
  )
}
