import Image from "next/image";
import ProductCard from "@/components/ui/ProductCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

async function fetchSeller(id: string) {
  try {
    const res = await fetch(`${API}/api/public/seller/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (err) {
    console.error("Error fetching seller:", err);
    return null;
  }
}

export default async function SellerPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await fetchSeller(params.id);

  if (!data) {
    return (
      <div className="py-20 text-center text-lg">
        Tienda no encontrada
      </div>
    );
  }

  const { seller, products, stats } = data;

  return (
    <div className="container mx-auto px-4 py-10 space-y-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-neutral-100">
          <Image
            src={seller.logo || "/images/tiendas/default.jpg"}
            alt={seller.nombre_comercio}
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold">
            {seller.nombre_comercio}
          </h1>

          <p className="text-neutral-600">
            {seller.descripcion}
          </p>

          <div className="text-sm text-neutral-600">
            ⭐ {seller.rating_avg.toFixed(1)} ({seller.rating_count} reseñas)
          </div>

          <div className="text-sm text-neutral-600">
            📍 {seller.municipio}, {seller.departamento}
          </div>

          <div className="text-sm font-medium text-green-600">
            🟢 Tienda verificada
          </div>

          <div className="text-sm text-neutral-500">
            {stats.total_products} productos activos
          </div>
        </div>
      </div>

      {/* PRODUCTOS */}
      <div>
        <h2 className="text-xl font-semibold mb-6">
          Productos del vendedor
        </h2>

        {products.length === 0 ? (
          <p className="text-neutral-500">
            Este vendedor aún no tiene productos activos.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
