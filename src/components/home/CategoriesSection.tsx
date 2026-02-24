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
    <section className="px-4 md:px-12">
      <div className="max-w-7xl mx-auto space-y-10">

        <SectionHeader
          eyebrow="Explora por estilo"
          title="Categorías"
          linkHref="/categorias"
          linkLabel="Ver todas"
        />

        {categorias.length > 0 ? (
          <Carousel itemsVisible={5} itemWidth={220}>
            {categorias.slice(0, 20).map((cat: Categoria) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.id}`}
                className="flex-none w-[220px]"
              >
                <div className="group rounded-2xl overflow-hidden bg-neutral-50 hover:bg-neutral-100 transition-all duration-300 shadow-sm hover:shadow-md">

                  <FallbackImg
                    src={cat.imagen_url}
                    fallback="/images/categorias/default.jpg"
                    alt={cat.nombre}
                    className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="py-4 text-center">
                    <p className="font-medium text-neutral-800 group-hover:text-orange-600 transition-colors">
                      {cat.nombre}
                    </p>
                  </div>

                </div>
              </Link>
            ))}
          </Carousel>
        ) : (
          <p className="text-gray-500">No hay categorías disponibles.</p>
        )}

      </div>
    </section>
  );
}
