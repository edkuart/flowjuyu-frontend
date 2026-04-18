"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { galleryMainUrl, galleryFullscreenUrl, thumbnailUrl } from "@/lib/imageUrl";

type ProductGalleryProps = {
  imagenes: string[];
  titulo: string;
};

export default function ProductGallery({
  imagenes = [],
  titulo,
}: ProductGalleryProps) {
  const [active, setActive]       = useState(0);
  const [zoomPos, setZoomPos]     = useState({ x: 50, y: 50 });
  const [zooming, setZooming]     = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const containerRef  = useRef<HTMLDivElement | null>(null);
  const touchStartX   = useRef(0);
  const touchStartY   = useRef(0);
  const swipeHandled  = useRef(false);

  const imageUrls = useMemo(
    () => [...new Set(imagenes.filter(Boolean))],
    [imagenes]
  );

  useEffect(() => { setActive(0); }, [imagenes]);

  const closeFullscreen = useCallback(() => setFullscreen(false), []);

  // ESC key closes fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeFullscreen(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreen, closeFullscreen]);

  // Lock body scroll while fullscreen is open
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [fullscreen]);

  if (!imageUrls.length) {
    return (
      <div className="w-full aspect-square bg-neutral-50 flex flex-col items-center justify-center rounded-2xl border border-neutral-100 gap-3">
        <span className="text-4xl opacity-30">🖼️</span>
        <p className="text-neutral-400 text-sm">Sin imágenes</p>
      </div>
    );
  }

  const current = imageUrls[active];
  const total   = imageUrls.length;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setZoomPos({
      x: ((e.clientX - rect.left)  / rect.width)  * 100,
      y: ((e.clientY - rect.top)   / rect.height) * 100,
    });
  };

  const prev = () => setActive((i) => (i === 0       ? total - 1 : i - 1));
  const next = () => setActive((i) => (i === total - 1 ? 0       : i + 1));

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current  = e.touches[0].clientX;
    touchStartY.current  = e.touches[0].clientY;
    swipeHandled.current = false;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only fire on clearly horizontal gestures (> 40px, more horizontal than vertical)
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      swipeHandled.current = true;
      if (dx < 0) next(); else prev();
    }
  }

  return (
    <>
      {/* ── OUTER LAYOUT: thumbnails left / main right ── */}
      <div className="flex flex-col-reverse lg:flex-row gap-3">

        {/* ── THUMBNAILS ── */}
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto flex-shrink-0">
          {imageUrls.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`relative flex-shrink-0 w-[64px] h-[80px] rounded-sm overflow-hidden border transition-all duration-150 bg-[#ede8e0] ${
                i === active
                  ? "border-[#0d2d20] opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <Image
                src={thumbnailUrl(img)}
                alt={`Vista ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* ── MAIN IMAGE ── */}
        <div
          ref={containerRef}
          className="relative flex-1 w-full aspect-[4/5] md:aspect-square bg-[#f5f4f2] overflow-hidden rounded-sm border border-[#0d2d20]/8 cursor-zoom-in group flex items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setZooming(true)}
          onMouseLeave={() => setZooming(false)}
          onClick={() => { if (!swipeHandled.current) setFullscreen(true); }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          {/* The image itself — zooms in-place on hover via transform (desktop only) */}
          <Image
            src={galleryMainUrl(current)}
            alt={titulo}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-contain object-center md:object-cover transition-transform duration-200 ease-out will-change-transform"
            style={{
              transform:       zooming ? "scale(2.2)" : "scale(1)",
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            }}
          />

          {/* Image counter */}
          {total > 1 && (
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
              <span className="bg-[#0d2d20]/60 backdrop-blur-sm text-white text-[10px] tracking-[0.18em] px-2.5 py-1 rounded-full tabular-nums">
                {active + 1} / {total}
              </span>
            </div>
          )}

          {/* Zoom hint — desktop only (cursor language irrelevant on touch) */}
          {!zooming && (
            <div className="absolute bottom-3 right-3 z-10 pointer-events-none hidden md:block">
              <span className="bg-[#0d2d20]/50 backdrop-blur-sm text-white/80 text-[9.5px] tracking-[0.18em] uppercase px-2.5 py-1.5 rounded-full">
                Ampliar
              </span>
            </div>
          )}

          {/* Nav arrows */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/85 backdrop-blur rounded-full w-9 h-9 flex items-center justify-center shadow-sm text-[#0d2d20]/70 hover:bg-white hover:text-[#0d2d20] transition-colors"
                aria-label="Imagen anterior"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/85 backdrop-blur rounded-full w-9 h-9 flex items-center justify-center shadow-sm text-[#0d2d20]/70 hover:bg-white hover:text-[#0d2d20] transition-colors"
                aria-label="Imagen siguiente"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}

          {/* Dot indicators — 44px tap target wrapping small visual dot */}
          {total > 1 && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex">
              {imageUrls.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActive(i); }}
                  aria-label={`Imagen ${i + 1}`}
                  className="h-11 px-1.5 flex items-center justify-center"
                >
                  <span className={`rounded-full transition-all duration-200 block ${
                    i === active
                      ? "w-5 h-2 bg-white shadow"
                      : "w-2 h-2 bg-white/50 hover:bg-white/80"
                  }`} />
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── FULLSCREEN VIEWER ── */}
      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center"
          onClick={closeFullscreen}
        >
          {/* Close button — prominent, always on top, never inside the image container */}
          <button
            onClick={(e) => { e.stopPropagation(); closeFullscreen(); }}
            className="absolute top-4 right-4 z-[10001] bg-black/60 hover:bg-black/80 border border-white/20 text-white rounded-full p-2.5 transition-colors"
            aria-label="Cerrar visor"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          {total > 1 && (
            <p className="absolute top-5 left-1/2 -translate-x-1/2 z-[10001] text-white/60 text-sm tabular-nums pointer-events-none">
              {active + 1} / {total}
            </p>
          )}

          {/* Image container — stop propagation so clicking the image itself doesn't close */}
          <div
            className="relative w-[92vw] h-[88vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={galleryFullscreenUrl(current)}
              alt={titulo}
              fill
              sizes="92vw"
              className="object-contain"
            />

            {total > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 border border-white/15 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors select-none"
                  aria-label="Imagen anterior"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 border border-white/15 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors select-none"
                  aria-label="Imagen siguiente"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
