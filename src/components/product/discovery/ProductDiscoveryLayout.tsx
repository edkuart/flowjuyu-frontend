// src/components/product/discovery/ProductDiscoveryLayout.tsx

"use client";

import { ReactNode, useEffect, useState } from "react";
import FilterSidebar from "@/components/product/FilterSidebar";

type ActiveFilter = {
  key: string;
  label: string;
};

type Props = {
  title: string;
  subtitle?: string;
  total?: number;
  activeFilters?: ActiveFilter[];

  categorias?: any[];

  categoriaId?: number | null;
  setCategoriaId?: (v: number | null) => void;

  precioMin?: number;
  precioMax?: number;
  setPrecioMin?: (v: number) => void;
  setPrecioMax?: (v: number) => void;

  sort?: string;
  setSort?: (v: string) => void;

  departamento?: string;
  setDepartamento?: (v: string) => void;

  municipio?: string;
  setMunicipio?: (v: string) => void;

  onReset?: () => void;

  children: ReactNode;
};

export default function ProductDiscoveryLayout({
  title,
  subtitle,
  total,
  activeFilters = [],

  categorias = [],

  categoriaId = null,
  setCategoriaId = () => {},

  precioMin = 0,
  precioMax = 2000,
  setPrecioMin = () => {},
  setPrecioMax = () => {},

  sort = "",
  setSort = () => {},

  departamento = "",
  setDepartamento = () => {},

  municipio = "",
  setMunicipio = () => {},

  onReset = () => {},

  children,
}: Props) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // 🔔 listener global (botón "Filtrar")
  useEffect(() => {
    const open = () => setShowMobileFilters(true);
    document.addEventListener("open-filters", open);
    return () => document.removeEventListener("open-filters", open);
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 px-3 sm:px-6 lg:px-10 py-6 sm:py-8">
      {/* 🧭 HEADER */}
      <header className="mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>

            {subtitle && (
              <p className="text-sm text-neutral-500">{subtitle}</p>
            )}

            {typeof total === "number" && (
              <p className="text-sm text-neutral-500">
                {total} productos encontrados
              </p>
            )}
          </div>

          {/* 📱 Botón móvil */}
          <button
            className="lg:hidden border rounded-lg px-4 py-2 text-sm font-medium"
            onClick={() => setShowMobileFilters(true)}
          >
            Filtrar
          </button>
        </div>

        {/* 🧩 Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="px-3 py-1 bg-neutral-200 rounded-full text-xs"
              >
                {f.label}
              </span>
            ))}

            <button
              onClick={onReset}
              className="text-xs text-red-600 hover:underline ml-2"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* 🧱 Sidebar desktop */}
        <aside className="hidden lg:block lg:sticky lg:top-24 self-start">
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
            departamento={departamento}
            setDepartamento={setDepartamento}
            municipio={municipio}
            setMunicipio={setMunicipio}
            onReset={onReset}
          />
        </aside>

        {/* 🧾 Resultados */}
        <section>{children}</section>
      </div>

      {/* 📱 Drawer móvil */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileFilters(false)}
          />

          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-4 overflow-y-auto">
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
              departamento={departamento}
              setDepartamento={setDepartamento}
              municipio={municipio}
              setMunicipio={setMunicipio}
              onReset={onReset}
            />

            <button
              className="w-full mt-4 bg-black text-white py-2 rounded-lg"
              onClick={() => setShowMobileFilters(false)}
            >
              Ver resultados
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
