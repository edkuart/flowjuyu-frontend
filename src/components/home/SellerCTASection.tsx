// src/components/home/SellerCTASection.tsx

import Link from "next/link";

export default function SellerCTASection() {
  return (
    <section className="py-28 px-6 md:px-16 bg-gradient-to-br from-[#f3ece3] to-[#efe4d6] border-t border-[#e6dfd4]">
      <div className="max-w-5xl mx-auto text-center space-y-10">

        {/* Eyebrow */}
        <p className="text-sm uppercase tracking-[0.2em] font-semibold text-[#0f2e22]">
          Comunidad Flowjuyu
        </p>

        {/* Título principal */}
        <h3 className="text-3xl md:text-5xl font-semibold leading-tight text-neutral-900">
          Convierte tu tradición en un negocio digital
        </h3>

        {/* Subtexto */}
        <p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          Artesanos y emprendedores culturales están llevando sus productos
          más allá de su comunidad. Publica tus piezas, conecta con nuevos
          compradores y forma parte del mercado cultural guatemalteco.
        </p>

        {/* Línea decorativa */}
        <div className="w-16 h-[3px] bg-amber-500 mx-auto rounded-full opacity-80" />

        {/* Botón */}
        <Link href="/register/seller">
          <button className="bg-[#0f2e22] hover:bg-[#163a2b] text-white font-semibold px-12 py-4 rounded-full text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            Crear mi tienda
          </button>
        </Link>

      </div>
    </section>
  );
}