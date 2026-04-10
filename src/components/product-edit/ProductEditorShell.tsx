// src/components/product-edit/ProductEditorShell.tsx

"use client"

import { ArrowLeft, Loader2 } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ProductTitle } from "@/components/product/ProductTitle"
import { ProductEditPreview } from "@/components/product-edit/ProductEditPreview"
import { MobileSectionNav } from "@/components/product-edit/MobileSectionNav"
import { SectionInformacion } from "@/components/product-edit/SectionInformacion"
import { SectionClasificacion } from "@/components/product-edit/SectionClasificacion"
import { SectionPrecioInventario } from "@/components/product-edit/SectionPrecioInventario"
import { SectionUbicacion } from "@/components/product-edit/SectionUbicacion"
import { SectionImagenes } from "@/components/product-edit/SectionImagenes"
import { SectionDetallesOpcionales } from "@/components/product-edit/SectionDetallesOpcionales"
import type { ProductEditorController } from "@/types/product-editor"

type ProductEditorShellProps = {
  controller: ProductEditorController
  onBack: () => void
  footerActions?: ReactNode
}

export function ProductEditorShell({
  controller,
  onBack,
  footerActions,
}: ProductEditorShellProps) {
  const { product, mode, isSaving, getSectionState, updateFields, saveSection } = controller

  if (!product) return null

  const eyebrow = mode === "create" ? "Nuevo producto" : "Editar producto"

  return (
    <div className="min-h-screen bg-[#f5f4f2]">
      {/* ── Top bar ───────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-3 py-2.5 sm:px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label={mode === "create" ? "Volver a mis productos" : "Volver a mis productos"}
            className="h-8 w-8 flex-shrink-0 rounded-lg text-gray-400 transition-colors duration-150 hover:bg-gray-100/80 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase leading-none tracking-[0.14em] text-gray-400">
              {eyebrow}
            </p>
            <ProductTitle value={product.nombre ?? ""} variant="compact" className="mt-0.5 text-[13px] text-gray-900" />
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            {product.activo ? (
              <span className="hidden rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-semibold leading-none text-emerald-700 sm:inline-flex">
                Publicado
              </span>
            ) : (
              <span className="hidden rounded-full border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] font-semibold leading-none text-gray-400 sm:inline-flex">
                Borrador
              </span>
            )}
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-300" />}
          </div>
        </div>
      </div>

      <MobileSectionNav />

      <div className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:items-start lg:gap-6">
          <div className="space-y-2.5">
            <div className="mb-1 lg:hidden">
              <ProductEditPreview product={product} />
            </div>

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

            <div id="section-detalles">
              <SectionDetallesOpcionales
                product={product}
                updateFields={updateFields}
                onSave={() => saveSection("detalles")}
                sectionState={getSectionState("detalles")}
                isSaving={isSaving}
                defaultExpanded={false}
                priority="low"
              />
            </div>

            <div id="section-imagenes">
              <SectionImagenes
                mode={controller.imageMode}
                product={product}
                stagedImages={controller.stagedImages}
                isSaving={isSaving}
                onUpload={controller.uploadImages}
                onDelete={controller.deleteImage}
                onSetPrincipal={controller.setPrincipalImage}
                onReorder={controller.reorderImage}
                sectionState={getSectionState("imagenes")}
                defaultExpanded={false}
                priority="high"
              />
            </div>

            {footerActions}
            <div className="h-8" />
          </div>

          <div className="hidden lg:sticky lg:top-[56px] lg:block">
            <ProductEditPreview product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}
