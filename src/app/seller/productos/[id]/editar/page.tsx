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
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProductEdit } from "@/hooks/useProductEdit"
import { ProductEditorShell } from "@/components/product-edit/ProductEditorShell"

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
    reload,
    ...controllerRest
  } = useProductEdit(productId)

  if (loadStatus === "idle" || loadStatus === "loading") return <EditSkeleton />
  if (loadStatus === "error" || !product) {
    return <EditError message={loadError ?? "Producto no encontrado"} onRetry={reload} />
  }

  return (
    <ProductEditorShell
      controller={{ product, loadStatus, loadError, ...controllerRest }}
      onBack={() => router.push("/seller/products")}
    />
  )
}
