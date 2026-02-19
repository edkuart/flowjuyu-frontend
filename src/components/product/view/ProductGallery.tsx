// src/components/product/view/ProductGallery.tsx

"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";

type ProductGalleryProps = {
  imagenes: string[]; // 🔥 ahora es string[]
  titulo: string;
  isSeller?: boolean;
  onMakePrincipal?: (url: string) => void;
};

export default function ProductGallery({
  imagenes = [],
  titulo,
  isSeller = false,
  onMakePrincipal,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(2);
  const [fullscreen, setFullscreen] = useState(false);
  const [fade, setFade] = useState(false);
  const [zoomShape, setZoomShape] = useState<"circle" | "square">("circle");

  const containerRef = useRef<HTMLDivElement | null>(null);

  // 🔥 limpiar valores falsy y duplicados
  const imageUrls = useMemo(() => {
    return [...new Set(imagenes.filter(Boolean))];
  }, [imagenes]);

  useEffect(() => {
    setActive(0);
  }, [imagenes]);

  if (!imageUrls.length) {
    return (
      <div className="w-full h-[500px] bg-neutral-100 flex items-center justify-center rounded-2xl">
        <p className="text-neutral-400">Sin imágenes</p>
      </div>
    );
  }

  const changeImage = (index: number) => {
    setFade(true);
    setTimeout(() => {
      setActive(index);
      setFade(false);
    }, 150);
  };

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPos({ x, y });
  };

  const prevImage = () =>
    changeImage(active > 0 ? active - 1 : imageUrls.length - 1);

  const nextImage = () =>
    changeImage(active < imageUrls.length - 1 ? active + 1 : 0);

  const onWheelZoom = (e: React.WheelEvent) => {
    setZoomLevel((z) =>
      Math.min(3.5, Math.max(1, z + (e.deltaY < 0 ? 0.15 : -0.15)))
    );
  };

  return (
    <>
      <div className="flex gap-6 select-none">

        {/* MINIATURAS */}
        <div className="flex flex-col gap-3">
          {imageUrls.map((src, index) => (
            <button
              key={index}
              onClick={() => changeImage(index)}
              className={`w-16 h-16 relative overflow-hidden rounded-lg border shadow-sm transition-all hover:scale-[1.05]
                ${index === active
                  ? "border-orange-600 shadow-md"
                  : "border-gray-300"
                }`}
            >
              <Image
                src={src}
                alt={`thumb-${titulo}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* IMAGEN PRINCIPAL */}
        <div
          ref={containerRef}
          className="relative w-full max-w-2xl h-[600px] rounded-2xl overflow-hidden bg-white shadow-md group transition cursor-zoom-in"
          onMouseMove={handleMove}
          onMouseEnter={() => setZoomVisible(true)}
          onMouseLeave={() => setZoomVisible(false)}
          onWheel={onWheelZoom}
          onClick={() => setFullscreen(true)}
        >
          <Image
            key={active}
            src={imageUrls[active]}
            alt={titulo}
            fill
            className={`object-contain transition-all duration-300 ${
              fade ? "opacity-0" : "opacity-100"
            }`}
          />

          {zoomVisible && (
            <div
              className="absolute pointer-events-none shadow-2xl border-2 border-white"
              style={{
                width: zoomShape === "circle" ? "200px" : "220px",
                height: zoomShape === "circle" ? "200px" : "220px",
                borderRadius: zoomShape === "circle" ? "50%" : "12px",
                top: `${zoomPos.y}%`,
                left: `${zoomPos.x}%`,
                transform: "translate(-50%, -50%)",
                backgroundImage: `url(${imageUrls[active]})`,
                backgroundSize: `${zoomLevel * 100}%`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white px-3 py-2 rounded-full shadow"
          >
            ‹
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white px-3 py-2 rounded-full shadow"
          >
            ›
          </button>
        </div>
      </div>

      {/* TOGGLE ZOOM */}
      <div className="mt-3">
        <button
          onClick={() =>
            setZoomShape((prev) => (prev === "circle" ? "square" : "circle"))
          }
          className="px-4 py-2 bg-neutral-100 border rounded-lg hover:bg-neutral-200 transition"
        >
          Cambiar lupa ({zoomShape === "circle" ? "🔵 Circular" : "🔶 Cuadrada"})
        </button>
      </div>

      {/* FULLSCREEN */}
      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          <div className="relative w-[90%] max-w-5xl aspect-square">
            <Image
              src={imageUrls[active]}
              alt="fullscreen"
              fill
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
