// src/components/home/ShopCard.tsx

import Link from "next/link";
import FallbackImg from "@/components/FallbackImg";

type Tienda = {
  id: number; // 🔥 no user_id
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
    <div className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-center border border-neutral-100 hover:border-orange-200">

      <div className="flex justify-center mb-6">
        <FallbackImg
          src={tienda.logo_url}
          fallback="/images/tiendas/default.jpg"
          alt={nombre}
          className="w-24 h-24 rounded-full object-cover border-4 border-neutral-100 group-hover:border-orange-200 transition-all"
        />
      </div>

      <h3 className="font-semibold text-lg text-neutral-900 group-hover:text-orange-600 transition-colors">
        {nombre}
      </h3>

      <p className="text-sm text-neutral-500 mt-1">
        {tienda.departamento}
        {tienda.municipio ? `, ${tienda.municipio}` : ""}
      </p>

      <div className="mt-4 text-yellow-500 text-sm">
        ★★★★☆
      </div>

      <Link
        href={`/store/${tienda.id}`}
        className="inline-block mt-6 text-orange-600 font-medium hover:underline"
      >
        Ver tienda →
      </Link>
    </div>
  );
}