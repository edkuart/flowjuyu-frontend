//src/components/home/SellerCTASection.tsx

import Link from "next/link";

export default function SellerCTASection() {
  return (
    <section className="py-28 px-6 md:px-16 bg-[#efe7db] border-t border-neutral-200">
      <div className="max-w-5xl mx-auto text-center space-y-8">

        <p className="text-sm uppercase tracking-widest font-semibold text-amber-600">
          Vende en Flowjuyu
        </p>

        <h3 className="text-3xl md:text-5xl font-semibold leading-tight text-neutral-900">
          Haz crecer tu negocio cultural
        </h3>

        <p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto">
          Conecta con compradores interesados en tradición, identidad y cultura.
          Publica tus productos y forma parte del mercado digital guatemalteco.
        </p>

        <Link href="/registro?vendedor=1">
          <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-10 py-4 rounded-full text-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            Crear mi tienda
          </button>
        </Link>

      </div>
    </section>
  );
}
