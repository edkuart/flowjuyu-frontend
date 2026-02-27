//src/app/store/[id]/StoreClient.tsx

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

type Seller = {
  id: number;
  nombre_comercio: string;
  descripcion?: string | null;
  logo?: string | null;
  departamento?: string | null;
  municipio?: string | null;
  banner_url?: string | null;

  identidad_tags?: string[] | null;
  productos_destacados?: string[] | null;

  mensaje_destacado?: string | null;

  created_at?: string | null;

  whatsapp?: string | null;
  plan?: "free" | "founder";
  plan_activo?: boolean;

  estado_validacion?: "pendiente" | "aprobado" | "rechazado";
};

/* =====================================================
   COMPONENT
===================================================== */

export default function StoreClient({
  seller,
  initialProducts,
}: {
  seller: Seller;
  initialProducts: Producto[];
}) {

  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(2000);
  const [sort, setSort] = useState("");

  /* =====================================================
     FILTROS + SORT
  ===================================================== */
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
     DESTACADOS
  ===================================================== */
  const destacados =
    seller.productos_destacados && seller.productos_destacados.length > 0
      ? productos.filter((p) =>
          seller.productos_destacados?.includes(p.id)
        )
      : [];

  /* =====================================================
     MEMBER SINCE
  ===================================================== */
  const memberSince = seller.created_at
    ? new Date(seller.created_at).getFullYear()
    : null;

  /* =====================================================
     WHATSAPP PREMIUM
  ===================================================== */
  const showWhatsapp =
    seller.plan === "founder" &&
    seller.plan_activo === true &&
    !!seller.whatsapp;

  const handleWhatsappClick = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/intentions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seller_id: seller.id,
            source: "store_whatsapp",
          }),
        }
      );

      const mensaje = `
  Hola 👋

  Estoy interesado en los productos de "${seller.nombre_comercio}" que vi en Flowjuyu.

  ¿Podrías brindarme más información?
      `.trim();

      const url = `https://wa.me/${seller.whatsapp}?text=${encodeURIComponent(
        mensaje
      )}`;

      window.open(url, "_blank");
    } catch (error) {
      console.error("Error registrando intención:", error);

      // fallback
      window.open(`https://wa.me/${seller.whatsapp}`, "_blank");
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <ProductDiscoveryLayout
      hideHeader={true}
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
          HERO CINEMÁTICO MEJORADO
      ===================================================== */}

      <div className="relative -mx-6 mb-20 overflow-hidden rounded-b-[40px]">

        {seller.banner_url ? (
          <div className="relative h-[340px] md:h-[520px] w-full">
            <Image
              src={seller.banner_url}
              alt="Banner tienda"
              fill
              className="object-cover"
              priority
            />

            {/* Capas visuales */}
            <div className="absolute inset-0 bg-emerald-900/70 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/60 via-emerald-900/40 to-emerald-800/60" />
          </div>
        ) : (
          <div className="h-[460px] bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800" />
        )}

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-6xl mx-auto px-6 pt-10 md:pt-0 text-white">

            <div className="flex items-center gap-8">

              {seller.logo && (
                <div className="relative w-28 h-28 md:w-48 md:h-48 rounded-3xl border-4 border-white shadow-2xl">
                  <Image
                    src={seller.logo}
                    alt={seller.nombre_comercio}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div>

                <h1 className="text-3xl md:text-6xl font-bold tracking-tight leading-tight">
                  {seller.nombre_comercio}
                </h1>

                <div className="mt-5 h-[4px] w-24 bg-amber-400 rounded-full" />

                {(seller.municipio || seller.departamento) && (
                  <p className="mt-5 text-sm opacity-90">
                    📍 {[seller.municipio, seller.departamento]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}

                {seller.mensaje_destacado && (
                  <p className="mt-6 max-w-2xl text-sm md:text-base opacity-95 leading-relaxed text-neutral-100">
                    {seller.mensaje_destacado}
                  </p>
                )}

                <div className="flex flex-wrap gap-6 text-sm mt-5 opacity-90">
                  <span>🛍 {productos.length} productos activos</span>
                  {memberSince && <span>📅 Desde {memberSince}</span>}
                </div>

                <div className="flex flex-wrap gap-3 mt-6">

                  {seller.estado_validacion === "aprobado" && (
                    <span className="inline-flex items-center gap-1 px-4 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow">
                      ✔ Vendedor verificado
                    </span>
                  )}

                  {seller.plan === "founder" && seller.plan_activo && (
                    <span className="px-4 py-1 bg-amber-500 text-black text-xs font-semibold rounded-full shadow">
                      Founder
                    </span>
                  )}

                </div>

                {showWhatsapp && (
                  <button
                    onClick={handleWhatsappClick}
                    className="inline-flex items-center gap-3 mt-8 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 border border-emerald-400/30 backdrop-blur-md rounded-full text-sm font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95"
                  >
                    <span className="text-lg">💬</span>
                    Contactar por WhatsApp
                  </button>
                )}

              </div>
            </div>

            {seller.identidad_tags && seller.identidad_tags.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-10">
                {seller.identidad_tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium hover:bg-white/25 transition"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* =====================================================
          DESTACADOS SHOWCASE
      ===================================================== */}

      {destacados.length > 0 && (
        <section className="mb-28">
          <h2 className="text-2xl font-semibold mb-12">
            Productos destacados
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {destacados.map((p, index) => (
              <Link key={p.id} href={`/product/${p.id}`}>
                <div
                  className={`group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-500 ${
                    index === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                >

                  <div className="relative aspect-[4/3]">
                    <Image
                      src={p.imagen_url || "/placeholder.jpg"}
                      alt={p.nombre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end p-8">
                    <div className="text-white">
                      <h3 className="text-xl font-semibold">
                        {p.nombre}
                      </h3>
                      <p className="text-sm opacity-80 mt-1">
                        Ver producto
                      </p>
                    </div>
                  </div>

                </div>
              </Link>
            ))}

          </div>
        </section>
      )}

      {/* =====================================================
          PRODUCT GRID PREMIUM
      ===================================================== */}

      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10">

        {productos.map((p) => {
          const precio = Number(p.precio);

          return (
            <Link key={p.id} href={`/product/${p.id}`}>
              <div className="group bg-white rounded-3xl border border-neutral-200 p-5 hover:shadow-2xl transition-all duration-500">

                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-5 bg-neutral-100">
                  <Image
                    src={p.imagen_url || "/placeholder.jpg"}
                    alt={p.nombre}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <h3 className="font-medium text-neutral-900 line-clamp-2">
                  {p.nombre}
                </h3>

                <p className="font-semibold text-xl mt-4 tracking-tight text-emerald-700">
                  Q{precio.toFixed(2)}
                </p>

              </div>
            </Link>
          );
        })}

        {productos.length === 0 && (
          <div className="col-span-full text-center text-neutral-500 py-20">
            Este vendedor aún no tiene productos activos.
          </div>
        )}

      </section>

    </ProductDiscoveryLayout>
  );
}