"use client";

// src/components/home/SellerCTASection.tsx

import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";

export default function SellerCTASection() {
  return (
    <section className="relative bg-[#f6f2ea] py-24 border-t border-[#0d2d20]/10 overflow-hidden">

      {/* Background atmosphere */}
      <div
        aria-hidden
        className="
        absolute inset-0
        flex items-center justify-center
        pointer-events-none
        select-none
      "
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

        {/* Header (same system as other sections) */}
        <SectionHeader
          eyebrow="Comunidad Flowjuyu"
          title="Convierte tu tradición en un negocio digital"
        />

        {/* Divider */}
        <div className="flex justify-center">
          <div className="w-10 h-[1px] bg-gradient-to-r from-[#0d2d20]/40 to-[#0d2d20]/10" />
        </div>

        {/* Body copy */}
        <p className="max-w-xl mx-auto text-[15px] md:text-[16px] leading-relaxed text-[#0d0d0b]/60 font-light">
          Publica tus piezas, comparte la historia de tus tejidos y conecta
          con compradores que buscan auténtica artesanía guatemalteca.
        </p>

        {/* CTA */}
        <div className="pt-4">
          <Link
            href="/register/seller"
            className="
            inline-block
            bg-[#0d2d20]
            text-white
            uppercase
            tracking-[0.28em]
            text-[11px]
            px-10 py-4
            rounded-sm
            transition
            hover:bg-[#163a2b]
            hover:shadow-lg
          "
          >
            Crear mi tienda
          </Link>
        </div>

        {/* Footnote */}
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#0d0d0b]/30 pt-4">
          Sin comisiones iniciales · 100% guatemalteco
        </p>

      </div>
    </section>
  );
}