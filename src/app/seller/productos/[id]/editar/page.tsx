// src/app/seller/productos/[id]/editar/page.tsx
//
// Premium product edit experience.
// Section-based, mobile-first, with collapsible sections and live preview.
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
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProductEdit } from "@/hooks/useProductEdit"
import { ProductEditPreview } from "@/components/product-edit/ProductEditPreview"
import { MobileSectionNav } from "@/components/product-edit/MobileSectionNav"
import { SectionInformacion } from "@/components/product-edit/SectionInformacion"
import { SectionClasificacion } from "@/components/product-edit/SectionClasificacion"
import { SectionPrecioInventario } from "@/components/product-edit/SectionPrecioInventario"
import { SectionUbicacion } from "@/components/product-edit/SectionUbicacion"
import { SectionImagenes } from "@/components/product-edit/SectionImagenes"

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function EditSkeleton() {
  return (
    <div className="min-h-screen bg-[#f5f4f2]">
      {/* Header skeleton */}
      <div className="h-[52px] bg-white border-b border-gray-100 shadow-[0_1px_0_rgba(0,0,0,0.04)]" />
      {/* Nav skeleton */}
      <div className="h-[40px] bg-[#f5f4f2] border-b border-gray-200/50" />
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-6 animate-pulse">
        <div className="space-y-3">
          {/* High-priority section skeletons */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-xl bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
              <div className="h-[2px] bg-gradient-to-r from-gray-200 to-transparent rounded-t-xl" />
              <div className="px-4 py-3 border-b border-gray-100 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded w-1/4" />
                <div className="h-2.5 bg-gray-50 rounded w-2/5" />
              </div>
              <div className="px-4 py-4 space-y-3">
                <div className="h-9 bg-gray-50 rounded-lg" />
                <div className="h-20 bg-gray-50 rounded-lg" />
              </div>
            </div>
          ))}
          {/* Low-priority section skeletons */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-xl bg-white shadow-[0_1px_4px_-2px_rgba(0,0,0,0.05)]">
              <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/30">
                <div className="h-2.5 bg-gray-100 rounded w-1/5" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden lg:block space-y-3 mt-0">
          <div className="h-3 bg-gray-100 rounded w-2/5" />
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="h-16 bg-gray-50 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function EditError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-md mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <div>
        <h2 className="text-base font-semibold text-gray-900">No se pudo cargar el producto</h2>
        <p className="text-sm text-gray-400 mt-1">{message}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/seller/products">Mis productos</Link>
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditProductPage() {
  const params    = useParams()
  const productId = params.id as string
  const router    = useRouter()

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

  if (loadStatus === "idle" || loadStatus === "loading") return <EditSkeleton />
  if (loadStatus === "error" || !product) {
    return <EditError message={loadError ?? "Producto no encontrado"} onRetry={reload} />
  }

  return (
    <div className="min-h-screen bg-[#f5f4f2]">

      {/* ── Top bar ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/seller/products")}
            aria-label="Volver a mis productos"
            className="h-8 w-8 flex-shrink-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 rounded-lg transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          {/* Two-line title */}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.14em] leading-none">
              Editar producto
            </p>
            <p className="text-[13px] font-semibold text-gray-900 truncate mt-0.5 leading-tight">
              {product.nombre || "Sin nombre"}
            </p>
          </div>

          {/* Right: status badge + saving indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {product.activo ? (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full leading-none hidden sm:inline-flex">
                Publicado
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full leading-none hidden sm:inline-flex">
                Borrador
              </span>
            )}
            {isSaving && (
              <Loader2 className="w-3.5 h-3.5 text-gray-300 animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile section navigator ──────────────────────────────────────────── */}
      <MobileSectionNav />

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6 lg:items-start">

          {/* ── Left: section list ── */}
          <div className="space-y-2.5">

            {/* Mobile-only hero preview */}
            <div className="lg:hidden mb-1">
              <ProductEditPreview product={product} />
            </div>

            {/* ── Información (HIGH — open by default) ── */}
            <div id="section-informacion">
              <SectionInformacion
                product={product}
                updateFields={updateFields}
                onSave={() => saveSection("informacion")}
                sectionState={getSectionState("informacion")}
                isSaving={isSaving}
                defaultExpanded={true}
                priority="high"
              />
            </div>

            {/* ── Clasificación (LOW) ── */}
            <div id="section-clasificacion">
              <SectionClasificacion
                product={product}
                updateFields={updateFields}
                onSave={() => saveSection("clasificacion")}
                sectionState={getSectionState("clasificacion")}
                isSaving={isSaving}
                defaultExpanded={false}
                priority="low"
              />
            </div>

            {/* ── Precio e inventario (HIGH) ── */}
            <div id="section-precio">
              <SectionPrecioInventario
                product={product}
                updateFields={updateFields}
                onSave={() => saveSection("precio")}
                sectionState={getSectionState("precio")}
                isSaving={isSaving}
                defaultExpanded={false}
                priority="high"
              />
            </div>

            {/* ── Ubicación (LOW) ── */}
            <div id="section-ubicacion">
              <SectionUbicacion
                product={product}
                updateFields={updateFields}
                onSave={() => saveSection("ubicacion")}
                sectionState={getSectionState("ubicacion")}
                isSaving={isSaving}
                defaultExpanded={false}
                priority="low"
              />
            </div>

            {/* ── Imágenes (HIGH) ── */}
            <div id="section-imagenes">
              <SectionImagenes
                product={product}
                isSaving={isSaving}
                onUpload={uploadImages}
                onDelete={deleteImage}
                onSetPrincipal={setPrincipalImage}
                sectionState={getSectionState("imagenes")}
                defaultExpanded={false}
                priority="high"
              />
            </div>

            <div className="h-8" />
          </div>

          {/* ── Right: sticky hero preview (desktop only) ── */}
          <div className="hidden lg:block lg:sticky lg:top-[56px]">
            <ProductEditPreview product={product} />
          </div>

        </div>
      </div>
    </div>
  )
}
