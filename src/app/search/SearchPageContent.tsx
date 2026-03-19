"use client";

// NOTE: `dynamic = "force-dynamic"` belongs in page.tsx (Server Component), not here.

import type { KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

import ProductDiscoveryLayout from "@/components/product/discovery/ProductDiscoveryLayout";
import { useSearchProducts, type Producto } from "@/hooks/useSearchProducts";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

export default function SearchPageContent() {
  const {
    inputValue,
    setInputValue,
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
    filtrosActivos,
  } = useSearchProducts();

  const mostrarRelacionados =
    productos.length === 0 && relacionados.length > 0 && filters.query.trim() !== "";

  // On Enter, commit immediately by blurring (lets the debounce flush on next tick)
  function onEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") e.currentTarget.blur();
  }

  return (
    <ProductDiscoveryLayout
      title={mostrarRelacionados ? "Productos relacionados" : "Resultados de búsqueda"}
      subtitle={filters.query.trim() ? `Resultados para "${filters.query}"` : undefined}
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

        {/* Results
            isLoading  — first fetch (no data yet)          → skeleton
            isFetching — refetch with placeholderData shown → dim grid
            Neither    — settled state                      → full render
        */}
        <div
          className={
            isFetching && !isLoading
              ? "opacity-60 pointer-events-none transition-opacity duration-150"
              : ""
          }
        >
          {isLoading ? (
            <SkeletonGrid />
          ) : productos.length > 0 ? (
            <ProductGrid products={productos} />
          ) : mostrarRelacionados ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800">
                No encontramos coincidencias exactas para <strong>"{filters.query}"</strong>.
                Aquí tienes alternativas:
              </div>
              <ProductGrid products={relacionados} />
            </>
          ) : (
            <div className="text-center text-neutral-500 py-16">
              No se encontraron productos.
            </div>
          )}
        </div>

      </div>
    </ProductDiscoveryLayout>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm"
        >
          <div className="w-full aspect-square bg-neutral-200 rounded-xl mb-4" />
          <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4" />
          <div className="h-5 bg-neutral-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

function ProductGrid({ products }: { products: Producto[] }) {
  return (
    <div className="grid gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <Link key={p.id} href={`/product/${p.id}`} className="block">
          <Card className="rounded-3xl border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-5">
              <div className="relative w-full aspect-square mb-4 rounded-2xl overflow-hidden bg-neutral-100">
                <Image
                  src={p.imagen_url || "/placeholder.jpg"}
                  alt={p.nombre}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 z-10">
                  <FavoriteButton productId={p.id} size="sm" />
                </div>
              </div>

              <h3 className="font-medium text-neutral-900 line-clamp-2">{p.nombre}</h3>

              {(p.municipio || p.departamento) && (
                <p className="text-xs text-neutral-500 mt-2">
                  {[p.municipio, p.departamento].filter(Boolean).join(", ")}
                </p>
              )}

              <p className="text-lg font-semibold mt-3 tracking-tight text-emerald-700">
                Q{Number(p.precio).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
