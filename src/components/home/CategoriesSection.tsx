"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import FallbackImg from "@/components/FallbackImg";
import SectionHeader from "@/components/ui/SectionHeader";
import { Categoria } from "@/types/home";

type Props = {
  categorias: Categoria[];
};

export default function CategoriesSection({ categorias }: Props) {

  const trackRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;

    e.preventDefault();

    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = x - startX;

    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const onMouseUp = () => setIsDragging(false);

  const items = categorias.slice(0, 20);

  return (
    <section className="bg-[#f6f2ea] py-24 overflow-hidden">

      {/* MAIN GRID CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-12">

        {/* Header */}
        <SectionHeader
          eyebrow="Explora por estilo"
          title="Tejidos y expresiones culturales"
          linkHref="/categorias"
          linkLabel="Ver todas"
        />

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />

        {/* Track */}
        {items.length === 0 ? (

          <p className="text-sm text-[#0d0d0b]/40 tracking-wide">
            Próximamente nuevas categorías culturales.
          </p>

        ) : (

          <div
            ref={trackRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            className={`
              flex
              gap-6
              overflow-x-auto
              pb-2
              cursor-grab
              ${isDragging ? "cursor-grabbing" : ""}
            `}
          >

            {items.map((cat, i) => (

              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.id}`}
                className="group shrink-0 block"
                draggable={false}
              >

                <div
                  className="
                    relative
                    w-[180px] md:w-[220px]
                    aspect-[3/4]
                    rounded-sm
                    overflow-hidden
                    bg-[#e8e0d4]
                    shadow-sm
                    transition
                    hover:-translate-y-1
                    hover:shadow-lg
                  "
                >

                  <div className="absolute inset-0">
                    <FallbackImg
                      src={cat.imagen_url}
                      fallback="/images/categorias/default.jpg"
                      alt={cat.nombre}
                      className="
                        w-full
                        h-full
                        object-cover
                        transition-transform duration-700
                        group-hover:scale-[1.05]
                      "
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  <div className="absolute bottom-0 p-4 text-white">

                    <div className="h-px w-8 bg-white/50 mb-2 group-hover:w-12 transition-all" />

                    <p className="font-serif italic text-lg leading-tight">
                      {cat.nombre}
                    </p>

                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/60 mt-1">
                      Explorar
                    </p>

                  </div>

                  <span className="absolute top-3 right-3 text-[10px] tracking-widest text-white/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                </div>

              </Link>

            ))}

          </div>

        )}

        {/* Drag hint */}
        <div className="flex items-center gap-3 opacity-40">

          <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
            <path
              d="M0 5H8M12 5H20M6 1L10 5L6 9M14 1L10 5L14 9"
              stroke="#0d2d20"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </svg>

          <span className="text-[10px] uppercase tracking-[0.25em] text-[#0d2d20]">
            Desliza para explorar
          </span>

        </div>

      </div>

    </section>
  );
}