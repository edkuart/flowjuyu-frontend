// src/app/product/[id]/page.tsx

import ProductGallery from "@/components/product/view/ProductGallery";
import ProductInfo from "@/components/product/view/ProductInfo";
import ProductSpecs from "@/components/product/view/ProductSpecs";
import ProductSeller from "@/components/product/view/ProductSeller";
import ProductRelated from "@/components/product/view/ProductRelated";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

/* =====================================================
   🔹 Fetch producto
===================================================== */
async function fetchProduct(id: string) {
  try {
    const res = await fetch(`${API}/api/products/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (err) {
    console.error("❌ Error obteniendo producto:", err);
    return null;
  }
}

/* =====================================================
   🔹 Página
===================================================== */
export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const data = await fetchProduct(id);

  if (!data || !data.product) {
    return (
      <div className="w-full flex justify-center py-20 text-lg font-medium">
        Producto no encontrado
      </div>
    );
  }

  const product = data.product;

  /* =====================================================
     🖼️ Normalizar imágenes (ANTI-CRASH)
  ===================================================== */
  const imagenes: string[] = (() => {
    const lista: string[] = [];

    if (Array.isArray(product.imagenes)) {
      lista.push(...product.imagenes.filter(Boolean));
    }

    if (product.imagen_url) {
      lista.push(product.imagen_url);
    }

    if (product.imagen_principal) {
      lista.unshift(product.imagen_principal);
    }

    return [...new Set(lista.filter(Boolean))];
  })();

  /* =====================================================
     🔹 Productos relacionados
  ===================================================== */
  const relacionados = Array.isArray(data.related)
    ? data.related
    : [];

  /* =====================================================
     🔹 Datos vendedor (para WhatsApp)
  ===================================================== */
  const vendedor = product.vendedor || {};

  return (
    <div className="container mx-auto px-4 py-10 space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* 🖼️ GALERÍA */}
        <div className="lg:col-span-4">
          <ProductGallery
            imagenes={imagenes}
            titulo={product.nombre}
          />
        </div>

        {/* 🧾 INFO */}
        <div className="lg:col-span-5">
          <ProductInfo
            nombre={product.nombre}
            descripcion={product.descripcion}
            precio={product.precio}
            productId={product.id}
            imagen_principal={imagenes[0] || "/placeholder.jpg"}
            rating_avg={product.rating_avg}
            rating_count={product.rating_count}

            /* 🔥 NUEVAS PROPS PARA WHATSAPP */
            sellerId={vendedor.id}
            sellerWhatsapp={vendedor.whatsapp}
            sellerPlan={vendedor.plan}
            sellerPlanActivo={vendedor.plan_activo}
          />

          <div className="mt-10">
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
        </div>

        {/* 🏪 VENDEDOR */}
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

      {/* 🔗 RELACIONADOS */}
      {relacionados.length > 0 && (
        <ProductRelated productos={relacionados} />
      )}
    </div>
  );
}