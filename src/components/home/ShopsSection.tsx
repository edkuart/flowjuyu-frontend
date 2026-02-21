// src/components/home/ShopsSection.tsx

import SectionHeader from "@/components/ui/SectionHeader";
import ShopCard from "./ShopCard";

export type Tienda = {
  id: number; // 🔥 siempre será user_id desde backend
  nombre?: string | null;
  nombre_comercio?: string | null;
  logo_url?: string | null;
  departamento?: string | null;
  municipio?: string | null;
  rating_avg?: number;
  total_reviews?: number;
};

type Props = {
  tiendas: Tienda[];
};

export default function ShopsSection({ tiendas }: Props) {

  console.log("🧠 TIENDAS RECIBIDAS:", tiendas);

  if (!Array.isArray(tiendas) || tiendas.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-6 md:px-16 bg-[#faf8f4]">
      <div className="max-w-7xl mx-auto space-y-12">

        <SectionHeader
          eyebrow="Confianza y calidad"
          title="Tiendas mejor valoradas"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {tiendas.slice(0, 4).map((tienda) => (
            <ShopCard
              key={tienda.id}
              tienda={tienda}
            />
          ))}
        </div>

      </div>
    </section>
  );
}