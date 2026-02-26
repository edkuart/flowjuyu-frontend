"use client";

import Link from "next/link";
import Carousel from "@/components/Carousel";
import FallbackImg from "@/components/FallbackImg";
import { Categoria } from "@/types/home";
import SectionHeader from "@/components/ui/SectionHeader";

type Props = {
  categorias: Categoria[];
};

export default function CategoriesSection({ categorias }: Props) {
  return (
    <section className="py-20 px-4 md:px-12 bg-[#f6f2ea]">
      <div className="max-w-7xl mx-auto space-y-12">

        <SectionHeader
          eyebrow="Explora por estilo"
          title="Tejidos y expresiones culturales"
          linkHref="/categorias"
          linkLabel="Ver todas"
        />

        {categorias.length > 0 ? (
          <Carousel itemsVisible={5} itemWidth={240}>
            {categorias.slice(0, 20).map((cat: Categoria) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.id}`}
                className="flex-none w-[240px]"
              >
                <div className="group rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-500 border border-neutral-100 hover:border-amber-300">

                  {/* Imagen */}
                  <div className="overflow-hidden">
                    <FallbackImg
                      src={cat.imagen_url}
                      fallback="/images/categorias/default.jpg"
                      alt={cat.nombre}
                      className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Nombre */}
                  <div className="py-5 text-center relative">

                    {/* Línea decorativa cultural */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-amber-500 opacity-70 group-hover:w-16 transition-all duration-300" />

                    <p className="mt-3 font-semibold text-neutral-800 group-hover:text-[#0f2e22] transition-colors tracking-wide">
                      {cat.nombre}
                    </p>

                  </div>

                </div>
              </Link>
            ))}
          </Carousel>
        ) : (
          <p className="text-neutral-500">
            Próximamente nuevas categorías culturales.
          </p>
        )}

      </div>
    </section>
  );
}