// src/app/search/page.tsx
"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import Image from "next/image";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

import { departamentosConMunicipios } from "@/data/municipios";
import FilterSidebar from "@/components/product/FilterSidebar";

// 👇 Base del backend (sin /api, eso se añade en cada fetch)
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

type Categoria = { id: number; nombre: string };
type Clase = { id: number; nombre: string };
type Tela = { id: number; nombre: string };

type Accesorio = { id: number; nombre: string };
type AccesorioTipo = { id: number; nombre: string };
type AccesorioMaterial = { id: number; nombre: string };

type Producto = {
  id: string; // uuid
  nombre: string;
  precio: number | string;
  categoria?: string | null;
  imagen_url?: string | null;
  departamento?: string | null;
  municipio?: string | null;
};

export default function SearchProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ---------------------------
  // ESTADOS PRINCIPALES
  // ---------------------------
  const initialQuery =
    searchParams.get("search") ||
    searchParams.get("query") ||
    searchParams.get("q") ||
    "";

  const [busqueda, setBusqueda] = useState(initialQuery);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [relacionados, setRelacionados] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [categoriaId, setCategoriaId] = useState<number | null>(null);

  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");

  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(2000);

  const [sort, setSort] = useState("");

  const [clases, setClases] = useState<Clase[]>([]);
  const [telas, setTelas] = useState<Tela[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [claseId, setClaseId] = useState<number | null>(null);
  const [telaId, setTelaId] = useState<number | null>(null);

  const [accesorios, setAccesorios] = useState<Accesorio[]>([]);
  const [accesorioTipos, setAccesorioTipos] = useState<AccesorioTipo[]>([]);
  const [accesorioMateriales, setAccesorioMateriales] = useState<AccesorioMaterial[]>([]);

  const [accesorioId, setAccesorioId] = useState<number | null>(null);
  const [accesorioTipoId, setAccesorioTipoId] = useState<number | null>(null);
  const [accesorioMaterialId, setAccesorioMaterialId] = useState<number | null>(null);

  // ---------------------------
  // URL → ESTADOS
  // ---------------------------
  useEffect(() => {
    const q =
      searchParams.get("search") ||
      searchParams.get("query") ||
      searchParams.get("q");

    if (q && q.trim() !== "") setBusqueda(q);

    const cat = searchParams.get("categoria_id");
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
  }, [searchParams]);

  // ---------------------------
  // CARGAR CATÁLOGOS BÁSICOS
  // ---------------------------
  useEffect(() => {
    async function loadCatalogos() {
      try {
        const [cat, cls] = await Promise.all([
          fetch(`${API}/api/categorias`).then((r) => r.json()),
          fetch(`${API}/api/clases`).then((r) => r.json()),
        ]);
        setCategorias(cat || []);
        setClases(cls || []);
      } catch (e) {
        console.error("Error cargando catálogos:", e);
      }
    }
    loadCatalogos();
  }, []);

  // ---------------------------
  // LÓGICA DE TIPO DE CATEGORÍA
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
  // ACCESORIOS DINÁMICOS
  // ---------------------------
  useEffect(() => {
    if (!esAccesorios) {
      setAccesorios([]);
      setAccesorioId(null);
      setAccesorioTipos([]);
      setAccesorioTipoId(null);
      setAccesorioMateriales([]);
      setAccesorioMaterialId(null);
      return;
    }

    const tipo =
      categoriaNombre.includes("típic") || categoriaNombre.includes("tipic")
        ? "tipico"
        : "normal";

    (async () => {
      try {
        const res = await fetch(`${API}/api/accesorios?tipo=${tipo}`);
        setAccesorios(await res.json());
      } catch (error) {
        console.error("Error cargando accesorios:", error);
        setAccesorios([]);
      }
    })();
  }, [esAccesorios, categoriaNombre]);

  // ---------------------------
  // TELAS DINÁMICAS
  // ---------------------------
  useEffect(() => {
    if (!esTextil || !claseId || esCalzado) {
      setTelas([]);
      setTelaId(null);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}/api/telas?clase_id=${claseId}`);
        setTelas(await res.json());
      } catch (error) {
        console.error("Error cargando telas:", error);
        setTelas([]);
      }
    })();
  }, [esTextil, claseId, esCalzado]);

  // ---------------------------
  // TIPOS & MATERIALES DE ACCESORIO
  // ---------------------------
  useEffect(() => {
    if (!accesorioId) {
      setAccesorioTipos([]);
      setAccesorioMateriales([]);
      setAccesorioTipoId(null);
      setAccesorioMaterialId(null);
      return;
    }

    (async () => {
      try {
        const [tip, mat] = await Promise.all([
          fetch(`${API}/api/accesorio-tipos?accesorio_id=${accesorioId}`).then((r) => r.json()),
          fetch(`${API}/api/accesorio-materiales?accesorio_id=${accesorioId}`).then((r) => r.json()),
        ]);
        setAccesorioTipos(tip);
        setAccesorioMateriales(mat);
      } catch (error) {
        console.error("Error cargando tipos / materiales de accesorio:", error);
        setAccesorioTipos([]);
        setAccesorioMateriales([]);
      }
    })();
  }, [accesorioId]);

  // ---------------------------
  // RESET TOTAL AL CAMBIAR CATEGORÍA
  // ---------------------------
  useEffect(() => {
    setClaseId(null);
    setTelaId(null);
    setAccesorioId(null);
    setAccesorioTipoId(null);
    setAccesorioMaterialId(null);
  }, [categoriaId]);

  // ---------------------------
  // MUNICIPIOS
  // ---------------------------
  const municipiosDelDepartamento = useMemo(() => {
    const dep = departamentosConMunicipios.find((d) => d.nombre === departamento);
    return dep ? dep.municipios : [];
  }, [departamento]);

  useEffect(() => setMunicipio(""), [departamento]);

  // ---------------------------
  // PRECIOS
  // ---------------------------
  const ajustarPrecio = (campo: "min" | "max", delta: number) => {
    if (campo === "min") {
      setPrecioMin((p) => Math.max(0, Math.min(p + delta, precioMax)));
    } else {
      setPrecioMax((p) => Math.max(p + delta, precioMin));
    }
  };

  // ---------------------------
  // FETCH DE PRODUCTOS
  // ---------------------------
  async function fetchProductos(force = false) {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (busqueda.trim()) params.set("search", busqueda.trim());
      params.set("precioMin", String(precioMin));
      params.set("precioMax", String(precioMax));
      if (sort) params.set("sort", sort);

      if (categoriaId) params.set("categoria_id", String(categoriaId));
      if (departamento) params.set("departamento", departamento);
      if (municipio) params.set("municipio", municipio);

      if (esTextil && !esCalzado && claseId) params.set("clase_id", String(claseId));
      if (esTextil && !esCalzado && telaId) params.set("tela_id", String(telaId));

      if (esAccesorios && accesorioId) params.set("accesorio_id", String(accesorioId));
      if (esAccesorios && accesorioTipoId)
        params.set("accesorio_tipo_id", String(accesorioTipoId));
      if (esAccesorios && accesorioMaterialId)
        params.set("accesorio_material_id", String(accesorioMaterialId));

      // Sincronizar URL
      router.replace(`/search?${params.toString()}`, { scroll: false });

      const url = `${API}/api/products?${params.toString()}`;
      console.log("[SEARCH] Fetch:", url);

      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        console.error("[SEARCH] Respuesta no OK:", res.status, res.statusText);
        setProductos([]);
        setRelacionados([]);
        return;
      }

      const data = await res.json();
      console.log("[SEARCH] Data:", data);

      setProductos(data.data || []);
      setRelacionados(data.related || []);
    } catch (error) {
      console.error("[SEARCH] Error obteniendo productos:", error);
      setProductos([]);
      setRelacionados([]);
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------
  // DEBOUNCE
  // ---------------------------
  useEffect(() => {
    const id = setTimeout(fetchProductos, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    busqueda,
    categoriaId,
    departamento,
    municipio,
    precioMin,
    precioMax,
    sort,
    claseId,
    telaId,
    accesorioId,
    accesorioTipoId,
    accesorioMaterialId,
  ]);

  // ---------------------------
  // ENTER → buscar directo
  // ---------------------------
  function onEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") fetchProductos(true);
  }

  // ---------------------------
  // PILL FILTERS
  // ---------------------------
  const filtrosActivos: string[] = [];

  if (categoriaId) {
    const c = categorias.find((x) => x.id === categoriaId);
    if (c) filtrosActivos.push(c.nombre);
  }

  if (departamento) filtrosActivos.push(departamento);
  if (municipio) filtrosActivos.push(municipio);

  if (precioMin > 0) filtrosActivos.push(`Min Q${precioMin}`);
  if (precioMax < 2000) filtrosActivos.push(`Max Q${precioMax}`);

  if (claseId) {
    const c = clases.find((x) => x.id === claseId);
    if (c) filtrosActivos.push(c.nombre);
  }

  if (telaId) {
    const t = telas.find((x) => x.id === telaId);
    if (t) filtrosActivos.push(t.nombre);
  }

  if (accesorioId) {
    const a = accesorios.find((x) => x.id === accesorioId);
    if (a) filtrosActivos.push(a.nombre);
  }

  if (accesorioTipoId) {
    const t = accesorioTipos.find((x) => x.id === accesorioTipoId);
    if (t) filtrosActivos.push(t.nombre);
  }

  if (accesorioMaterialId) {
    const m = accesorioMateriales.find((x) => x.id === accesorioMaterialId);
    if (m) filtrosActivos.push(m.nombre);
  }

  // ---------------------------
  // RENDER
  // ---------------------------
  const mostrarRelacionados =
    productos.length === 0 &&
    relacionados.length > 0 &&
    busqueda.trim() !== "";

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 space-y-8">
      {/* HEADER */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            {mostrarRelacionados ? "Productos relacionados" : "Resultados de búsqueda"}
          </h1>

          {productos.length > 0 && (
            <p className="text-neutral-600 text-sm mt-1">
              {productos.length} resultados encontrados
            </p>
          )}

          {busqueda.trim() !== "" && (
            <p className="text-neutral-500 mt-1">
              Resultados para: <strong>"{busqueda}"</strong>
            </p>
          )}
        </div>

        {/* BUSCADOR */}
        <div className="relative w-full sm:w-96">
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={onEnter}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
        </div>
      </section>

      {/* CHIPS */}
      {filtrosActivos.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filtrosActivos.map((f, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-full text-xs"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      <section className="flex flex-col sm:flex-row gap-6">
        {/* PANEL FILTROS */}
        <aside className="sm:w-72">
          <FilterSidebar
            categorias={categorias}
            categoriaId={categoriaId}
            setCategoriaId={setCategoriaId}
            departamento={departamento}
            setDepartamento={setDepartamento}
            municipio={municipio}
            setMunicipio={setMunicipio}
            precioMin={precioMin}
            precioMax={precioMax}
            setPrecioMin={setPrecioMin}
            setPrecioMax={setPrecioMax}
            sort={sort}
            setSort={setSort}
            onReset={() => {
              setBusqueda("");
              setCategoriaId(null);
              setDepartamento("");
              setMunicipio("");
              setPrecioMin(0);
              setPrecioMax(2000);
              setSort("");
              setClaseId(null);
              setTelaId(null);
              setAccesorioId(null);
              setAccesorioTipoId(null);
              setAccesorioMaterialId(null);
            }}
          />
        </aside>

        {/* RESULTADOS */}
        <section className="flex-1 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* LOADING SKELETON */}
          {loading &&
            [...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white border rounded-lg p-4 shadow-sm"
              >
                <div className="w-full aspect-square bg-neutral-200 rounded-md mb-4" />
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4" />
                <div className="h-5 bg-neutral-200 rounded w-1/3" />
              </div>
            ))}

          {/* RESULTADOS NORMALES */}
          {!loading &&
            productos.length > 0 &&
            productos.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`} 
                className="block hover:opacity-90 transition"
              >
                <Card className="border shadow-sm hover:shadow-md transition cursor-pointer">
                  <CardContent className="p-4">
                    <div className="relative w-full aspect-square mb-3">
                      <Image
                        src={p.imagen_url || "/placeholder.jpg"}
                        alt={p.nombre}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <h3 className="font-semibold line-clamp-1">{p.nombre}</h3>

                    {p.categoria && (
                      <p className="text-xs text-neutral-600">{p.categoria}</p>
                    )}

                    {p.departamento && (
                      <p className="text-xs text-neutral-500 mt-1">
                        {p.municipio
                          ? `${p.municipio}, ${p.departamento}`
                          : p.departamento}
                      </p>
                    )}

                    <p className="text-base font-bold mt-2">
                      Q{Number(p.precio).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}

          {/* RELACIONADOS */}
          {!loading && productos.length === 0 && mostrarRelacionados && (
            <>
              <p className="col-span-full text-neutral-500">
                No encontramos productos exactos para{" "}
                <strong>"{busqueda}"</strong>. Aquí tienes alternativas:
              </p>

              {relacionados.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="block hover:opacity-90 transition"
                >
                  <Card className="border shadow-sm hover:shadow-md transition">
                    <CardContent className="p-4">
                      <div className="relative w-full aspect-square mb-3">
                        <Image
                          src={p.imagen_url || "/placeholder.jpg"}
                          alt={p.nombre}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>

                      <h3 className="font-semibold line-clamp-1">{p.nombre}</h3>
                      <p className="text-base font-bold mt-2">
                        Q{Number(p.precio).toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </>
          )}

          {/* SIN RESULTADOS */}
          {!loading && productos.length === 0 && !mostrarRelacionados && (
            <p className="col-span-full text-center text-neutral-500">
              No se encontraron productos.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}
