// src/components/home/HeroSection.tsx

import Image from "next/image";
import Link from "next/link";

type TrendingProducto = {
  id: string;
  nombre: string;
  imagen_url?: string | null;
};

type Props = {
  trendingProducts: TrendingProducto[];
};

export default function HeroSection({ trendingProducts }: Props) {
  const hasProducts = trendingProducts && trendingProducts.length > 0;

  const mainProduct = trendingProducts?.[0];
  const secondProduct = trendingProducts?.[1];
  const thirdProduct = trendingProducts?.[2];

  return (
    <section className="relative bg-gradient-to-b from-[#f6f2ea] via-[#efe6d7] to-[#ece1d2] py-36 px-6 md:px-16 overflow-hidden">

      {/* Matiz verde oscuro sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(13,45,32,0.06),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-20">

        {/* TEXTO */}
        <div className="space-y-8 text-center lg:text-left">

          <h1 className="text-4xl md:text-6xl leading-[1.1] font-medium tracking-tight text-neutral-900">
            La tradición guatemalteca, ahora en{" "}
            <span className="text-[#0d2d20]">formato digital.</span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-600 max-w-xl leading-relaxed mx-auto lg:mx-0">
            Una plataforma cultural que reúne artesanía y diseño tradicional
            en un catálogo digital cuidadosamente seleccionado.
          </p>

          <div>
            <Link href="/productos">
              <button className="bg-[#d97706] hover:bg-[#b45309] text-white px-10 py-4 rounded-full text-lg font-medium transition-all shadow-sm hover:shadow-md">
                Explorar el catálogo
              </button>
            </Link>
          </div>

          {/* Línea decorativa más intencional */}
          <div className="h-[2px] w-24 bg-gradient-to-r from-[#0d2d20] via-[#1f4a36] to-[#0d2d20] mx-auto lg:mx-0 rounded-full" />

          <p className="text-sm text-neutral-500 tracking-wide">
            Digitalizando el comercio cultural en Guatemala.
          </p>

        </div>

        {/* IMÁGENES */}
        <div className="relative flex justify-center lg:justify-end">

          {!hasProducts && (
            <div className="rounded-3xl overflow-hidden shadow-lg w-[420px] h-[420px] bg-neutral-200 flex items-center justify-center text-neutral-500 text-lg">
              Catálogo cultural en desarrollo
            </div>
          )}

          {hasProducts && (
            <>
              {/* Imagen principal */}
              <div className="relative rounded-3xl overflow-hidden shadow-lg w-[420px] h-[420px]">

                {/* Halo verde muy sutil detrás */}
                <div className="absolute -inset-6 rounded-full bg-[#0d2d20] opacity-5 blur-3xl" />

                <Image
                  src={
                    mainProduct?.imagen_url ||
                    "/images/productos/default.jpg"
                  }
                  alt={mainProduct?.nombre || "Producto destacado"}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full relative"
                  priority
                />
              </div>

              {secondProduct && (
                <div className="absolute -top-10 -right-6 w-[180px] h-[180px] rounded-3xl overflow-hidden shadow-md">
                  <Image
                    src={
                      secondProduct.imagen_url ||
                      "/images/productos/default.jpg"
                    }
                    alt={secondProduct.nombre}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              {thirdProduct && (
                <div className="absolute -bottom-14 left-12 w-[240px] h-[240px] rounded-3xl overflow-hidden shadow-md">
                  <Image
                    src={
                      thirdProduct.imagen_url ||
                      "/images/productos/default.jpg"
                    }
                    alt={thirdProduct.nombre}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}