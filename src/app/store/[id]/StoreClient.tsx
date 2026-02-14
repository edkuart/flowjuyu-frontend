// src/app/store/[id]/StoreClient.tsx

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ProductDiscoveryLayout from "@/components/product/discovery/ProductDiscoveryLayout";

type Producto = {
  id: string;
  nombre: string;
  precio: number | string;
  imagen_url?: string | null;
};

type Seller = {
  id: number;
  nombre_comercio: string;
  descripcion?: string;
  logo?: string | null;
  departamento?: string;
  municipio?: string;
  rating_avg?: number;
  rating_count?: number;
};

export default function StoreClient({
  seller,
  initialProducts,
}: {
  seller: Seller;
  initialProducts: Producto[];
}) {
  // 🎛 filtros
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(2000);
  const [sort, setSort] = useState("");

  // ============================
  // FILTRADO + ORDEN EN MEMORIA
  // ============================
  const productos = useMemo(() => {
    let list = [...initialProducts];

    // 💰 filtro por precio
    list = list.filter((p) => {
      const precio = Number(p.precio);
      return precio >= precioMin && precio <= precioMax;
    });

    // 🔃 orden
    if (sort === "price_asc") {
      list.sort(
        (a, b) => Number(a.precio) - Number(b.precio)
      );
    }

    if (sort === "price_desc") {
      list.sort(
        (a, b) => Number(b.precio) - Number(a.precio)
      );
    }

    return list;
  }, [initialProducts, precioMin, precioMax, sort]);

  return (
    <ProductDiscoveryLayout
      title={seller.nombre_comercio}
      subtitle={seller.descripcion}
      total={productos.length}
      precioMin={precioMin}
      precioMax={precioMax}
      setPrecioMin={setPrecioMin}
      setPrecioMax={setPrecioMax}
      sort={sort}
      setSort={setSort}
      onReset={() => {
        setPrecioMin(0);
        setPrecioMax(2000);
        setSort("");
      }}
    >
      {/* 🏪 HEADER VENDEDOR */}
      <div className="flex items-center gap-6 mb-10">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border bg-neutral-100">
          <Image
            src={seller.logo || "/placeholder.jpg"}
            alt={seller.nombre_comercio}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            {seller.nombre_comercio}
          </h1>

          {seller.descripcion && (
            <p className="text-neutral-600">
              {seller.descripcion}
            </p>
          )}

          {(seller.municipio || seller.departamento) && (
            <p className="text-sm text-neutral-500 mt-1">
              📍 {seller.municipio}, {seller.departamento}
            </p>
          )}

          {typeof seller.rating_avg === "number" && (
            <p className="text-sm mt-1">
              ⭐ {seller.rating_avg} ({seller.rating_count} reseñas)
            </p>
          )}
        </div>
      </div>

      {/* 🧱 GRID PRODUCTOS */}
      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productos.map((p) => {
          const precio = Number(p.precio);

          return (
            <Link key={p.id} href={`/product/${p.id}`}>
              <div className="bg-white border rounded-xl p-3 hover:shadow-md transition">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-neutral-100">
                  <Image
                    src={p.imagen_url || "/placeholder.jpg"}
                    alt={p.nombre}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                  />
                </div>

                <h3 className="font-medium line-clamp-2">
                  {p.nombre}
                </h3>

                <p className="font-bold mt-1">
                  Q{precio.toFixed(2)}
                </p>
              </div>
            </Link>
          );
        })}

        {productos.length === 0 && (
          <div className="col-span-full text-center text-neutral-500 py-12">
            Este vendedor no tiene productos con estos filtros.
          </div>
        )}
      </section>
    </ProductDiscoveryLayout>
  );
}
