"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FilterSidebar from "@/components/product/FilterSidebar";

// --- HOOK PERSONALIZADO: DEBOUNCE (Igual que antes) ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

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
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const debouncedPrecioMin = useDebounce(precioMin, 500);
  const debouncedPrecioMax = useDebounce(precioMax, 500);

  useEffect(() => {
    fetch(`${API}/api/categorias`)
      .then((r) => r.json())
      .then((data) => setCategorias(data || []))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (categoriaId) params.append("categoria_id", String(categoriaId));
        if (departamento) params.append("departamento", departamento);
        if (municipio) params.append("municipio", municipio);
        params.append("precioMin", String(debouncedPrecioMin));
        params.append("precioMax", String(debouncedPrecioMax));
        if (sort) params.append("sort", sort);

        const res = await fetch(`${API}/api/products?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Error en la respuesta");
        const data = await res.json();
        const lista = data.data || data || [];

        if (isMounted) setProductos(Array.isArray(lista) ? lista : []);
      } catch (error) {
        console.error("Error cargando productos:", error);
        if (isMounted) setProductos([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProducts();
    return () => { isMounted = false; };
  }, [categoriaId, debouncedPrecioMin, debouncedPrecioMax, sort, departamento, municipio]);

  const handleReset = () => {
    setCategoriaId(null);
    setPrecioMin(0);
    setPrecioMax(2000);
    setSort("");
    setDepartamento("");
    setMunicipio("");
    setShowMobileFilters(false);
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-3 sm:px-6 lg:px-10 py-6 sm:py-8">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Productos</h1>
        
        <button
          onClick={() => setShowMobileFilters(true)}
          className="lg:hidden w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filtrar y Ordenar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        
        {/* SIDEBAR DESKTOP */}
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
            onReset={handleReset}
          />
        </aside>

        {/* SIDEBAR MÓVIL (DRAWER) */}
        {showMobileFilters && (
          <div className="relative z-50 lg:hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div 
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                  <div className="pointer-events-auto w-screen max-w-xs transform transition-transform bg-white shadow-xl flex flex-col h-full">
                    <div className="flex items-center justify-between px-4 py-6 border-b">
                      <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                      <button
                        type="button"
                        className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => setShowMobileFilters(false)}
                      >
                        <span className="sr-only">Cerrar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-6">
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
                        onReset={handleReset}
                      />
                    </div>
                    <div className="border-t p-4">
                      <button 
                        onClick={() => setShowMobileFilters(false)}
                        className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition"
                      >
                        Ver resultados
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- AQUÍ ESTÁ EL CAMBIO CLAVE PARA LA GRILLA --- */}
        <section className="
          grid 
          grid-cols-2          /* MÓVIL: 2 columnas */
          sm:grid-cols-2 
          lg:grid-cols-3 
          xl:grid-cols-4 
          gap-3                /* MÓVIL: Espacio pequeño (12px) */
          sm:gap-6             /* DESKTOP: Espacio normal (24px) */
          content-start
        ">
          
          {loading &&
            [...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white border rounded-xl p-2 sm:p-4 shadow-sm">
                <div className="w-full aspect-square bg-neutral-200 rounded-lg mb-2 sm:mb-4" />
                <div className="h-3 sm:h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                <div className="h-3 sm:h-4 bg-neutral-200 rounded w-1/2" />
              </div>
            ))}

          {!loading && productos.map((p) => (
            <Link href={`/product/${p.id}`} key={p.id} className="group block">
              <div className="
                bg-white 
                border border-gray-200 
                rounded-lg sm:rounded-xl 
                shadow-sm hover:shadow-lg 
                hover:-translate-y-1 transition-all duration-300 
                p-2 sm:p-4           /* Relleno más pequeño en móvil */
                h-full flex flex-col
              ">
                <div className="relative w-full aspect-square rounded-md sm:rounded-lg overflow-hidden bg-neutral-100 mb-2 sm:mb-4">
                  <Image
                    src={p.imagen_url || "/placeholder.jpg"}
                    alt={p.nombre}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Título más pequeño en móvil (text-sm) */}
                <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                  {p.nombre}
                </h3>
                
                <div className="mt-auto pt-1 sm:pt-2">
                  {/* Precio ajustado */}
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    Q{Number(p.precio).toFixed(2)}
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {!loading && productos.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
              <div className="bg-neutral-100 p-4 rounded-full mb-4">
                 <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No encontramos productos</h3>
              <p className="text-gray-500 max-w-md mt-1 px-4">
                Intenta ajustar tus filtros.
              </p>
              <button 
                onClick={handleReset}
                className="mt-4 text-blue-600 font-medium hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}