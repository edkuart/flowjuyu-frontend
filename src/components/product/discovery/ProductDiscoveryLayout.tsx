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
  precioMaxLimit?: number;
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
  precioMax = 10000,
  setPrecioMin = () => {},
  setPrecioMax = () => {},
  precioMaxLimit = 10000,
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
    <main className="min-h-screen bg-[#f8f5ef] px-3 pt-0 pb-6 sm:px-6 sm:pb-8 lg:px-10">
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />

          <div className="animate-in slide-in-from-left absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-[#f8f5ef] shadow-xl duration-300">
            <div className="flex items-center justify-between border-b border-[#0d2d20]/10 p-4">
              <h2 className="font-serif italic text-lg text-[#0d2d20]">{tr("filters.title")}</h2>
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
                precioMaxLimit={precioMaxLimit}
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

            <div className="border-t border-[#0d2d20]/10 p-4">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full rounded-full bg-[#0d2d20] py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white"
              >
                {tr("filters.viewResults")}
              </button>
            </div>
          </div>
        </div>
      )}

      {!hideHeader && (
        <header className="mb-8 space-y-3 pt-8 sm:pt-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#0d2d20]/50">
                <span className="text-[#d4a853] mr-2" aria-hidden>✦</span>
                {subtitle || "Catálogo"}
              </p>
              <h1 className="font-serif italic text-[2rem] leading-[1.05] tracking-[-0.02em] text-neutral-900 sm:text-[2.75rem]">
                {title}
              </h1>
              <div className="h-[2px] w-12 rounded-full bg-gradient-to-r from-[#0d2d20] via-[#d97706] to-[#0d2d20]" />
              {totalLabel && (
                <p className="text-[11px] tracking-[0.16em] text-[#0d2d20]/50 uppercase">
                  {totalLabel}
                </p>
              )}
            </div>

            <button
              className="flex w-fit items-center gap-2 rounded-full border border-[#0d2d20]/15 bg-white/70 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[#0d2d20] shadow-sm transition hover:bg-white active:scale-95 lg:hidden"
              onClick={() => setShowMobileFilters(true)}
            >
              <svg
                className="h-3.5 w-3.5"
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

          <div className="h-px bg-gradient-to-r from-[#0d2d20]/15 to-transparent" />
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
            precioMaxLimit={precioMaxLimit}
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
