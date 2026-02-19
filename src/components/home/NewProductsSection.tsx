//src/components/home/NewProductsSection.tsx

import Link from "next/link";
import FallbackImg from "@/components/FallbackImg";
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
  return (
    <section className="px-4 md:px-12">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <SectionHeader
          eyebrow="Recién agregados"
          title="Nuevos productos"
        />

        {/* Grid */}
        {nuevosProductos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {nuevosProductos.slice(0, 5).map((p) => (
                <ProductCard
                key={p.id}
                product={p}
                />
            ))}
            </div>
        ) : (
          <p className="text-gray-500">
            Aún no hay productos nuevos.
          </p>
        )}

      </div>
    </section>
  );
}
