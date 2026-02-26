// src/components/home/ShopCard.tsx

import Link from "next/link";
import FallbackImg from "@/components/FallbackImg";

type Tienda = {
  id: number;
  nombre?: string | null;
  nombre_comercio?: string | null;
  logo_url?: string | null;
  departamento?: string | null;
  municipio?: string | null;
};

type Props = {
  tienda: Tienda;
};

export default function ShopCard({ tienda }: Props): React.ReactElement {
  const nombre =
    tienda.nombre_comercio || tienda.nombre || "Tienda";

  return (
    <div className="group relative bg-white rounded-3xl p-10 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center border border-neutral-200 overflow-hidden">

      {/* Hover cultural (verde + ámbar muy sutil) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d2d20]/5 to-[#d97706]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Logo */}
      <div className="relative flex justify-center mb-8">
        <FallbackImg
          src={tienda.logo_url}
          fallback="/images/tiendas/default.jpg"
          alt={nombre}
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:shadow-lg transition-all duration-500"
        />
      </div>

      {/* Nombre */}
      <h3 className="relative font-semibold text-xl text-neutral-900 group-hover:text-[#0d2d20] transition-colors duration-300">
        {nombre}
      </h3>

      {/* Ubicación */}
      {(tienda.departamento || tienda.municipio) && (
        <p className="relative text-sm text-neutral-500 mt-2 tracking-wide">
          {tienda.departamento}
          {tienda.municipio ? `, ${tienda.municipio}` : ""}
        </p>
      )}

      {/* Línea cultural animada */}
      <div className="relative h-[2px] w-12 bg-gradient-to-r from-[#0d2d20] via-[#d97706] to-[#0d2d20] mx-auto my-6 group-hover:w-20 transition-all duration-500 rounded-full" />

      {/* Link */}
      <Link
        href={`/store/${tienda.id}`}
        className="relative inline-block text-sm font-semibold text-[#0d2d20] tracking-wide opacity-80 group-hover:opacity-100 transition-all"
      >
        Ver tienda →
      </Link>
    </div>
  );
}