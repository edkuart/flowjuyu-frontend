// src/components/home/NewProductsSection.tsx

import ProductCard from "@/components/ui/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
};

type Props = {
  nuevosProductos: Producto[];
};

export default function NewProductsSection({
  nuevosProductos,
}: Props) {
  if (!nuevosProductos || nuevosProductos.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 md:px-12 bg-[#f6f2ea]">
      <div className="max-w-7xl mx-auto space-y-12">

        <SectionHeader
          eyebrow="Catálogo en expansión"
          title="Nuevas incorporaciones"
          linkHref="/productos?sort=new"
          linkLabel="Ver todo el catálogo"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {nuevosProductos.slice(0, 5).map((p) => (
            <ProductCard
              key={p.id}
              product={p}
            />
          ))}
        </div>

      </div>
    </section>
  );
}