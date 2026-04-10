// src/app/seller/[id]/page.tsx — Server Component
import Image from "next/image"
import ProductCardV2 from "@/components/product/ProductCardV2";
import { PRODUCT_GRID } from "@/components/product/productGrid.config";
import { SellerTrustBar } from "@/components/seller/SellerTrustBar"
import { ContactCTA } from "@/components/seller/ContactCTA"
import type { TrustEstado } from "@/lib/sellerTrust"
import { phoneToWaUrl } from "@/lib/phone"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

/* ──────────────────────────────────────────
   DATA FETCH
────────────────────────────────────────── */

async function fetchSeller(id: string) {
  try {
    const res = await fetch(`${API}/api/public/seller/${id}`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.error("Error fetching seller:", err)
    return null
  }
}

/* ──────────────────────────────────────────
   PAGE
────────────────────────────────────────── */

export default async function SellerPage({
  params,
}: {
  params: { id: string }
}) {
  const data = await fetchSeller(params.id)

  if (!data) {
    return (
      <div className="py-20 text-center text-lg text-neutral-500">
        Tienda no encontrada
      </div>
    )
  }

  const { seller, products, stats } = data

  /* Defensive field access — API shape may vary */
  const estadoValidacion = (seller.estado_validacion ?? null) as TrustEstado
  const whatsapp         = phoneToWaUrl(seller.whatsapp_numero)
  const ratingAvg        = Number(seller.rating_avg  ?? 0)
  const ratingCount      = Number(seller.rating_count ?? 0)
  const hasRating        = ratingCount > 0
  const totalProducts    = Number(stats?.total_products ?? products?.length ?? 0)

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        {/* ══════════════════════════════════════
            SELLER HEADER
        ══════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">

            {/* Logo */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200 shadow-sm">
              <Image
                src={seller.logo || "/images/tiendas/default.jpg"}
                alt={seller.nombre_comercio}
                fill
                className="object-cover"
              />
            </div>

            {/* Info column */}
            <div className="flex-1 min-w-0 space-y-3">

              {/* Name */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">
                  {seller.nombre_comercio}
                </h1>

                {/* Rating row */}
                {hasRating && (
                  <p className="text-sm text-neutral-500 mt-1">
                    <span className="text-amber-500 font-semibold">
                      {"★".repeat(Math.round(Math.min(5, ratingAvg)))}
                      <span className="text-neutral-200">
                        {"★".repeat(5 - Math.round(Math.min(5, ratingAvg)))}
                      </span>
                    </span>
                    {" "}
                    <span className="text-neutral-600 font-medium">{ratingAvg.toFixed(1)}</span>
                    <span className="text-neutral-400"> · {ratingCount} reseña{ratingCount !== 1 ? "s" : ""}</span>
                  </p>
                )}
              </div>

              {/* ── TRUST BAR ── */}
              <SellerTrustBar
                perfil={seller}
                productos={products ?? []}
                estadoValidacion={estadoValidacion}
              />

              {/* Description */}
              {seller.descripcion && (
                <p className="text-sm text-neutral-600 leading-relaxed max-w-xl">
                  {seller.descripcion}
                </p>
              )}

              {/* Product count */}
              {totalProducts > 0 && (
                <p className="text-xs text-neutral-400">
                  {totalProducts} producto{totalProducts !== 1 ? "s" : ""} activo{totalProducts !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* ── CONTACT CTA (sidebar on desktop) ── */}
            <div className="w-full sm:w-52 flex-shrink-0">
              <ContactCTA
                whatsapp={whatsapp}
                nombreComercio={seller.nombre_comercio}
              />
            </div>
          </div>

          {/* ── CONTACT CTA (full-width on mobile, hidden on sm+) ── */}
          <div className="mt-5 sm:hidden">
            <ContactCTA
              whatsapp={whatsapp}
              nombreComercio={seller.nombre_comercio}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════
            PRODUCT CATALOGUE
        ══════════════════════════════════════ */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-lg font-bold text-neutral-800">
              Productos del vendedor
            </h2>
            {totalProducts > 0 && (
              <span className="text-xs text-neutral-400">
                {totalProducts} disponible{totalProducts !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {!products || products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-100 py-16 text-center space-y-3">
              <p className="text-3xl">🛍️</p>
              <p className="text-neutral-500 font-medium">
                Este vendedor aún no tiene productos activos.
              </p>
            </div>
          ) : (
            <div className={PRODUCT_GRID.catalog}>
              {products.map((p: any) => (
                <ProductCardV2 key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
