// src/app/product/[id]/page.tsx

import ProductGallery from "@/components/product/view/ProductGallery";
import ProductInfo from "@/components/product/view/ProductInfo";
import ProductSpecs from "@/components/product/view/ProductSpecs";
import ProductSeller from "@/components/product/view/ProductSeller";
import ProductRelated from "@/components/product/view/ProductRelated";
import ProductReviews from "@/components/product/view/ProductReviews";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

async function fetchProduct(id: string) {
  try {
    const res = await fetch(`${API}/api/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("❌ Error obteniendo producto:", err);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const data = await fetchProduct(id);

  if (!data || !data.product) {
    return (
      <div className="w-full flex justify-center py-20 text-lg font-medium text-neutral-500">
        Producto no encontrado
      </div>
    );
  }

  const product = data.product;

  /* ── Normalise images ── */
  const imagenes: string[] = (() => {
    const lista: string[] = [];
    if (Array.isArray(product.imagenes)) lista.push(...product.imagenes.filter(Boolean));
    if (product.imagen_url) lista.push(product.imagen_url);
    if (product.imagen_principal) lista.unshift(product.imagen_principal);
    return [...new Set(lista.filter(Boolean))];
  })();

  const relacionados = Array.isArray(data.related) ? data.related : [];
  const vendedor = product.vendedor || {};

  /* ── Location string ── */
  const ubicacion = [
    product.municipio || product.municipio_custom,
    product.departamento || product.departamento_custom,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="container mx-auto px-4 py-10 space-y-20">

      {/* ══════════════════════════════════════
          TOP: GALLERY · INFO · SELLER
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* GALLERY */}
        <div className="lg:col-span-5">
          <ProductGallery imagenes={imagenes} titulo={product.nombre} />
        </div>

        {/* INFO + SPECS */}
        <div className="lg:col-span-4 space-y-8">
          <ProductInfo
            nombre={product.nombre}
            descripcion={product.descripcion}
            precio={product.precio}
            productId={product.id}
            imagen_principal={imagenes[0] || "/placeholder.jpg"}
            rating_avg={product.rating_avg}
            rating_count={product.rating_count}
            sellerId={vendedor.id}
            sellerWhatsapp={vendedor.whatsapp}
            sellerPlan={vendedor.plan}
            sellerPlanActivo={vendedor.plan_activo}
            ubicacion={ubicacion || undefined}
          />

          <ProductSpecs
            categoria={product.categoria}
            clase={product.clase}
            tela={product.tela}
            departamento={product.departamento}
            municipio={product.municipio}
            categoria_custom={product.categoria_custom}
            tela_custom={product.tela_custom}
            departamento_custom={product.departamento_custom}
            municipio_custom={product.municipio_custom}
          />
        </div>

        {/* SELLER BOX */}
        <div className="lg:col-span-3">
          <ProductSeller
            vendedor={product.vendedor}
            departamento={product.departamento}
            municipio={product.municipio}
            rating_avg={product.rating_avg}
            rating_count={product.rating_count}
          />
        </div>

      </div>

      {/* ══════════════════════════════════════
          STORYTELLING — ARTISAN CONTEXT
      ══════════════════════════════════════ */}
      <div className="border-t border-neutral-100 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Main story block */}
          <div className="md:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-8 flex items-start gap-6">
            <span className="text-5xl flex-shrink-0" aria-hidden="true">🧵</span>
            <div className="space-y-2">
              <p className="font-bold text-neutral-800 text-xl">
                {ubicacion
                  ? `Hecho a mano en ${ubicacion}`
                  : "Artesanía guatemalteca hecha a mano"}
              </p>
              <p className="text-neutral-600 text-sm leading-relaxed max-w-xl">
                Este producto fue elaborado artesanalmente por un vendedor
                guatemalteco. Cada pieza lleva horas de trabajo, técnicas
                transmitidas de generación en generación y materiales
                seleccionados con cuidado. Al comprarlo, apoyas directamente a
                una familia y contribuyes a preservar el patrimonio cultural de
                Guatemala.
              </p>
            </div>
          </div>

          {/* Micro-stats / cultural highlights */}
          <div className="grid grid-cols-1 gap-4">
            {[
              {
                emoji: "🎨",
                title: "Pieza única",
                desc: "Hecha a mano, ninguna es igual a otra.",
              },
              {
                emoji: "🤝",
                title: "Compra directa",
                desc: "Tu dinero llega directo al artesano.",
              },
              {
                emoji: "🌿",
                title: "Tradición viva",
                desc: "Técnicas ancestrales preservadas.",
              },
            ].map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-neutral-100 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm"
              >
                <span className="text-2xl flex-shrink-0">{emoji}</span>
                <div>
                  <p className="font-semibold text-neutral-800 text-sm leading-none">
                    {title}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════ */}
      <div className="border-t border-neutral-100 pt-6">
        <ProductReviews productId={product.id} />
      </div>

      {/* ══════════════════════════════════════
          RELATED PRODUCTS
      ══════════════════════════════════════ */}
      {relacionados.length > 0 && (
        <div className="border-t border-neutral-100 pt-6">
          <ProductRelated
            productos={relacionados}
            sellerName={vendedor.nombre_comercio}
            sellerId={vendedor.id}
          />
        </div>
      )}

    </div>
  );
}
