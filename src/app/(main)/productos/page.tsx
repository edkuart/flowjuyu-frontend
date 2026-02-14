// src/app/(main)/productos/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import ProductDiscoveryLayout from "@/components/product/discovery/ProductDiscoveryLayout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
};

type Categoria = {
  id: number;
  nombre: string;
};

export default function ProductosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔎 FILTROS (inicializados desde URL)
  const [categoriaId, setCategoriaId] = useState<number | null>(
    searchParams.get("categoria")
      ? Number(searchParams.get("categoria"))
      : null
  );

  const [precioMin, setPrecioMin] = useState(
    Number(searchParams.get("precioMin") || 0)
  );

  const [precioMax, setPrecioMax] = useState(
    Number(searchParams.get("precioMax") || 2000)
  );

  const [sort, setSort] = useState(
    searchParams.get("sort") || ""
  );

  const [departamento, setDepartamento] = useState(
    searchParams.get("departamento") || ""
  );

  const [municipio, setMunicipio] = useState(
    searchParams.get("municipio") || ""
  );

  // ============================
  // Cargar categorías
  // ============================
  useEffect(() => {
    fetch(`${API}/api/categorias`)
      .then((r) => r.json())
      .then((data) => setCategorias(data || []))
      .catch(() => setCategorias([]));
  }, []);

  // ============================
  // Sincronizar filtros → URL
  // ============================
  useEffect(() => {
    const params = new URLSearchParams();

    if (categoriaId) params.set("categoria", String(categoriaId));
    if (precioMin > 0) params.set("precioMin", String(precioMin));
    if (precioMax < 2000) params.set("precioMax", String(precioMax));
    if (sort) params.set("sort", sort);
    if (departamento) params.set("departamento", departamento);
    if (municipio) params.set("municipio", municipio);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [
    categoriaId,
    precioMin,
    precioMax,
    sort,
    departamento,
    municipio,
    router,
  ]);

  // ============================
  // Fetch productos (URL = source of truth)
  // ============================
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const res = await fetch(
          `${API}/api/products?${searchParams.toString()}`,
          { cache: "no-store" }
        );

        const data = await res.json();
        const lista = data.data || data || [];

        setProductos(Array.isArray(lista) ? lista : []);
      } catch (error) {
        console.error("Error cargando productos:", error);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [searchParams]);

  // ============================
  // Reset filtros
  // ============================
  const handleReset = () => {
    setCategoriaId(null);
    setPrecioMin(0);
    setPrecioMax(2000);
    setSort("");
    setDepartamento("");
    setMunicipio("");
  };

  return (
    <ProductDiscoveryLayout
      title="Productos"
      subtitle="Explora productos artesanales de Guatemala"
      total={productos.length}
      categorias={categorias}
      categoriaId={categoriaId}
      setCategoriaId={setCategoriaId}
      precioMin={precioMin}
      precioMax={precioMax}
      setPrecioMin={setPrecioMin}
      setPrecioMax={setPrecioMax}
      sort={sort}
      setSort={setSort}
      departamento={departamento}
      setDepartamento={setDepartamento}
      municipio={municipio}
      setMunicipio={setMunicipio}
      onReset={handleReset}
    >
      {/* GRID DE PRODUCTOS */}
      <section
        className="
          grid
          grid-cols-2
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
          gap-3 sm:gap-6
        "
      >
        {loading &&
          [...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white border rounded-lg p-3 sm:p-4 shadow-sm"
            >
              <div className="w-full aspect-square bg-neutral-200 rounded-md mb-3" />
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
            </div>
          ))}

        {!loading &&
          productos.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="group block"
            >
              <div
                className="
                  bg-white
                  border
                  rounded-lg sm:rounded-xl
                  shadow-sm
                  hover:shadow-lg
                  transition
                  p-2 sm:p-4
                  h-full flex flex-col
                "
              >
                <div className="relative w-full aspect-square rounded-md overflow-hidden bg-neutral-100 mb-2 sm:mb-4">
                  <Image
                    src={p.imagen_url || "/placeholder.jpg"}
                    alt={p.nombre}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <h3 className="text-sm sm:text-base font-medium line-clamp-2">
                  {p.nombre}
                </h3>

                <div className="mt-auto pt-2">
                  <p className="text-base sm:text-lg font-bold">
                    Q{Number(p.precio).toFixed(2)}
                  </p>
                </div>
              </div>
            </Link>
          ))}

        {!loading && productos.length === 0 && (
          <div className="col-span-full py-12 text-center text-neutral-500">
            No encontramos productos con esos filtros.
          </div>
        )}
      </section>
    </ProductDiscoveryLayout>
  );
}
