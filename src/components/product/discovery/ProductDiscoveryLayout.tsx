// src/components/product/discovery/ProductDiscoveryLayout.tsx

"use client";

import { type ReactNode, useEffect, useState } from "react";
import FilterSidebar from "@/components/product/FilterSidebar";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";
import { X } from "lucide-react";

type ActiveFilter = { key: string; label: string };
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
  hideHeader?: boolean;
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
  clases?: Clase[];
  claseId?: number | null;
  setClaseId?: (v: number | null) => void;
  telas?: Tela[];
  telaId?: number | null;
  setTelaId?: (v: number | null) => void;
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
  hideHeader = false,
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
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showMobileFilters ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showMobileFilters]);

  const totalLabel =
    typeof total === "number"
      ? tr("filters.productsFound").replace("{count}", String(total))
      : null;

  return (
    <main className="min-h-screen bg-neutral-50 px-3 pt-0 pb-6 sm:px-6 sm:pb-8 lg:px-10">
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />

          <div className="animate-in slide-in-from-left absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-xl duration-300">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-bold">{tr("filters.title")}</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="rounded-full p-2 hover:bg-neutral-100"
                aria-label={tr("common.cancel")}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <FilterSidebar
                categorias={categorias}
                categoriaId={categoriaId}
                setCategoriaId={(id) => {
                  setCategoriaId(id);
                }}
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
                variant="mobile"
              />
            </div>

            <div className="border-t p-4">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full rounded-xl bg-[#0f2e22] py-3 font-bold text-white"
              >
                {tr("filters.viewResults")}
              </button>
            </div>
          </div>
        </div>
      )}

      {!hideHeader && (
        <header className="mb-6 space-y-3 pt-6 sm:pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-neutral-500">{subtitle}</p>
              )}
              {totalLabel && (
                <p className="text-sm font-medium text-[#184c37]">
                  {totalLabel}
                </p>
              )}
            </div>

            <button
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition active:scale-95 lg:hidden"
              onClick={() => setShowMobileFilters(true)}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              {tr("filters.filterAndSort")}
            </button>
          </div>
        </header>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden self-start lg:sticky lg:top-24 lg:block">
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
