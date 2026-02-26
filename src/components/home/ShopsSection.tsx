// src/components/home/ShopsSection.tsx

import SectionHeader from "@/components/ui/SectionHeader";
import ShopCard from "./ShopCard";

export type Tienda = {
  id: number;
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

  if (!Array.isArray(tiendas) || tiendas.length === 0) {
    return null;
  }

  return (
    <section className="relative py-28 px-6 md:px-16 bg-[#f3ece2] overflow-hidden">

      {/* Fondo sutil cultural */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#e9dfd1] opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-16">

        <SectionHeader
          eyebrow="Emprendimientos culturales"
          title="Tiendas destacadas en Flowjuyu"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
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