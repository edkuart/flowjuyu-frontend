"use client";

// src/components/home/HeroSection.tsx

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type TrendingProducto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
};

type Props = {
  trendingProducts: TrendingProducto[];
};

const formatPrice = (precio: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(precio);

// Copy emocional — curiosidad y autenticidad, no transacción
const CAPTIONS = [
  "Donde el hilo\nguarda memoria.",
  "Cada pieza existe\nuna sola vez.",
  "Hecho por manos\nque recuerdan.",
];

export default function HeroSection({ trendingProducts }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = trendingProducts?.length
    ? trendingProducts.slice(0, 3).map((p, i) => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        imagen_url: p.imagen_url || "/images/productos/default.jpg",
        caption: CAPTIONS[i] ?? CAPTIONS[0],
      }))
    : [
        {
          id: "placeholder",
          nombre: "Artesanía guatemalteca",
          precio: 0,
          imagen_url: "/images/productos/default.jpg",
          caption: CAPTIONS[0],
        },
      ];

  const goTo = (index: number) => {
    if (index === activeIndex || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 450);
  };

  const goPrev = () => goTo((activeIndex - 1 + slides.length) % slides.length);
  const goNext = () => goTo((activeIndex + 1) % slides.length);

  const currentSlide = slides[activeIndex];
  const isPlaceholder = currentSlide.id === "placeholder";

  return (
    <section className="relative w-full h-[100svh] min-h-[560px] max-h-[920px] overflow-hidden bg-[#0d0d0b] fj-grain">

      {/* ── Imagen de fondo clickeable al producto ── */}
      <Link
        href={isPlaceholder ? "/productos" : `/product/${currentSlide.id}`}
        className="absolute inset-0 z-0 block"
        tabIndex={-1}
        aria-label={`Ver ${currentSlide.nombre}`}
      >
        <Image
          key={currentSlide.id}
          src={currentSlide.imagen_url!}
          alt={currentSlide.nombre}
          fill
          priority
          sizes="100vw"
          className={`object-cover object-center fj-kenburns fj-hero-image ${
            isTransitioning ? "transitioning" : "active"
          }`}
        />
      </Link>

      {/* ── Gradientes ── */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/88 via-black/20 to-black/10" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-black/25 to-transparent" />

      {/* ── Contenido inferior ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-12 lg:px-20 pb-10 md:pb-14">

        {/* Eyebrow */}
        <p className="fj-text-reveal text-white/50 text-[10px] uppercase tracking-[0.32em] mb-4">
          Artesanía guatemalteca · Hecho a mano
        </p>

        {/* Titular principal */}
        <h1
          key={`headline-${activeIndex}`}
          className="fj-text-reveal font-serif italic text-white text-[40px] md:text-[68px] lg:text-[84px] leading-[1.04] max-w-[15ch] whitespace-pre-line"
        >
          {currentSlide.caption}
        </h1>

        {/* Info de producto + CTAs */}
        <div
          key={`bottom-${activeIndex}`}
          className="fj-text-reveal mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
          {/* Info del producto activo */}
          {!isPlaceholder && (
            <div className="space-y-[6px]">
              <p className="text-white/90 font-serif italic text-lg md:text-xl leading-tight line-clamp-1">
                {currentSlide.nombre}
              </p>
              <p className="text-white/55 text-[12px] tracking-[0.18em]">
                {formatPrice(currentSlide.precio)}&nbsp;&nbsp;·&nbsp;&nbsp;Guatemala
              </p>
            </div>
          )}

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* CTA primario: ir al producto de la imagen */}
            {!isPlaceholder && (
              <Link
                href={`/product/${currentSlide.id}`}
                className="
                  inline-flex items-center gap-2
                  bg-white text-[#0d0d0b]
                  text-[10px] uppercase tracking-[0.24em] font-semibold
                  px-6 py-[14px]
                  hover:bg-white/90
                  transition-colors duration-200
                "
              >
                Ver esta pieza
              </Link>
            )}

            {/* CTA secundario: catálogo completo */}
            <Link
              href="/productos"
              className="
                inline-flex items-center gap-2
                text-white/75
                text-[10px] uppercase tracking-[0.24em]
                border border-white/25 px-6 py-[14px]
                hover:border-white/60 hover:text-white
                transition-colors duration-200
              "
            >
              Explorar todo
            </Link>
          </div>
        </div>

        {/* ── Navegación manual de slides ── */}
        {slides.length > 1 && (
          <div className="mt-8 flex items-center gap-5 relative">

            {/* Anterior */}
            <button
              onClick={goPrev}
              aria-label="Slide anterior"
              className="text-white/35 hover:text-white/80 transition-colors p-1 -ml-1"
            >
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
                <path d="M18 5H2M6 1L1 5L6 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex items-center gap-[10px]">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Ir a slide ${i + 1}`}
                  className={`transition-all duration-300 block ${
                    i === activeIndex
                      ? "w-7 h-[2px] bg-white rounded-full"
                      : "w-[5px] h-[5px] bg-white/30 hover:bg-white/55 rounded-full"
                  }`}
                />
              ))}
            </div>

            {/* Siguiente */}
            <button
              onClick={goNext}
              aria-label="Slide siguiente"
              className="text-white/35 hover:text-white/80 transition-colors p-1"
            >
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
                <path d="M0 5H16M12 1L17 5L12 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Scroll hint — centrado en la fila de dots para no ocupar espacio extra */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-[6px] pointer-events-none">
              <span className="text-[8px] uppercase tracking-[0.32em] text-white/30">
                Descubre
              </span>
              <svg
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                className="animate-bounce text-white/30"
              >
                <path
                  d="M1 1L6 6L11 1"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

          </div>
        )}

      </div>

    </section>
  );
}
