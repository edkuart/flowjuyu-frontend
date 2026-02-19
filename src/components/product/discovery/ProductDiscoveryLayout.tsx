//src/components/product/discovery/ProductDiscoveryLayout.tsx

"use client";

import { ReactNode, useEffect, useState } from "react";
import FilterSidebar from "@/components/product/FilterSidebar";

/* ============================
   TIPOS
============================ */

type ActiveFilter = {
  key: string;
  label: string;
};

type Categoria = { id: number; nombre: string };
type Clase = { id: number; nombre: string };
type Tela = { id: number; nombre: string };
type Accesorio = { id: number; nombre: string };
type AccesorioTipo = { id: number; nombre: string };
type AccesorioMaterial = { id: number; nombre: string };

type Props = {
  title: string;
  subtitle?: string;
  total?: number;
  activeFilters?: ActiveFilter[];

  // BASE
  categorias?: Categoria[];
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

  // TEXTIL
  clases?: Clase[];
  claseId?: number | null;
  setClaseId?: (v: number | null) => void;

  telas?: Tela[];
  telaId?: number | null;
  setTelaId?: (v: number | null) => void;

  // ACCESORIOS
  accesorios?: Accesorio[];
  accesorioId?: number | null;
  setAccesorioId?: (v: number | null) => void;

  accesorioTipos?: AccesorioTipo[];
  accesorioTipoId?: number | null;
  setAccesorioTipoId?: (v: number | null) => void;

  accesorioMateriales?: AccesorioMaterial[];
  accesorioMaterialId?: number | null;
  setAccesorioMaterialId?: (v: number | null) => void;

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

  clases = [],
  claseId = null,
  setClaseId = () => {},

  telas = [],
  telaId = null,
  setTelaId = () => {},

  accesorios = [],
  accesorioId = null,
  setAccesorioId = () => {},

  accesorioTipos = [],
  accesorioTipoId = null,
  setAccesorioTipoId = () => {},

  accesorioMateriales = [],
  accesorioMaterialId = null,
  setAccesorioMaterialId = () => {},

  onReset = () => {},

  children,
}: Props) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const open = () => setShowMobileFilters(true);
    document.addEventListener("open-filters", open);
    return () => document.removeEventListener("open-filters", open);
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 px-3 sm:px-6 lg:px-10 py-6 sm:py-8">
      {/* HEADER */}
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

          <button
            className="lg:hidden border rounded-lg px-4 py-2 text-sm font-medium"
            onClick={() => setShowMobileFilters(true)}
          >
            Filtrar
          </button>
        </div>

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
        {/* Sidebar */}
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

            clases={clases}
            claseId={claseId}
            setClaseId={setClaseId}

            telas={telas}
            telaId={telaId}
            setTelaId={setTelaId}

            accesorios={accesorios}
            accesorioId={accesorioId}
            setAccesorioId={setAccesorioId}

            accesorioTipos={accesorioTipos}
            accesorioTipoId={accesorioTipoId}
            setAccesorioTipoId={setAccesorioTipoId}

            accesorioMateriales={accesorioMateriales}
            accesorioMaterialId={accesorioMaterialId}
            setAccesorioMaterialId={setAccesorioMaterialId}

            onReset={onReset}
          />
        </aside>

        <section>{children}</section>
      </div>
    </main>
  );
}
