// src/app/(main)/productos/ProductosContent.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import FilterSidebar from "@/components/product/FilterSidebar";

import { Card, CardContent } from "@/components/ui/card";
import ProductDiscoveryLayout from "@/components/product/discovery/ProductDiscoveryLayout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

// --- TIPOS ---
type Categoria = { id: number; nombre: string };
type Clase = { id: number; nombre: string };
type Tela = { id: number; nombre: string };

type Accesorio = { id: number; nombre: string };
type AccesorioTipo = { id: number; nombre: string };
type AccesorioMaterial = { id: number; nombre: string };

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  categoria?: string;
  departamento?: string;
  municipio?: string;
};

export default function ProductosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ---------------------------
  // 1. ESTADOS
  // ---------------------------
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros Básicos
  // NOTA: Leemos "categoria" (del link del home) o "categoria_id" (si vienes de otro lado)
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(2000);
  const [sort, setSort] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");

  // Catálogos
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [telas, setTelas] = useState<Tela[]>([]);
  
  // Filtros Específicos (Textil)
  const [claseId, setClaseId] = useState<number | null>(null);
  const [telaId, setTelaId] = useState<number | null>(null);

  // Filtros Específicos (Accesorios)
  const [accesorios, setAccesorios] = useState<Accesorio[]>([]);
  const [accesorioTipos, setAccesorioTipos] = useState<AccesorioTipo[]>([]);
  const [accesorioMateriales, setAccesorioMateriales] = useState<AccesorioMaterial[]>([]);
  
  const [accesorioId, setAccesorioId] = useState<number | null>(null);
  const [accesorioTipoId, setAccesorioTipoId] = useState<number | null>(null);
  const [accesorioMaterialId, setAccesorioMaterialId] = useState<number | null>(null);

  // ---------------------------
  // 2. INICIALIZAR DESDE URL
  // ---------------------------
  useEffect(() => {
    // Categoría: Puede venir como "categoria" (Home) o "categoria_id" (Search)
    const cat = searchParams.get("categoria") || searchParams.get("categoria_id");
    if (cat) setCategoriaId(Number(cat));

    const cla = searchParams.get("clase_id");
    if (cla) setClaseId(Number(cla));

    const tel = searchParams.get("tela_id");
    if (tel) setTelaId(Number(tel));

    const dep = searchParams.get("departamento");
    if (dep) setDepartamento(dep);

    const mun = searchParams.get("municipio");
    if (mun) setMunicipio(mun);

    const min = searchParams.get("precioMin");
    if (min) setPrecioMin(Number(min));

    const max = searchParams.get("precioMax");
    if (max) setPrecioMax(Number(max));

    const s = searchParams.get("sort");
    if (s) setSort(s);
  }, [searchParams]);

  // ---------------------------
  // 3. CARGAR CATÁLOGOS BASE
  // ---------------------------
  useEffect(() => {
    async function loadCatalogos() {
      try {
        const [catData, clsData] = await Promise.all([
          fetch(`${API}/api/categorias`).then((r) => r.json()),
          fetch(`${API}/api/clases`).then((r) => r.json()),
        ]);
        setCategorias(Array.isArray(catData) ? catData : (catData?.data ?? []));
        setClases(Array.isArray(clsData) ? clsData : (clsData?.data ?? []));
      } catch (e) {
        console.error("Error cargando catálogos:", e);
      }
    }
    loadCatalogos();
  }, []);

  // ---------------------------
  // 4. LÓGICA DE TIPO DE CATEGORÍA
  // ---------------------------
  const categoriaSeleccionada = categorias.find((c) => c.id === categoriaId);
  const categoriaNombre = (categoriaSeleccionada?.nombre || "").toLowerCase();

  const esTextil = useMemo(
    () =>
      categoriaNombre.includes("huipil") ||
      categoriaNombre.includes("hupil") ||
      categoriaNombre.includes("corte"),
    [categoriaNombre]
  );

  const esAccesorios = useMemo(
    () =>
      categoriaNombre.includes("accesorio") ||
      categoriaNombre.includes("accesorios típico"),
    [categoriaNombre]
  );

  const esCalzado = useMemo(() => categoriaNombre.includes("calzado"), [categoriaNombre]);

  // ---------------------------
  // 5. CARGA DINÁMICA (Sub-catálogos)
  // ---------------------------
  
  // A. Accesorios
  useEffect(() => {
    if (!esAccesorios) {
      setAccesorios([]);
      return;
    }
    const tipo = categoriaNombre.includes("típic") ? "tipico" : "normal";
    fetch(`${API}/api/accesorios?tipo=${tipo}`)
      .then(r => r.json())
      .then(setAccesorios)
      .catch(() => setAccesorios([]));
  }, [esAccesorios, categoriaNombre]);

  // B. Telas
  useEffect(() => {
    if (!esTextil || !claseId || esCalzado) {
      setTelas([]);
      return;
    }
    fetch(`${API}/api/telas?clase_id=${claseId}`)
      .then(r => r.json())
      .then(setTelas)
      .catch(() => setTelas([]));
  }, [esTextil, claseId, esCalzado]);

  // C. Tipos/Materiales de Accesorio
  useEffect(() => {
    if (!accesorioId) {
      setAccesorioTipos([]);
      setAccesorioMateriales([]);
      return;
    }
    Promise.all([
      fetch(`${API}/api/accesorio-tipos?accesorio_id=${accesorioId}`).then(r => r.json()),
      fetch(`${API}/api/accesorio-materiales?accesorio_id=${accesorioId}`).then(r => r.json())
    ]).then(([tips, mats]) => {
      setAccesorioTipos(tips);
      setAccesorioMateriales(mats);
    }).catch(console.error);
  }, [accesorioId]);

  // ---------------------------
  // 6. FETCH PRODUCTOS (EL NÚCLEO)
  // ---------------------------
  useEffect(() => {
    async function fetchProductos() {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        // IMPORTANTE: Mapear categoriaId (estado) -> categoria_id (API param)
        if (categoriaId) params.set("categoria_id", String(categoriaId));
        
        if (precioMin > 0) params.set("precioMin", String(precioMin));
        if (precioMax < 2000) params.set("precioMax", String(precioMax));
        if (sort) params.set("sort", sort);
        if (departamento) params.set("departamento", departamento);
        if (municipio) params.set("municipio", municipio);

        // Sub-filtros
        if (esTextil && !esCalzado && claseId) params.set("clase_id", String(claseId));
        if (esTextil && !esCalzado && telaId) params.set("tela_id", String(telaId));

        if (esAccesorios && accesorioId) params.set("accesorio_id", String(accesorioId));
        if (esAccesorios && accesorioTipoId) params.set("accesorio_tipo_id", String(accesorioTipoId));
        if (esAccesorios && accesorioMaterialId) params.set("accesorio_material_id", String(accesorioMaterialId));

        // Actualizamos URL del navegador (sin recargar)
        // Usamos "categoria" para mantener consistencia con el Home, pero internamente usamos ID
        const browserParams = new URLSearchParams(params.toString());
        if (categoriaId) {
            browserParams.delete("categoria_id");
            browserParams.set("categoria", String(categoriaId));
        }
        router.replace(`/productos?${browserParams.toString()}`, { scroll: false });

        // Llamada API (Usando los params correctos para el backend)
        const res = await fetch(`${API}/api/products?${params.toString()}`, { cache: "no-store" });
        const data = await res.json();
        
        const lista = data.data || data || [];
        setProductos(Array.isArray(lista) ? lista : []);

      } catch (error) {
        console.error("Error cargando productos:", error);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    }

    // Usamos debounce o llamada directa dependiendo de la necesidad. 
    // Aquí lo hacemos directo al cambiar filtros.
    fetchProductos();

  }, [
    categoriaId, precioMin, precioMax, sort, departamento, municipio,
    claseId, telaId, accesorioId, accesorioTipoId, accesorioMaterialId,
    esTextil, esAccesorios, esCalzado, router
  ]);


  // ---------------------------
  // 7. RESET
  // ---------------------------
  const handleReset = () => {
    setCategoriaId(null);
    setPrecioMin(0);
    setPrecioMax(2000);
    setSort("");
    setDepartamento("");
    setMunicipio("");
    setClaseId(null);
    setTelaId(null);
    setAccesorioId(null);
    setAccesorioTipoId(null);
    setAccesorioMaterialId(null);
  };

  return (
    <ProductDiscoveryLayout
      title="Nuestros Productos"
      subtitle="Explora la mejor artesanía de Guatemala"
      total={productos.length}
      
      // Props de Filtros
      categorias={categorias}
      categoriaId={categoriaId}
      setCategoriaId={setCategoriaId}

      precioMin={precioMin}
      setPrecioMin={setPrecioMin}
      precioMax={precioMax}
      setPrecioMax={setPrecioMax}
      
      sort={sort}
      setSort={setSort}
      
      departamento={departamento}
      setDepartamento={setDepartamento}
      municipio={municipio}
      setMunicipio={setMunicipio}

      // Props de Sub-filtros (Nuevos)
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

      onReset={handleReset}
    >
      
      {/* GRID RESULTADOS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {loading && [...Array(8)].map((_, i) => (
           <div key={i} className="animate-pulse bg-white border rounded-lg p-3 sm:p-4 shadow-sm">
             <div className="w-full aspect-square bg-neutral-200 rounded-md mb-3" />
             <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
             <div className="h-4 bg-neutral-200 rounded w-1/2" />
           </div>
        ))}

        {!loading && productos.map((p) => (
          <Link key={p.id} href={`/product/${p.id}`} className="group block">
             <Card className="h-full border shadow-sm hover:shadow-md transition duration-300">
               <CardContent className="p-3 sm:p-4 flex flex-col h-full">
                 <div className="relative w-full aspect-square bg-neutral-100 rounded-md overflow-hidden mb-3">
                   <Image
                     src={p.imagen_url || "/placeholder.jpg"}
                     alt={p.nombre}
                     fill
                     className="object-cover group-hover:scale-105 transition-transform duration-500"
                   />
                 </div>
                 
                 <div className="mb-2">
                    <h3 className="text-sm sm:text-base font-medium line-clamp-2 text-neutral-800">
                        {p.nombre}
                    </h3>
                    {p.categoria && (
                        <span className="text-xs text-neutral-500">{p.categoria}</span>
                    )}
                 </div>

                 <div className="mt-auto pt-2 border-t border-neutral-100">
                   <p className="text-base sm:text-lg font-bold text-neutral-900">
                     Q{Number(p.precio).toFixed(2)}
                   </p>
                 </div>
               </CardContent>
             </Card>
          </Link>
        ))}
      </div>

      {!loading && productos.length === 0 && (
        <div className="py-20 text-center text-neutral-500">
          <p className="text-lg">No encontramos productos con estos filtros.</p>
          <button 
            onClick={handleReset} 
            className="mt-4 text-blue-600 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}

    </ProductDiscoveryLayout>
  );
}
