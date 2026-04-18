"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import FallbackImg from "@/components/FallbackImg";
import SectionHeader from "@/components/ui/SectionHeader";
import { useCategorias, type Categoria } from "@/hooks/useCategorias";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";
import type { SupportedLanguage } from "@/i18n/config";

interface CategoryDisplay {
  primary: string;
  secondary?: string;
}

function getCategoryDisplay(cat: Categoria, lang: SupportedLanguage): CategoryDisplay {
  if (lang === "es") {
    return { primary: cat.nombre };
  }

  const translated =
    lang === "kiche"     ? (cat.nombre_kiche     ?? null) :
    lang === "kaqchikel" ? (cat.nombre_kaqchikel ?? null) :
    lang === "qeqchi"    ? (cat.nombre_qeqchi    ?? null) :
    null;

  if (translated) {
    return { primary: translated, secondary: cat.nombre };
  }

  // Translation missing — show Spanish only, no secondary
  return { primary: cat.nombre };
}

function CategoriesSkeleton() {
  return (
    <div className="flex gap-6 overflow-x-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/4] w-[180px] shrink-0 animate-pulse rounded-sm bg-[#0d2d20]/8 md:w-[220px]"
        />
      ))}
    </div>
  );
}

export default function CategoriesSection() {
  const { data: categorias, loading } = useCategorias();
  const { dictionary, language } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

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
    trackRef.current.scrollLeft = scrollLeft - (x - startX);
  };

  const onMouseUp = () => setIsDragging(false);

  const items = categorias.slice(0, 20);

  return (
    <section className="relative overflow-hidden bg-[#f6f2ea] py-20 md:py-24">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0d2d20]/12 to-transparent" />
      <div className="mx-auto max-w-7xl space-y-12 px-4 md:px-12">
        <SectionHeader
          eyebrow={tr("home.categoriesEyebrow")}
          title={tr("home.categoriesTitle")}
          linkHref="/categorias"
          linkLabel={tr("home.categoriesLink")}
        />

        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />

        {loading ? (
          <CategoriesSkeleton />
        ) : items.length === 0 ? (
          <p className="text-sm tracking-wide text-[#0d0d0b]/40">
            {tr("home.categoriesEmpty")}
          </p>
        ) : (
          <div
            ref={trackRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            className={`flex cursor-grab gap-6 overflow-x-auto pb-2 ${
              isDragging ? "cursor-grabbing" : ""
            }`}
          >
            {items.map((cat, i) => {
              const { primary, secondary } = getCategoryDisplay(cat, language);
              return (
                <Link
                  key={cat.id}
                  href={`/productos?categoria=${cat.id}`}
                  className="group block shrink-0"
                  draggable={false}
                >
                  <div className="relative aspect-[3/4] w-[180px] overflow-hidden rounded-sm bg-[#e8e0d4] shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:w-[220px]">
                    <div className="absolute inset-0">
                      <FallbackImg
                        src={cat.imagen_url}
                        fallback="/images/categorias/default.jpg"
                        alt={cat.nombre}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute bottom-0 p-4 text-white">
                      <div className="mb-2 h-px w-8 bg-white/50 transition-all group-hover:w-12" />

                      <p className="font-serif text-lg leading-tight italic">
                        {primary}
                      </p>

                      {secondary && (
                        <p className="mt-0.5 text-[11px] text-white/40 leading-tight">
                          {secondary}
                        </p>
                      )}

                      <p className="mt-1 text-[10px] tracking-[0.22em] text-white/60 uppercase">
                        {tr("home.categoriesExplore")}
                      </p>
                    </div>

                    <span className="absolute top-3 right-3 text-[10px] tracking-widest text-white/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-3 opacity-40">
          <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
            <path
              d="M0 5H8M12 5H20M6 1L10 5L6 9M14 1L10 5L14 9"
              stroke="#0d2d20"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </svg>

          <span className="text-[10px] tracking-[0.25em] text-[#0d2d20] uppercase">
            {tr("home.categoriesDragHint")}
          </span>
        </div>
      </div>
    </section>
  );
}
