// src/components/home/ShopsSection.tsx

import ShopCard from "./ShopCard";
import SectionHeader from "@/components/ui/SectionHeader";

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
  if (!Array.isArray(tiendas) || tiendas.length === 0) return null;

  return (
    <section className="bg-[#f6f2ea] py-24">

      <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-12">

        {/* Header */}
        <SectionHeader
          eyebrow="Emprendimientos culturales"
          title="Tiendas destacadas en Flowjuyu"
        />

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />

        {/* Grid */}
        <div
          className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-5
          gap-6
        "
        >
          {tiendas.slice(0, 4).map((tienda, i) => (
            <ShopCard key={tienda.id} tienda={tienda} index={i} />
          ))}
        </div>

        {/* Ambient label */}
        <div className="flex items-center gap-4 pt-4">
          <div className="w-8 h-px bg-[#0d2d20]/20" />

          <span
            className="
            text-[10px]
            uppercase
            tracking-[0.28em]
            text-[#0d2d20]/40
          "
          >
            Artesanos verificados · Guatemala
          </span>
        </div>

      </div>

    </section>
  );
}