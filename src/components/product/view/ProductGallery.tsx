"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";

type ProductGalleryProps = {
  imagenes: string[];
  titulo: string;
};

export default function ProductGallery({
  imagenes = [],
  titulo,
}: ProductGalleryProps) {

  const [active, setActive] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [fullscreen, setFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const imageUrls = useMemo(() => {
    return [...new Set(imagenes.filter(Boolean))];
  }, [imagenes]);

  useEffect(() => {
    setActive(0);
  }, [imagenes]);

  if (!imageUrls.length) {
    return (
      <div className="w-full aspect-[4/5] bg-neutral-100 flex items-center justify-center rounded-2xl">
        <p className="text-neutral-400">Sin imágenes</p>
      </div>
    );
  }

  const current = imageUrls[active];

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPos({ x, y });
  };

  const prev = () =>
    setActive((i) => (i === 0 ? imageUrls.length - 1 : i - 1));

  const next = () =>
    setActive((i) => (i === imageUrls.length - 1 ? 0 : i + 1));

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">

        {/* MINIATURAS */}
        <div className="flex lg:flex-col gap-3 overflow-x-auto">

          {imageUrls.map((img, i) => (

            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border
              ${i === active
                ? "border-[#0d2d20]"
                : "border-gray-300"}
              `}
            >

              <Image
                src={img}
                alt={`thumb-${titulo}`}
                fill
                className="object-cover"
              />

            </button>

          ))}

        </div>

        {/* IMAGEN + ZOOM */}
        <div className="flex gap-6">

          {/* IMAGEN PRINCIPAL */}
          <div
            ref={containerRef}
            className="relative w-[440px] aspect-[4/5] rounded-2xl overflow-hidden bg-white shadow-md cursor-zoom-in"
            onMouseMove={handleMove}
            onMouseEnter={() => setZoomVisible(true)}
            onMouseLeave={() => setZoomVisible(false)}
            onClick={() => setFullscreen(true)}
          >

            <Image
              src={current}
              alt={titulo}
              fill
              priority
              sizes="(max-width:768px) 100vw, 600px"
              className="object-cover"
            />

            {/* FLECHAS */}
            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center shadow"
                >
                  ‹
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center shadow"
                >
                  ›
                </button>
              </>
            )}

          </div>

          {/* ZOOM LATERAL */}
          {zoomVisible && (
            <div className="hidden lg:block relative w-[420px] aspect-[4/5] rounded-2xl overflow-hidden border shadow-xl bg-white">

              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${current})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "500%",
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                }}
              />

            </div>
          )}

        </div>

      </div>

      {/* FULLSCREEN VIEWER */}
      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          <div className="relative w-[95%] max-w-6xl aspect-square">

            <Image
              src={current}
              alt="fullscreen"
              fill
              className="object-contain"
            />

            <button
              className="absolute top-6 right-6 text-white text-3xl"
              onClick={() => setFullscreen(false)}
            >
              ✕
            </button>

          </div>
        </div>
      )}

    </>
  );
}