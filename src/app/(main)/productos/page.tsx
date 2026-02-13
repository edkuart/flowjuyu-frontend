"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import FilterSidebar from "@/components/product/FilterSidebar";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

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
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(2000);
  const [sort, setSort] = useState("");

  // Cargar categorías
  useEffect(() => {
    fetch(`${API}/api/categorias`)
      .then((r) => r.json())
      .then((data) => setCategorias(data || []))
      .catch(() => setCategorias([]));
  }, []);

  // Cargar productos con filtros
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (categoriaId)
          params.append("categoria_id", String(categoriaId));

        params.append("precioMin", String(precioMin));
        params.append("precioMax", String(precioMax));

        if (sort) params.append("sort", sort);

        const res = await fetch(
          `${API}/api/products?${params.toString()}`,
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
  }, [categoriaId, precioMin, precioMax, sort]);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 sm:px-6 lg:px-10 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Productos disponibles
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 self-start">
          <FilterSidebar
            categorias={categorias}
            categoriaId={categoriaId}
            setCategoriaId={setCategoriaId}
            precioMin={precioMin}
            precioMax={precioMax}
            setPrecioMin={setPrecioMin}
            setPrecioMax={setPrecioMax}
            sort={sort}
            setSort={setSort}
            onReset={() => {
              setCategoriaId(null);
              setPrecioMin(0);
              setPrecioMax(2000);
              setSort("");
            }}
          />
        </aside>

        {/* Productos */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {loading &&
            [...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white border rounded-lg p-4 shadow-sm"
              >
                <div className="w-full aspect-square bg-neutral-200 rounded-md mb-4" />
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-neutral-200 rounded w-1/2" />
              </div>
            ))}

          {!loading &&
            productos.map((p) => (
              <Link
                href={`/product/${p.id}`}
                key={p.id}
                className="block"
              >
                <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-4 cursor-pointer">
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-neutral-100">
                    <Image
                      src={p.imagen_url || "/placeholder.jpg"}
                      alt={p.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <h3 className="font-medium mt-3 line-clamp-1">
                    {p.nombre}
                  </h3>

                  <p className="text-orange-600 font-bold mt-1">
                    Q{Number(p.precio).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}

          {!loading && productos.length === 0 && (
            <p className="col-span-full text-center text-neutral-500">
              No hay productos disponibles.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
