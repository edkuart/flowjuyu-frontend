// src/app/store/[id]/StoreClient.tsx

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ProductDiscoveryLayout from "@/components/product/discovery/ProductDiscoveryLayout";

/* =====================================================
   TYPES
===================================================== */

type Producto = {
  id: string;
  nombre: string;
  precio: number | string;
  imagen_url?: string | null;
};

type SellerStats = {
  total_profile_views?: number;
  total_products?: number;
  total_reviews?: number;
};

type Seller = {
  id: number;
  nombre_comercio: string;
  descripcion?: string | null;
  logo?: string | null;
  departamento?: string | null;
  municipio?: string | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  estado_validacion?: string | null;
  stats?: SellerStats;
};

/* =====================================================
   COMPONENT
===================================================== */

export default function StoreClient({
  seller,
  initialProducts,
  previewMode = false,
}: {
  seller: Seller;
  initialProducts: Producto[];
  previewMode?: boolean;
}) {
  /* =============================
     FILTER STATE
  ============================== */

  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(2000);
  const [sort, setSort] = useState("");

  /* =============================
     FILTER + SORT
  ============================== */

  const productos = useMemo(() => {
    let list = [...initialProducts];

    list = list.filter((p) => {
      const precio = Number(p.precio);
      return precio >= precioMin && precio <= precioMax;
    });

    if (sort === "price_asc") {
      list.sort((a, b) => Number(a.precio) - Number(b.precio));
    }

    if (sort === "price_desc") {
      list.sort((a, b) => Number(b.precio) - Number(a.precio));
    }

    return list;
  }, [initialProducts, precioMin, precioMax, sort]);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <ProductDiscoveryLayout
      title={seller.nombre_comercio}
      subtitle={seller.descripcion ?? undefined}
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
      {/* =====================================================
          HERO ARTESANAL
      ===================================================== */}
      <div className="bg-[#f8f5ef] -mx-6 -mt-6 px-6 py-16 mb-16 border-b">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-10">

          {/* LOGO */}
          <div className="relative w-28 h-28 rounded-3xl overflow-hidden shadow-lg border bg-white">
            <Image
              src={seller.logo || "/placeholder.jpg"}
              alt={seller.nombre_comercio}
              fill
              className="object-cover"
            />
          </div>

          {/* INFO */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900">
                {seller.nombre_comercio}
              </h1>

              {seller.estado_validacion === "aprobado" && (
                <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                  Verificado
                </span>
              )}

              {previewMode && (
                <span className="text-xs px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                  Vista previa
                </span>
              )}
            </div>

            {seller.descripcion && (
              <p className="text-neutral-600 mt-4 max-w-2xl leading-relaxed">
                {seller.descripcion}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 mt-5 text-sm text-neutral-600">

              {(seller.municipio || seller.departamento) && (
                <span>
                  📍 {[seller.municipio, seller.departamento]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}

              {typeof seller.rating_avg === "number" && (
                <span>
                  ⭐ {seller.rating_avg.toFixed(1)} (
                  {seller.rating_count ?? 0} reseñas)
                </span>
              )}

              {seller.stats?.total_profile_views !== undefined && (
                <span>
                  👁 {seller.stats.total_profile_views} visitas
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          PRODUCT GRID
      ===================================================== */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {productos.map((p) => {
          const precio = Number(p.precio);

          return (
            <Link key={p.id} href={`/product/${p.id}`}>
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-neutral-100">
                  <Image
                    src={p.imagen_url || "/placeholder.jpg"}
                    alt={p.nombre}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <h3 className="font-medium text-neutral-900 line-clamp-2">
                  {p.nombre}
                </h3>

                <p className="font-semibold text-lg mt-2 tracking-tight">
                  Q{precio.toFixed(2)}
                </p>
              </div>
            </Link>
          );
        })}

        {productos.length === 0 && (
          <div className="col-span-full text-center text-neutral-500 py-16">
            Este vendedor no tiene productos con estos filtros.
          </div>
        )}
      </section>
    </ProductDiscoveryLayout>
  );
}
