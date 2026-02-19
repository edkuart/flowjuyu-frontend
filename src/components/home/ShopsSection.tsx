//src/components/home/ShopsSection.tsx

import SectionHeader from "@/components/ui/SectionHeader";
import ShopCard from "./ShopCard";

type Tienda = {
  id: number;
  nombre?: string | null;
  nombre_comercio?: string | null;
  logo_url?: string | null;
  departamento?: string | null;
  municipio?: string | null;
};

type Props = {
  tiendas: Tienda[];
};

export default function ShopsSection({
  tiendas,
}: Props): React.ReactElement {
  return (
    <section className="py-20 px-6 md:px-16 bg-[#faf8f4]">
      <div className="max-w-7xl mx-auto space-y-12">

        <SectionHeader
          eyebrow="Confianza y calidad"
<<<<<<< HEAD
          title="⭐ Tiendas mejor valoradas"
=======
          title=" Tiendas mejor valoradas"
>>>>>>> filtros
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {tiendas.slice(0, 4).map((tienda) => (
            <ShopCard key={tienda.id} tienda={tienda} />
          ))}
        </div>

      </div>
    </section>
  );
}