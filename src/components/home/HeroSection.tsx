"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type TrendingProducto = {
  id: string;
  nombre: string;
  imagen_url?: string | null;
};

type Props = {
  trendingProducts: TrendingProducto[];
};

const CAPTIONS = [
  "Guatemala,\ntejida a mano.",
  "El hilo que\nlo une todo.",
  "Hecho para\ndurar siempre.",
];

export default function HeroSection({ trendingProducts }: Props) {

  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const slides =
    trendingProducts?.length
      ? trendingProducts.slice(0, 3).map((p, i) => ({
          id: p.id,
          nombre: p.nombre,
          imagen_url: p.imagen_url || "/images/productos/default.jpg",
          caption: CAPTIONS[i] ?? CAPTIONS[0],
        }))
      : [
          {
            id: "placeholder",
            nombre: "Artesanía guatemalteca",
            imagen_url: "/images/productos/default.jpg",
            caption: CAPTIONS[0],
          },
        ];

  useEffect(() => {
    if (!mounted || slides.length <= 1) return;

    intervalRef.current = setInterval(() => {

      setIsTransitioning(true);

      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 700);

    }, 5500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

  }, [mounted, slides.length]);

  const currentSlide = slides[activeIndex];

  const imageClass = mounted
    ? `object-cover object-center fj-kenburns fj-hero-image ${
        isTransitioning ? "transitioning" : "active"
      }`
    : "object-cover object-center";

  return (
    <section className="relative w-full h-[100svh] min-h-[560px] max-h-[1080px] overflow-hidden bg-[#0d0d0b] fj-grain">

      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          key={currentSlide.id}
          src={currentSlide.imagen_url!}
          alt={currentSlide.nombre}
          fill
          priority
          sizes="100vw"
          className={imageClass}
        />
      </div>

      {/* gradient overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-black/30 to-transparent" />

      {/* top header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 lg:px-16 pt-8">

        <Link href="/" aria-label="Flowjuyu inicio">

          <span className="font-serif text-xl md:text-2xl tracking-[0.18em] text-white/90 uppercase">
            Flowjuyu
          </span>

        </Link>

        <Link
          href="/productos"
          className="hidden md:block text-xs uppercase tracking-[0.22em] text-white/60 hover:text-white transition"
        >
          Colección
        </Link>

      </header>

      {/* main text */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-12 lg:px-20 pb-16 md:pb-20">

        <p
          key={`label-${activeIndex}`}
          className={mounted ? "fj-text-reveal text-white/50 text-xs uppercase tracking-[0.30em] mb-4" : ""}
        >
          Artesanía guatemalteca
        </p>

        <h1
          key={`headline-${activeIndex}`}
          className={`font-serif italic text-white text-[42px] md:text-[72px] lg:text-[96px] leading-[1.05] max-w-[16ch] ${
            mounted ? "fj-text-reveal" : ""
          }`}
        >
          {currentSlide.caption}
        </h1>

        <div
          key={`cta-${activeIndex}`}
          className={`flex items-end justify-between flex-wrap gap-6 mt-10 ${
            mounted ? "fj-text-reveal" : ""
          }`}
        >

          <Link
            href="/productos"
            className="inline-flex items-center gap-3 text-white/90 uppercase text-xs tracking-[0.25em] border-b border-white/40 pb-[3px] hover:border-white hover:text-white transition"
          >

            Ver colección

            <svg width="16" height="10" viewBox="0 0 16 10">
              <path
                d="M0 5H14M10 1L14.5 5L10 9"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>

          </Link>

          {slides.length > 1 && (

            <div className="flex flex-col items-end gap-2">

              <div className="w-[80px] h-px bg-white/20 relative overflow-hidden">

                <div
                  key={`bar-${activeIndex}`}
                  className={mounted ? "fj-line-fill absolute left-0 top-0 h-full bg-white/70" : ""}
                />

              </div>

              <span className="text-[10px] text-white/40 tracking-[0.18em]">
                0{activeIndex + 1} / 0{slides.length}
              </span>

            </div>

          )}

        </div>

      </div>

      {/* scroll indicator */}
      <div className="hidden md:flex flex-col items-center gap-2 absolute right-10 bottom-16 z-20 opacity-40">

        <span className="text-[9px] uppercase tracking-[0.28em] text-white [writing-mode:vertical-rl]">
          Scroll
        </span>

        <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent" />

      </div>

    </section>
  );
}