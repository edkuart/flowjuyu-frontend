// src/app/product/[id]/page.tsx

import ProductGallery from "@/components/product/view/ProductGallery";
import ProductInfo from "@/components/product/view/ProductInfo";
import ProductSpecs from "@/components/product/view/ProductSpecs";
import ProductReviews from "@/components/product/view/ProductReviews";
import ProductRelated from "@/components/product/view/ProductRelated";
import ArtisanStory from "@/components/product/view/ArtisanStory";
import HowToUse from "@/components/product/view/HowToUse";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

async function fetchProduct(id: string) {
  try {
    const res = await fetch(`${API}/api/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Error obteniendo producto:", err);
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

  if (!data?.product) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 gap-3 text-center px-4">
        <p className="font-serif italic text-3xl text-[#0d0d0b]/40">
          Pieza no encontrada
        </p>
        <p className="text-sm text-[#0d0d0b]/30">
          Es posible que haya sido vendida o retirada por el artesano.
        </p>
      </div>
    );
  }

  const product = data.product;
  const relacionados: typeof product[] = Array.isArray(data.related) ? data.related : [];
  const vendedor = product.vendedor ?? {};

  /* ── Normalizar imágenes ── */
  const imagenes: string[] = (() => {
    const lista: string[] = [];
    if (product.imagen_principal) lista.push(product.imagen_principal);
    if (Array.isArray(product.imagenes)) {
      product.imagenes.forEach((img: string | { url: string }) => {
        const url = typeof img === "string" ? img : img?.url;
        if (url) lista.push(url);
      });
    }
    if (product.imagen_url) lista.push(product.imagen_url);
    return [...new Set(lista.filter(Boolean))];
  })();

  /* ── Ubicación ── */
  const ubicacion = [
    product.municipio || product.municipio_custom,
    product.departamento || product.departamento_custom,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-[#f6f2ea] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-20">

        {/* ══════════════════════════════════════════════════
            ZONA DE DECISIÓN — Gallery + Info en 2 columnas
            La galería es sticky en desktop para que el usuario
            siempre vea el producto mientras lee la info.
        ══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-start">

          {/* GALLERY — sticky desde tablet (768px) hacia arriba */}
          <div className="md:sticky md:top-24 self-start">
            <ProductGallery imagenes={imagenes} titulo={product.nombre} />
          </div>

          {/* INFO + SPECS — toda la decisión de compra en una columna */}
          <div className="space-y-6">
            <ProductInfo
              nombre={product.nombre}
              descripcion={product.descripcion}
              precio={product.precio}
              productId={product.id}
              imagen_principal={imagenes[0] ?? "/images/placeholder.png"}
              rating_avg={product.rating_avg}
              rating_count={product.rating_count}
              sellerId={vendedor.id}
              sellerWhatsapp={vendedor.whatsapp}
              sellerPlan={vendedor.plan}
              sellerPlanActivo={vendedor.plan_activo}
              sellerNombre={vendedor.nombre_comercio}
              sellerLogo={vendedor.logo}
              ubicacion={ubicacion || undefined}
              categoria={product.categoria?.nombre ?? product.categoria_custom}
              internal_code={product.internal_code}
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
              accesorio={product.accesorio}
              accesorio_tipo={product.accesorio_tipo}
              accesorio_material={product.accesorio_material}
            />
          </div>

        </div>

        {/* ══════════════════════════════════════════════════
            ARTISAN STORY — editorial, debajo del fold
            Refuerza la decisión después de haber visto precio y CTA
        ══════════════════════════════════════════════════ */}
        <div className="mt-20 border-t border-[#0d2d20]/10 pt-16">
          <ArtisanStory
            ubicacion={ubicacion}
            nombreArtesano={vendedor.nombre_comercio}
          />
        </div>

        {/* ══════════════════════════════════════════════════
            HOW TO USE — guía contextual por categoría
        ══════════════════════════════════════════════════ */}
        <div className="mt-16 border-t border-[#0d2d20]/10 pt-16">
          <HowToUse
            categoria={product.categoria?.nombre ?? product.categoria_custom}
          />
        </div>

        {/* ══════════════════════════════════════════════════
            REVIEWS
        ══════════════════════════════════════════════════ */}
        <div className="mt-16 border-t border-[#0d2d20]/10 pt-16" id="reviews">
          <ProductReviews productId={product.id} />
        </div>

        {/* ══════════════════════════════════════════════════
            PRODUCTOS RELACIONADOS
        ══════════════════════════════════════════════════ */}
        {relacionados.length > 0 && (
          <div className="mt-16 border-t border-[#0d2d20]/10 pt-16">
            <ProductRelated
              productos={relacionados}
              sellerName={vendedor.nombre_comercio}
              sellerId={vendedor.id}
            />
          </div>
        )}

      </div>
    </div>
  );
}
