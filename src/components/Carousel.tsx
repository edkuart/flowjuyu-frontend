"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselProps = {
  children: React.ReactNode;
  itemWidth?: number;
  itemsVisible?: number;
};

export default function Carousel({
  children,
  itemWidth = 240,
  itemsVisible = 5,
}: CarouselProps) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollAmount = itemWidth * itemsVisible;

  const scrollLeft = () => {
    if (ref.current)
      ref.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (ref.current)
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="relative w-full overflow-hidden">

      {/* Flecha izquierda */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow p-2 rounded-full hover:bg-gray-200"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Contenedor del carrusel */}
      <div
        ref={ref}
        className="
          flex gap-4
          overflow-x-auto
          overflow-y-hidden
          scroll-smooth
          no-scrollbar
          px-10
          items-center
          h-[220px]
        "
      >
        {children}
      </div>

      {/* Flecha derecha */}
      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow p-2 rounded-full hover:bg-gray-200"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

    </div>
  );
}
