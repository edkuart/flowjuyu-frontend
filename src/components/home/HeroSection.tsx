//src/components/home/HeroSection.tsx

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
  return (
    <section className="bg-[#f8f5ef] py-28 px-6 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-16">

        {/* TEXTO */}
        <div className="space-y-6 text-center lg:text-left">
          <h1 className="text-5xl md:text-7xl leading-[1.05] font-semibold tracking-tight text-neutral-900">
            Descubre la riqueza textil de Guatemala
          </h1>

          <p className="text-lg md:text-xl text-neutral-600 max-w-xl leading-relaxed">
            Compra directamente a vendedores locales y explora diferentes estilos culturales en un solo mercado digital.
          </p>

          <Link href="/productos">
            <button className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-4 rounded-full text-lg font-medium shadow-md hover:shadow-lg transition-all">
              Explorar productos
            </button>
          </Link>
        </div>

        {/* IMÁGENES */}
        <div className="relative flex justify-center lg:justify-end">

          {trendingProducts.length >= 3 && (
            <>
              <div className="rounded-3xl overflow-hidden shadow-2xl w-[420px] h-[420px]">
                <Image
                  src={trendingProducts[0].imagen_url || "/images/productos/default.jpg"}
                  alt={trendingProducts[0].nombre}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="absolute -top-12 -right-8 w-[180px] h-[180px] rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src={trendingProducts[1].imagen_url || "/images/productos/default.jpg"}
                  alt={trendingProducts[1].nombre}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="absolute -bottom-16 left-14 w-[240px] h-[240px] rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src={trendingProducts[2].imagen_url || "/images/productos/default.jpg"}
                  alt={trendingProducts[2].nombre}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
            </>
          )}

        </div>
      </div>
    </section>
  );
}