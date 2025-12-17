// src/app/product/[id]/page.tsx

import ProductGallery from "@/components/product/view/ProductGallery";
import ProductInfo from "@/components/product/view/ProductInfo";
import ProductSpecs from "@/components/product/view/ProductSpecs";
import ProductSeller from "@/components/product/view/ProductSeller";
import ProductRelated from "@/components/product/view/ProductRelated";

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

export default async function ProductPage({ params }: { params: { id: string } }) {
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

  // 🔥 Normalizamos imágenes
  const imagenes = Array.isArray(product.imagenes)
    ? product.imagenes
    : Array.isArray(data.imagenes)
    ? data.imagenes
    : [];

  // 🔥 Normalizamos productos relacionados
  const relacionados = Array.isArray(data.related) ? data.related : [];

  return (
    <div className="container mx-auto px-4 py-10 space-y-16">

      {/* ---- GRID PRINCIPAL (ESTILO AMAZON) ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* ----- GALERÍA ----- */}
        <div className="lg:col-span-4">
          <ProductGallery
            imagenes={imagenes}
            titulo={product.nombre}
            imagen_principal={product.imagen_principal}   // 🔥 AGREGADO
          />
        </div>

        {/* ----- INFORMACIÓN PRINCIPAL ----- */}
        <div className="lg:col-span-5">
          <ProductInfo
            nombre={product.nombre}
            descripcion={product.descripcion}
            precio={product.precio}
          />

          {/* ---- ESPECIFICACIONES ----- */}
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

        {/* ----- SELLER BOX ----- */}
        <div className="lg:col-span-3">
          <ProductSeller
            vendedor_nombre={product.vendedor_nombre}
            vendedor_logo_url={product.vendedor_logo_url}
            departamento={product.departamento}
            municipio={product.municipio}
            vendedor_id={product.vendedor_id}
          />
        </div>

      </div>

      {/* ----- PRODUCTOS RELACIONADOS ----- */}
      <ProductRelated productos={relacionados} />
    </div>
  );
}
