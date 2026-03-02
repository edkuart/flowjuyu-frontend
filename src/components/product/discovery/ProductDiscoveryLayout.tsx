// src/components/product/discovery/ProductDiscoveryLayout.tsx

"use client";

import { ReactNode, useEffect, useState } from "react";
import FilterSidebar from "@/components/product/FilterSidebar";
import { X } from "lucide-react"; // Importamos un icono de cierre

/* ============================
    TIPOS (Se mantienen igual)
============================ */
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Bloquear el scroll del cuerpo cuando los filtros móviles están abiertos
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [showMobileFilters]);

  return (
    <main className="min-h-screen bg-neutral-50 px-3 sm:px-6 lg:px-10 pt-0 pb-6 sm:pb-8">
      
      {/* ================= FILTROS MÓVILES (DRAWER) ================= */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Overlay oscuro */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowMobileFilters(false)}
          />
          
          {/* Panel Blanco */}
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg">Filtros</h2>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <FilterSidebar
                // Pasamos todas las props necesarias
                categorias={categorias}
                categoriaId={categoriaId}
                setCategoriaId={(id) => { setCategoriaId(id); /* setShowMobileFilters(false); */ }}
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
            </div>

            <div className="p-4 border-t">
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-[#0f2e22] text-white py-3 rounded-xl font-bold"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      {!hideHeader && (
        <header className="pt-6 sm:pt-8 mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">{title}</h1>
              {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
              {typeof total === "number" && (
                <p className="text-sm font-medium text-[#184c37]">
                  {total} productos encontrados
                </p>
              )}
            </div>

            <button
              className="lg:hidden flex items-center justify-center gap-2 bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm active:scale-95 transition"
              onClick={() => setShowMobileFilters(true)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filtrar y Ordenar
            </button>
          </div>
        </header>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar Desktop */}
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