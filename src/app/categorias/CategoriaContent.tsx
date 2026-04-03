"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import ProductDiscoveryLayout from "@/components/product/discovery/ProductDiscoveryLayout";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { getProductImage } from "@/lib/getProductImage";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  imagenes?: { url: string }[];
};

type Categoria = {
  id: number;
  nombre: string;
};

export default function CategoriaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔎 filtros (desde URL)
  const [precioMin, setPrecioMin] = useState(
    Number(searchParams.get("precioMin") || 0)
  );
  const [precioMax, setPrecioMax] = useState(
    Number(searchParams.get("precioMax") || 2000)
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [departamento, setDepartamento] = useState(
    searchParams.get("departamento") || ""
  );
  const [municipio, setMunicipio] = useState(
    searchParams.get("municipio") || ""
  );

  // ============================
  // Cargar categorías (sidebar)
  // ============================
  useEffect(() => {
    fetch(`${API}/api/categorias`)
      .then((r) => r.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => setCategorias([]));
  }, []);

  // ============================
  // Sincronizar filtros → URL
  // ============================
  useEffect(() => {
    const params = new URLSearchParams();

    if (precioMin > 0) params.set("precioMin", String(precioMin));
    if (precioMax < 2000) params.set("precioMax", String(precioMax));
    if (sort) params.set("sort", sort);
    if (departamento) params.set("departamento", departamento);
    if (municipio) params.set("municipio", municipio);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [precioMin, precioMax, sort, departamento, municipio, router]);

  // ============================
  // Fetch productos por categoría
  // ============================
  useEffect(() => {
    if (!slug) return;

    async function loadProducts() {
      try {
        setLoading(true);

        const res = await fetch(
          `${API}/api/categorias/${slug}/productos?${searchParams.toString()}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        setCategoria(data.categoria || null);
        setProductos(Array.isArray(data.productos) ? data.productos : []);
      } catch (err) {
        console.error("Error cargando categoría:", err);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [slug, searchParams]);

  // ============================
  // Reset filtros
  // ============================
  const handleReset = () => {
    setPrecioMin(0);
    setPrecioMax(2000);
    setSort("");
    setDepartamento("");
    setMunicipio("");
  };

  return (
    <ProductDiscoveryLayout
      title={categoria?.nombre || "Categoría"}
      subtitle={`Explorando productos de ${categoria?.nombre || slug}`}
      total={productos.length}
      categorias={categorias} // solo para mostrar, no para cambiar
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
          gap-4 sm:gap-6
        "
      >
        {loading &&
          [...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white border rounded-xl p-3"
            >
              <div className="w-full aspect-square bg-neutral-200 rounded mb-3" />
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
            </div>
          ))}

        {!loading &&
          productos.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} className="group">
              <div className="bg-white border rounded-xl p-3 hover:shadow-md transition">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-neutral-100">
                  <Image
                    src={getProductImage(p)}
                    alt={p.nombre}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 right-2 z-10">
                    <FavoriteButton productId={p.id} size="sm" />
                  </div>
                </div>

                <h3 className="font-medium line-clamp-2">{p.nombre}</h3>
                <p className="font-bold mt-1">
                  Q{Number(p.precio).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}

        {!loading && productos.length === 0 && (
          <div className="col-span-full text-center text-neutral-500 py-12">
            No hay productos en esta categoría.
          </div>
        )}
      </section>
    </ProductDiscoveryLayout>
  );
}