"use client";

// src/components/home/SellerCTASection.tsx

import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";

export default function SellerCTASection() {
  return (
    <section className="relative bg-[#f6f2ea] py-28 border-t border-[#0d2d20]/10 overflow-hidden">

      {/* Background atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span
          className="
          font-serif
          text-[240px] md:text-[360px] lg:text-[420px]
          text-[#0d2d20]/5
          tracking-tight
        "
        >
          FJ
        </span>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 md:px-12 space-y-12 text-center">

        {/* Header */}
        <SectionHeader
          eyebrow="Comunidad Flowjuyu"
          title="Tu tienda también puede ser parte de Flowjuyu"
        />

        {/* Divider */}
        <div className="flex justify-center">
          <div className="w-10 h-[1px] bg-gradient-to-r from-[#0d2d20]/40 to-[#0d2d20]/10" />
        </div>

        {/* Body */}
        <p className="max-w-xl mx-auto text-[15px] md:text-[16px] leading-relaxed text-[#0d0d0b]/60 font-light">
          Estamos construyendo una plataforma para mostrar la riqueza textil de
          Guatemala al mundo. Si eres artesano o tienes una tienda de textiles,
          puedes formar parte de esta primera etapa.
        </p>

        {/* Micro benefits */}
        <div className="flex flex-wrap justify-center gap-6 pt-4 text-[12px] tracking-[0.18em] uppercase text-[#0d2d20]/60">
          <span>Perfil digital</span>
          <span>•</span>
          <span>Visibilidad nacional</span>
          <span>•</span>
          <span>Comunidad artesanal</span>
        </div>

        {/* CTA */}
        <div className="pt-6">
          <Link
            href="/sell"
            className="
            group
            inline-flex
            items-center
            gap-3
            bg-[#0d2d20]
            text-white
            uppercase
            tracking-[0.28em]
            text-[11px]
            px-10 py-4
            rounded-sm
            transition-all
            duration-300
            hover:bg-[#163a2b]
            hover:shadow-xl
          "
          >
            Conocer cómo vender

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Footnote */}
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#0d0d0b]/30 pt-4">
          Fase piloto · Primeros artesanos invitados
        </p>

      </div>
    </section>
  );
}