// src/components/product-edit/ProductEditorShell.tsx

"use client"

import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"
import { PageBackNav } from "@/components/ui/PageBackNav"
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
  const hasDetailMeasures = Boolean(
    product.atributos?.medidas &&
    (
      (product.atributos.medidas.largo ?? 0) > 0 ||
      (product.atributos.medidas.ancho ?? 0) > 0 ||
      (product.atributos.medidas.alto ?? 0) > 0
    )
  )
  const infoComplete = product.nombre.trim().length > 0
  const classificationComplete = Boolean(
    (product.categoria_id || product.categoria_custom) &&
    product.clase_id
  )
  const priceComplete = product.precio > 0 && product.stock >= 0
  const locationComplete = Boolean(product.departamento || product.departamento_custom || product.municipio || product.municipio_custom)
  const detailsComplete = Boolean(
    hasDetailMeasures ||
    product.atributos?.material_principal?.trim() ||
    product.atributos?.tecnica?.trim() ||
    product.atributos?.cuidados?.trim()
  )
  const imagesComplete = (product.imagenes?.length ?? 0) > 0
  const completedSections = [
    infoComplete,
    classificationComplete,
    priceComplete,
    locationComplete,
    detailsComplete,
    imagesComplete,
  ].filter(Boolean).length
  const totalSections = 6

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f8f6f1_0%,#f5f4f2_46%,#efeae0_100%)]">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-64 bg-[radial-gradient(circle_at_top,rgba(15,46,34,0.08),transparent_62%)]" />
      {/* ── Top bar ───────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-[#0f2e22]/8 bg-white/88 backdrop-blur-xl shadow-[0_8px_24px_-22px_rgba(15,46,34,0.35)]">
        <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4">
          <PageBackNav
            variant="panel"
            onClick={onBack}
            label="Volver a mis productos"
            meta={eyebrow}
            title={
              <ProductTitle
                value={product.nombre ?? ""}
                variant="compact"
                className="text-[13px] text-gray-900 sm:text-[15px]"
              />
            }
            trailing={
              <>
                <div className="hidden items-center gap-2 rounded-full border border-[#0f2e22]/8 bg-[#f7f6f2] px-3 py-1.5 lg:flex">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#0f2e22]/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0f2e22] to-emerald-500 transition-all duration-500"
                      style={{ width: `${(completedSections / totalSections) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-neutral-500">
                    {completedSections}/{totalSections} secciones listas
                  </span>
                </div>

                {product.activo ? (
                  <span className="hidden rounded-full border border-emerald-200 bg-emerald-50/90 px-2.5 py-1 text-[10px] font-semibold leading-none text-emerald-700 sm:inline-flex">
                    Publicado
                  </span>
                ) : (
                  <span className="hidden rounded-full border border-[#0f2e22]/8 bg-white/80 px-2.5 py-1 text-[10px] font-semibold leading-none text-gray-500 sm:inline-flex">
                    Borrador
                  </span>
                )}
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-300" />}
              </>
            }
          />
        </div>
      </div>

      <MobileSectionNav />

      <div className="relative z-10 mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="mb-4 grid gap-3 lg:hidden">
          <div className="rounded-2xl border border-[#0f2e22]/8 bg-white/85 px-4 py-3 shadow-[0_10px_30px_-22px_rgba(15,46,34,0.22)] backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                  Progreso
                </p>
                <p className="mt-1 text-sm font-semibold text-[#14231c]">
                  {completedSections}/{totalSections} secciones listas
                </p>
              </div>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-[#0f2e22]/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0f2e22] to-emerald-500 transition-all duration-500"
                  style={{ width: `${(completedSections / totalSections) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-7">
          <div className="space-y-3">
            <div className="mb-1 lg:hidden">
              <ProductEditPreview product={product} />
            </div>

            <div id="section-informacion">
              <SectionInformacion
                product={product}
                updateFields={updateFields}
                onSave={() => saveSection("informacion")}
                sectionState={getSectionState("informacion")}
                completionLabel={infoComplete ? "Completo" : "Pendiente"}
                isSaving={isSaving}
                defaultExpanded={false}
                priority="high"
              />
            </div>

            <div id="section-clasificacion">
              <SectionClasificacion
                product={product}
                updateFields={updateFields}
                onSave={() => saveSection("clasificacion")}
                sectionState={getSectionState("clasificacion")}
                completionLabel={classificationComplete ? "Completo" : "Pendiente"}
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
                completionLabel={priceComplete ? "Completo" : "Pendiente"}
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
                completionLabel={locationComplete ? "Completo" : "Pendiente"}
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
                completionLabel={detailsComplete ? "Completo" : "Pendiente"}
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
                completionLabel={imagesComplete ? "Completo" : "Pendiente"}
                defaultExpanded={false}
                priority="high"
              />
            </div>

            {footerActions}
            <div className="h-8" />
          </div>

          <div className="hidden lg:sticky lg:top-[86px] lg:block">
            <div className="space-y-4">
              <div className="rounded-[28px] border border-[#0f2e22]/10 bg-white/86 p-4 shadow-[0_18px_50px_-28px_rgba(15,46,34,0.28)] backdrop-blur">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                      Panel visual
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#14231c]">
                      Así se verá tu producto
                    </p>
                  </div>
                  <span className="rounded-full bg-[#0f2e22]/6 px-2.5 py-1 text-[10px] font-semibold text-[#0f2e22]/70">
                    Tiempo real
                  </span>
                </div>
                <ProductEditPreview product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
