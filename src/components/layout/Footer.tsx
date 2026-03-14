"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#0f2e22] to-[#184c37] text-white mt-24">

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">

        <div className="grid md:grid-cols-4 gap-10">

          {/* Marca */}
          <div>
            <h3 className="font-serif text-xl mb-3">
              Flowjuyu
            </h3>

            <p className="text-sm text-white/70 leading-relaxed">
              Plataforma dedicada a conectar artesanos guatemaltecos
              con compradores que valoran la tradición textil.
            </p>
          </div>

          {/* Explorar */}
          <div className="space-y-2 text-sm">

            <p className="text-white/80 font-medium mb-3">
              Explorar
            </p>

            <Link
              href="/productos"
              className="block text-white/60 hover:text-white transition"
            >
              Explorar catálogo
            </Link>

            <Link
              href="/new-arrivals"
              className="block text-white/60 hover:text-white transition"
            >
              Lo más nuevo
            </Link>

            <Link
              href="/sell"
              className="block text-white/60 hover:text-white transition"
            >
              Vender en Flowjuyu
            </Link>

          </div>

          {/* Ayuda */}
          <div className="space-y-2 text-sm">

            <p className="text-white/80 font-medium mb-3">
              Ayuda
            </p>

            <Link
              href="/help/faq"
              className="block text-white/60 hover:text-white transition"
            >
              Preguntas frecuentes
            </Link>

            <Link
              href="/help/contact"
              className="block text-white/60 hover:text-white transition"
            >
              Contactar soporte
            </Link>

            <Link
              href="/help/returns"
              className="block text-white/60 hover:text-white transition"
            >
              Devoluciones
            </Link>

          </div>

          {/* Legal */}
          <div className="space-y-2 text-sm">

            <p className="text-white/80 font-medium mb-3">
              Legal
            </p>

            <Link
              href="/privacidad"
              className="block text-white/60 hover:text-white transition"
            >
              Política de privacidad
            </Link>

            <Link
              href="/terminos"
              className="block text-white/60 hover:text-white transition"
            >
              Términos y condiciones
            </Link>

          </div>

        </div>

        {/* Barra inferior */}
        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-white/40 flex justify-between flex-wrap gap-4">

          <span>
            © {new Date().getFullYear()} Flowjuyu
          </span>

          <span>
            Hecho en Guatemala 🇬🇹
          </span>

        </div>

      </div>

    </footer>
  );
}