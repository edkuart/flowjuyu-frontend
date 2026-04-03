"use client";

import Image from "next/image";
import Link from "next/link";
import { getProductImage } from "@/lib/getProductImage";
import ProductDiscoveryLayout from "@/components/product/discovery/ProductDiscoveryLayout";
import { useSearchProducts, type Producto } from "@/hooks/useSearchProducts";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";
import { getLocalizedField } from "@/lib/getLocalizedField";

export default function SearchPageContent() {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const {
    filters,
    setCategoriaId,
    setClaseId,
    setTelaId,
    setAccesorioId,
    setAccesorioTipoId,
    setAccesorioMaterialId,
    setDepartamento,
    setMunicipio,
    setPrecioMin,
    setPrecioMax,
    setSort,
    resetFilters,
    productos,
    relacionados,
    isLoading,
    isFetching,
    categorias,
    clases,
    telas,
    accesorios,
    accesorioTipos,
    accesorioMateriales,
  } = useSearchProducts();

  const query = filters.query.trim();
  const mostrarRelacionados =
    productos.length === 0 && relacionados.length > 0 && query !== "";

  const title = mostrarRelacionados
    ? tr("search.relatedTitle")
    : tr("search.pageTitle");
  const subtitle = query
    ? tr("search.resultsFor").replace("{query}", query)
    : undefined;

  return (
    <ProductDiscoveryLayout
      title={title}
      subtitle={subtitle}
      total={productos.length}
      categorias={categorias}
      categoriaId={filters.categoriaId}
      setCategoriaId={setCategoriaId}
      departamento={filters.departamento}
      setDepartamento={setDepartamento}
      municipio={filters.municipio}
      setMunicipio={setMunicipio}
      precioMin={filters.precioMin}
      precioMax={filters.precioMax}
      setPrecioMin={setPrecioMin}
      setPrecioMax={setPrecioMax}
      sort={filters.sort}
      setSort={setSort}
      clases={clases}
      claseId={filters.claseId}
      setClaseId={setClaseId}
      telas={telas}
      telaId={filters.telaId}
      setTelaId={setTelaId}
      accesorios={accesorios}
      accesorioId={filters.accesorioId}
      setAccesorioId={setAccesorioId}
      accesorioTipos={accesorioTipos}
      accesorioTipoId={filters.accesorioTipoId}
      setAccesorioTipoId={setAccesorioTipoId}
      accesorioMateriales={accesorioMateriales}
      accesorioMaterialId={filters.accesorioMaterialId}
      setAccesorioMaterialId={setAccesorioMaterialId}
      onReset={resetFilters}
    >
      <div className="space-y-6">
        <div
          className={
            isFetching && !isLoading
              ? "pointer-events-none opacity-60 transition-opacity duration-150"
              : ""
          }
        >
          {isLoading ? (
            <SkeletonGrid />
          ) : productos.length > 0 ? (
            <ProductGrid products={productos} />
          ) : mostrarRelacionados ? (
            <>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                {tr("search.noExactMatches")} <strong>"{query}"</strong>.{" "}
                {tr("search.alternatives")}
              </div>
              <ProductGrid products={relacionados} />
            </>
          ) : (
            <div className="py-16 text-center text-neutral-500">
              {tr("search.noProducts")}
            </div>
          )}
        </div>
      </div>
    </ProductDiscoveryLayout>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 aspect-square w-full rounded-xl bg-neutral-200" />
          <div className="mb-2 h-4 w-3/4 rounded bg-neutral-200" />
          <div className="mb-4 h-4 w-1/2 rounded bg-neutral-200" />
          <div className="h-5 w-1/3 rounded bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}

function ProductGrid({ products }: { products: Producto[] }) {
  const { language } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => {
        const localizedNombre =
          getLocalizedField(p, "nombre", language) ?? p.nombre;

        return (
          <Link key={p.id} href={`/product/${p.id}`} className="block">
            <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="p-5">
                <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100">
                  <Image
                    src={getProductImage(p)}
                    alt={localizedNombre}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 z-10">
                    <FavoriteButton productId={p.id} size="sm" />
                  </div>
                </div>

                <h3 className="line-clamp-2 font-medium text-neutral-900">
                  {localizedNombre}
                </h3>

                {(p.municipio || p.departamento) && (
                  <p className="mt-2 text-xs text-neutral-500">
                    {[p.municipio, p.departamento].filter(Boolean).join(", ")}
                  </p>
                )}

                <p className="mt-3 text-lg font-semibold tracking-tight text-emerald-700">
                  Q{Number(p.precio).toFixed(2)}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
