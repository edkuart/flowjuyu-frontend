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
    <section className="bg-[#f6f2ea] py-32 px-6 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-20">

        {/* TEXTO */}
        <div className="space-y-8 text-center lg:text-left">
          <h1 className="text-4xl md:text-6xl leading-[1.1] font-medium tracking-tight text-neutral-900">
            Explora diferentes estilos en un solo mercado
          </h1>

          <p className="text-lg md:text-xl text-neutral-600 max-w-xl leading-relaxed mx-auto lg:mx-0">
            Vendedores locales reunidos en una plataforma donde puedes descubrir,
            comparar y comprar con tranquilidad.
          </p>

          <div>
            <Link href="/productos">
              <button className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-4 rounded-full text-lg font-medium transition-all shadow-sm hover:shadow-md">
                Explorar catálogo
              </button>
            </Link>
          </div>

          <div className="h-[2px] w-16 bg-rose-700 mx-auto lg:mx-0 rounded-full" />
        </div>

        {/* IMÁGENES */}
        <div className="relative flex justify-center lg:justify-end">

          {/* Caso: NO hay productos */}
          {!hasProducts && (
            <div className="rounded-3xl overflow-hidden shadow-lg w-[420px] h-[420px] bg-neutral-200 flex items-center justify-center text-neutral-500 text-lg">
              Próximamente productos destacados
            </div>
          )}

          {/* Caso: Hay al menos 1 */}
          {hasProducts && (
            <>
              {/* Imagen principal */}
              <div className="rounded-3xl overflow-hidden shadow-lg w-[420px] h-[420px]">
                <Image
                  src={mainProduct?.imagen_url || "/images/productos/default.jpg"}
                  alt={mainProduct?.nombre || "Producto destacado"}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>

              {/* Segunda imagen (si existe) */}
              {secondProduct && (
                <div className="absolute -top-10 -right-6 w-[180px] h-[180px] rounded-3xl overflow-hidden shadow-md">
                  <Image
                    src={secondProduct.imagen_url || "/images/productos/default.jpg"}
                    alt={secondProduct.nombre}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              {/* Tercera imagen (si existe) */}
              {thirdProduct && (
                <div className="absolute -bottom-14 left-12 w-[240px] h-[240px] rounded-3xl overflow-hidden shadow-md">
                  <Image
                    src={thirdProduct.imagen_url || "/images/productos/default.jpg"}
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