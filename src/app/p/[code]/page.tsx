// src/app/p/[code]/page.tsx
// Public product page resolved by internal_code (QR / share link)

import type { Metadata } from "next";
import ProductGallery from "@/components/product/view/ProductGallery";
import ProductInfo from "@/components/product/view/ProductInfo";
import ProductSpecs from "@/components/product/view/ProductSpecs";
import ProductReviews from "@/components/product/view/ProductReviews";
import ProductRelated from "@/components/product/view/ProductRelated";
import ArtisanStory from "@/components/product/view/ArtisanStory";
import HowToUse from "@/components/product/view/HowToUse";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

async function fetchProductByCode(code: string) {
  try {
    const res = await fetch(`${API}/api/products/code/${encodeURIComponent(code)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Error obteniendo producto por código:", err);
    return null;
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://flowjuyu.com";

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}): Promise<Metadata> {
  const data = await fetchProductByCode(params.code);
  const product = data?.product;

  if (!product) {
    return {
      title: "Producto no encontrado | Flowjuyu",
      description: "Este producto no está disponible.",
      robots: { index: false },
    };
  }

  const cleanDescription = product.descripcion
    ?.replace(/\n/g, " ")
    .trim()

  const description = cleanDescription
    ? cleanDescription.length > 140
      ? `${cleanDescription.slice(0, 140)}…`
      : cleanDescription
    : "Descubre este producto artesanal en Flowjuyu"

  const title = `${product.nombre} | Flowjuyu`

  const imageUrl: string | null =
    product.imagen_principal ||
    (Array.isArray(product.imagenes) && product.imagenes.length > 0
      ? (typeof product.imagenes[0] === "string" ? product.imagenes[0] : product.imagenes[0]?.url)
      : null)

  const images = imageUrl
    ? [{ url: imageUrl, width: 1200, height: 630, alt: product.nombre }]
    : []

  const pageUrl = `${SITE_URL}/p/${params.code}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "Flowjuyu",
      locale: "es_GT",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductByCodePage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = params;
  const data = await fetchProductByCode(code);

  if (!data?.product) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 gap-4 text-center px-4">
        <p className="font-serif italic text-3xl text-[#0d0d0b]/40">
          No encontramos este producto
        </p>
        <p className="text-sm text-[#0d0d0b]/30 max-w-xs leading-relaxed">
          Verifica el código o intenta nuevamente.
        </p>
        <p className="text-xs text-[#0d0d0b]/20 tracking-wide">
          Ejemplo: FJ-XXXX
        </p>
        <a
          href="/"
          className="mt-2 text-xs uppercase tracking-[0.18em] text-[#0d2d20]/50 hover:text-[#0d2d20]/80 transition-colors underline underline-offset-4"
        >
          Volver al inicio
        </a>
      </div>
    );
  }

  const product = data.product;
  const relacionados: typeof product[] = Array.isArray(data.related) ? data.related : [];
  const vendedor = product.vendedor ?? {};

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

  const ubicacion = [
    product.municipio || product.municipio_custom,
    product.departamento || product.departamento_custom,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-[#f6f2ea] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-20">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-start">

          <div className="md:sticky md:top-24">
            <ProductGallery imagenes={imagenes} titulo={product.nombre} />
          </div>

          <div className="space-y-0">
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

            <div className="mt-6">
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

        </div>

        <div className="mt-20 border-t border-[#0d2d20]/10 pt-16">
          <ArtisanStory
            ubicacion={ubicacion}
            nombreArtesano={vendedor.nombre_comercio}
          />
        </div>

        <div className="mt-16 border-t border-[#0d2d20]/10 pt-16">
          <HowToUse
            categoria={product.categoria?.nombre ?? product.categoria_custom}
          />
        </div>

        <div className="mt-16 border-t border-[#0d2d20]/10 pt-16" id="reviews">
          <ProductReviews productId={product.id} />
        </div>

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
