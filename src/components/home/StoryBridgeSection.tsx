// src/components/home/StoryBridgeSection.tsx
//
// Pausa editorial entre secciones de producto.
// Sin grid, sin cards, sin CTA agresivo.
// Un solo pensamiento que invita a seguir.
//
// Propósito UX: romper el ritmo de "producto → producto → producto"
// con un momento de cultura. El usuario siente que está leyendo,
// no escaneando un catálogo. Eso genera curiosidad hacia abajo.

import Link from "next/link";

export default function StoryBridgeSection() {
  return (
    <section className="bg-[#0d2d20] py-20 md:py-28 overflow-hidden relative">

      {/* Textura de grano — consistente con el hero */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">

        {/* Ornamento superior */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="h-px w-12 bg-white/15" />
          <span className="text-[#d4a853]/60 text-[10px]">✦</span>
          <div className="h-px w-12 bg-white/15" />
        </div>

        {/* Frase principal — el centro de gravedad de la sección */}
        <blockquote>
          <p className="font-serif italic text-white text-[28px] md:text-[40px] lg:text-[48px] leading-[1.15] tracking-[-0.01em]">
            Lo que ves aquí tardó días, semanas,
            <br className="hidden md:block" />
            {" "}a veces meses en nacer.
          </p>
        </blockquote>

        {/* Subtítulo — contextualiza sin vender */}
        <p className="mt-6 text-white/40 text-[13px] md:text-[15px] leading-relaxed max-w-[42ch] mx-auto">
          Artesanía guatemalteca hecha a mano — una pieza a la vez,
          por familias que han conservado estas técnicas por generaciones.
        </p>

        {/* CTA suave — no "comprar", sino "explorar" */}
        <div className="mt-10">
          <Link
            href="/productos"
            className="
              inline-flex items-center gap-3
              text-[10px] uppercase tracking-[0.30em]
              text-white/50
              hover:text-white/90
              transition-colors duration-300
              border-b border-white/15
              hover:border-white/40
              pb-[3px]
            "
          >
            Explorar el catálogo
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden>
              <path
                d="M0 4H12M9 1L12.5 4L9 7"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* Ornamento inferior */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <div className="h-px w-8 bg-white/10" />
          <span className="text-white/15 text-[9px] uppercase tracking-[0.3em]">
            Guatemala · Hecho a mano
          </span>
          <div className="h-px w-8 bg-white/10" />
        </div>

      </div>
    </section>
  );
}
