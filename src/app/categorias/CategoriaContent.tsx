"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProductDiscoveryLayout from "@/components/product/discovery/ProductDiscoveryLayout";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { getProductImage } from "@/lib/getProductImage";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";
import { getLocalizedField } from "@/lib/getLocalizedField";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

type Producto = {
  id: string;
  nombre: string;
  nombre_kiche?: string | null;
  nombre_kaqchikel?: string | null;
  nombre_qeqchi?: string | null;
  precio: number;
  imagen_url?: string | null;
  imagenes?: { url: string }[];
};

type Categoria = {
  id: number;
  nombre: string;
  nombre_kiche?: string | null;
  nombre_kaqchikel?: string | null;
  nombre_qeqchi?: string | null;
};

export default function CategoriaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { dictionary, language } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [precioMin, setPrecioMin] = useState(
    Number(searchParams.get("precioMin") || 0),
  );
  const [precioMax, setPrecioMax] = useState(
    Number(searchParams.get("precioMax") || 2000),
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [departamento, setDepartamento] = useState(
    searchParams.get("departamento") || "",
  );
  const [municipio, setMunicipio] = useState(
    searchParams.get("municipio") || "",
  );

  useEffect(() => {
    fetch(`${API}/api/categorias`)
      .then((r) => r.json())
      .then((data) =>
        setCategorias(Array.isArray(data) ? data : (data?.data ?? [])),
      )
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (precioMin > 0) params.set("precioMin", String(precioMin));
    if (precioMax < 2000) params.set("precioMax", String(precioMax));
    if (sort) params.set("sort", sort);
    if (departamento) params.set("departamento", departamento);
    if (municipio) params.set("municipio", municipio);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [precioMin, precioMax, sort, departamento, municipio, router]);

  useEffect(() => {
    if (!slug) return;

    async function loadProducts() {
      try {
        setLoading(true);

        const res = await fetch(
          `${API}/api/categorias/${slug}/productos?${searchParams.toString()}`,
          { cache: "no-store" },
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

  const handleReset = () => {
    setPrecioMin(0);
    setPrecioMax(2000);
    setSort("");
    setDepartamento("");
    setMunicipio("");
  };

  const categoryName =
    categoria?.nombre || String(slug || tr("filters.categoryFallback"));

  return (
    <ProductDiscoveryLayout
      title={categoria?.nombre || tr("filters.categoryFallback")}
      subtitle={tr("filters.categorySubtitle").replace("{name}", categoryName)}
      total={productos.length}
      categorias={categorias}
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
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {loading &&
          [...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border bg-white p-3"
            >
              <div className="mb-3 aspect-square w-full rounded bg-neutral-200" />
              <div className="mb-2 h-4 w-3/4 rounded bg-neutral-200" />
              <div className="h-4 w-1/2 rounded bg-neutral-200" />
            </div>
          ))}

        {!loading &&
          productos.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} className="group">
              <div className="rounded-xl border bg-white p-3 transition hover:shadow-md">
                <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
                  <Image
                    src={getProductImage(p)}
                    alt={getLocalizedField(p, "nombre", language) ?? p.nombre}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 z-10">
                    <FavoriteButton productId={p.id} size="sm" />
                  </div>
                </div>

                <h3 className="line-clamp-2 font-medium">
                  {getLocalizedField(p, "nombre", language) ?? p.nombre}
                </h3>
                <p className="mt-1 font-bold">Q{Number(p.precio).toFixed(2)}</p>
              </div>
            </Link>
          ))}

        {!loading && productos.length === 0 && (
          <div className="col-span-full py-12 text-center text-neutral-500">
            {tr("search.noCategoryProducts")}
          </div>
        )}
      </section>
    </ProductDiscoveryLayout>
  );
}
