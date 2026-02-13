"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import Image from "next/image";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter } from "lucide-react"; 

// 👇 Importamos SheetClose para que el botón "Ver resultados" cierre el menú
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose 
} from "@/components/ui/sheet";

import { departamentosConMunicipios } from "@/data/municipios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

type Categoria = { id: number; nombre: string };
type Clase = { id: number; nombre: string };
type Tela = { id: number; nombre: string };

type Accesorio = { id: number; nombre: string };
type AccesorioTipo = { id: number; nombre: string };
type AccesorioMaterial = { id: number; nombre: string };

type Producto = {
  id: string;
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
  // ESTADOS PRINCIPALES (Lógica intacta)
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
  // CARGAR CATÁLOGOS
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
  // LÓGICA CATEGORÍA
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
  // EFECTOS DINÁMICOS (Accesorios, Telas, etc.)
  // ---------------------------
  useEffect(() => {
    if (!esAccesorios) {
      setAccesorios([]); setAccesorioId(null); setAccesorioTipos([]); setAccesorioTipoId(null); setAccesorioMateriales([]); setAccesorioMaterialId(null);
      return;
    }
    const tipo = categoriaNombre.includes("típic") || categoriaNombre.includes("tipic") ? "tipico" : "normal";
    (async () => {
      try {
        const res = await fetch(`${API}/api/accesorios?tipo=${tipo}`);
        setAccesorios(await res.json());
      } catch (error) { setAccesorios([]); }
    })();
  }, [esAccesorios, categoriaNombre]);

  useEffect(() => {
    if (!esTextil || !claseId || esCalzado) {
      setTelas([]); setTelaId(null); return;
    }
    (async () => {
      try {
        const res = await fetch(`${API}/api/telas?clase_id=${claseId}`);
        setTelas(await res.json());
      } catch (error) { setTelas([]); }
    })();
  }, [esTextil, claseId, esCalzado]);

  useEffect(() => {
    if (!accesorioId) {
      setAccesorioTipos([]); setAccesorioMateriales([]); setAccesorioTipoId(null); setAccesorioMaterialId(null); return;
    }
    (async () => {
      try {
        const [tip, mat] = await Promise.all([
          fetch(`${API}/api/accesorio-tipos?accesorio_id=${accesorioId}`).then((r) => r.json()),
          fetch(`${API}/api/accesorio-materiales?accesorio_id=${accesorioId}`).then((r) => r.json()),
        ]);
        setAccesorioTipos(tip); setAccesorioMateriales(mat);
      } catch (error) { setAccesorioTipos([]); setAccesorioMateriales([]); }
    })();
  }, [accesorioId]);

  useEffect(() => {
    setClaseId(null); setTelaId(null); setAccesorioId(null); setAccesorioTipoId(null); setAccesorioMaterialId(null);
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
  // FETCH
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
      if (esAccesorios && accesorioTipoId) params.set("accesorio_tipo_id", String(accesorioTipoId));
      if (esAccesorios && accesorioMaterialId) params.set("accesorio_material_id", String(accesorioMaterialId));

      router.replace(`/search?${params.toString()}`, { scroll: false });

      const url = `${API}/api/products?${params.toString()}`;
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        setProductos([]); setRelacionados([]); return;
      }

      const data = await res.json();
      setProductos(data.data || []);
      setRelacionados(data.related || []);
    } catch (error) {
      setProductos([]); setRelacionados([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(fetchProductos, 300);
    return () => clearTimeout(id);
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

  function onEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") fetchProductos(true);
  }

  const filtrosActivos: string[] = [];
  if (categoriaId) {
    const c = categorias.find((x) => x.id === categoriaId);
    if (c) filtrosActivos.push(c.nombre);
  }
  if (departamento) filtrosActivos.push(departamento);
  if (municipio) filtrosActivos.push(municipio);
  if (precioMin > 0) filtrosActivos.push(`Min Q${precioMin}`);
  if (precioMax < 2000) filtrosActivos.push(`Max Q${precioMax}`);

  const mostrarRelacionados =
    productos.length === 0 &&
    relacionados.length > 0 &&
    busqueda.trim() !== "";

  return (
    <main className="min-h-screen bg-neutral-50 px-4 sm:px-6 lg:px-10 py-6 space-y-6">

      {/* HEADER BUSQUEDA */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            {mostrarRelacionados ? "Productos relacionados" : "Resultados de búsqueda"}
          </h1>
          {productos.length > 0 && (
            <p className="text-neutral-600 text-sm mt-1">{productos.length} resultados encontrados</p>
          )}
        </div>
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
        <div className="flex flex-wrap gap-2">
          {filtrosActivos.map((f, i) => (
            <span key={i} className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-full text-xs">
              {f}
            </span>
          ))}
        </div>
      )}

      {/* ===========================================
        🔥 BOTON MÓVIL "FILTRAR Y ORDENAR" + MENU 
        ===========================================
        - Estilo idéntico a image_f4b4ff.jpg
        - Menú con botón negro "Ver resultados" (image_f709a6.png)
      */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full bg-white border border-neutral-200 shadow-sm text-neutral-800 flex items-center justify-center gap-2 py-6 text-base font-medium rounded-lg hover:bg-neutral-50"
            >
              <Filter className="w-5 h-5 text-neutral-600" />
              Filtrar y Ordenar
            </Button>
          </SheetTrigger>
          
          {/* side="right" -> Sale de la derecha 
            flex flex-col -> Para organizar header, contenido y footer
          */}
          <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col p-0 gap-0">
            
            {/* Cabecera del menú */}
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <SheetTitle className="text-lg font-bold">Filtros</SheetTitle>
              {/* El botón X ya viene por defecto en SheetContent */}
            </div>

            {/* Contenido scrolleable (Filtros) */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
                <div className="space-y-6">
                  {/* CATEGORÍA */}
                  <div>
                    <label className="font-semibold text-sm mb-2 block">Categoría</label>
                    <select
                      className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm bg-white"
                      value={categoriaId ?? ""}
                      onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Todas</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* ORIGEN */}
                  <div className="space-y-3">
                    <p className="font-semibold text-sm">Origen</p>
                    <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Departamento</label>
                        <select
                        className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm bg-white"
                        value={departamento}
                        onChange={(e) => setDepartamento(e.target.value)}
                        >
                        <option value="">-- Seleccione --</option>
                        {departamentosConMunicipios.map((d) => (
                            <option key={d.nombre}>{d.nombre}</option>
                        ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Municipio</label>
                        <select
                        className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm bg-white"
                        value={municipio}
                        onChange={(e) => setMunicipio(e.target.value)}
                        disabled={!departamento}
                        >
                        <option value="">-- Seleccione --</option>
                        {municipiosDelDepartamento.map((m) => (
                            <option key={m}>{m}</option>
                        ))}
                        </select>
                    </div>
                  </div>

                  {/* TEXTIL */}
                  {esTextil && !esCalzado && (
                    <div className="space-y-3">
                      <p className="font-semibold text-sm">Detalles del textil</p>
                      <select
                        className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm bg-white"
                        value={claseId ?? ""}
                        onChange={(e) => setClaseId(e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">Todas las clases</option>
                        {clases.map((cls) => (
                          <option key={cls.id} value={cls.id}>{cls.nombre}</option>
                        ))}
                      </select>
                      {telas.length > 0 && (
                          <select
                            className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm bg-white"
                            value={telaId ?? ""}
                            onChange={(e) => setTelaId(e.target.value ? Number(e.target.value) : null)}
                            disabled={!claseId}
                          >
                            <option value="">Todas las telas</option>
                            {telas.map((t) => (
                              <option key={t.id} value={t.id}>{t.nombre}</option>
                            ))}
                          </select>
                      )}
                    </div>
                  )}

                  {/* ACCESORIOS */}
                  {esAccesorios && (
                    <div className="space-y-3">
                      <p className="font-semibold text-sm">Accesorio</p>
                      <select
                        className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm bg-white"
                        value={accesorioId ?? ""}
                        onChange={(e) => setAccesorioId(e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">Todos</option>
                        {accesorios.map((a) => (
                          <option key={a.id} value={a.id}>{a.nombre}</option>
                        ))}
                      </select>
                      {accesorioTipos.length > 0 && (
                        <select
                          className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm bg-white"
                          value={accesorioTipoId ?? ""}
                          onChange={(e) => setAccesorioTipoId(e.target.value ? Number(e.target.value) : null)}
                        >
                          <option value="">Todos los tipos</option>
                          {accesorioTipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                      )}
                      {accesorioMateriales.length > 0 && (
                        <select
                          className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm bg-white"
                          value={accesorioMaterialId ?? ""}
                          onChange={(e) => setAccesorioMaterialId(e.target.value ? Number(e.target.value) : null)}
                        >
                          <option value="">Todos los materiales</option>
                          {accesorioMateriales.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </select>
                      )}
                    </div>
                  )}

                  {/* PRECIO */}
                  <div>
                    <p className="font-semibold text-sm mb-3">Precio</p>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 text-sm text-neutral-500">Mín</span>
                      <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => ajustarPrecio("min", -50)}>-</Button>
                      <Input type="number" value={precioMin} onChange={(e) => setPrecioMin(Number(e.target.value))} className="h-9 text-center" />
                      <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => ajustarPrecio("min", 50)}>+</Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-sm text-neutral-500">Máx</span>
                      <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => ajustarPrecio("max", -50)}>-</Button>
                      <Input type="number" value={precioMax} onChange={(e) => setPrecioMax(Number(e.target.value))} className="h-9 text-center" />
                      <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => ajustarPrecio("max", 50)}>+</Button>
                    </div>
                  </div>

                  {/* ORDENAR */}
                  <div>
                    <label className="font-semibold text-sm mb-2 block">Ordenar por</label>
                    <select
                      className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm bg-white"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="">Más recientes</option>
                      <option value="precio_asc">Precio: menor a mayor</option>
                      <option value="precio_desc">Precio: mayor a menor</option>
                    </select>
                  </div>

                  {/* LIMPIAR */}
                  <Button
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setBusqueda(""); setCategoriaId(null); setDepartamento(""); setMunicipio("");
                      setPrecioMin(0); setPrecioMax(2000); setSort("");
                      setClaseId(null); setTelaId(null); setAccesorioId(null);
                      setAccesorioTipoId(null); setAccesorioMaterialId(null);
                      fetchProductos(true);
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
            </div>

            {/* Footer del Menú: Botón negro "Ver resultados"
               Esto es clave para que se vea como image_f709a6.png
            */}
            <div className="p-4 border-t border-neutral-100 bg-white">
               <SheetClose asChild>
                  <Button className="w-full bg-black text-white hover:bg-neutral-800 py-6 text-base font-bold rounded-lg">
                    Ver resultados
                  </Button>
               </SheetClose>
            </div>

          </SheetContent>
        </Sheet>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

        {/* PANEL FILTROS (ESCRITORIO) 
           Oculto en celular: hidden lg:block
        */}
        <aside className="hidden lg:block space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              
              {/* CATEGORÍA */}
              <div>
                <label className="font-medium">Categoría</label>
                <select
                  className="mt-1 w-full border rounded-md p-2 text-sm"
                  value={categoriaId ?? ""}
                  onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Todas</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {/* ORIGEN */}
              <div className="space-y-2">
                <p className="font-medium">Origen</p>
                <label className="text-xs text-neutral-600">Departamento</label>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                >
                  <option value="">-- Seleccione --</option>
                  {departamentosConMunicipios.map((d) => (
                    <option key={d.nombre}>{d.nombre}</option>
                  ))}
                </select>

                <label className="text-xs text-neutral-600">Municipio</label>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  disabled={!departamento}
                >
                  <option value="">-- Seleccione --</option>
                  {municipiosDelDepartamento.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* TEXTIL */}
              {esTextil && !esCalzado && (
                <div className="space-y-2">
                  <p className="font-medium">Detalles del textil</p>
                  <label className="text-xs text-neutral-600">Clase</label>
                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    value={claseId ?? ""}
                    onChange={(e) => setClaseId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Todas</option>
                    {clases.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.nombre}</option>
                    ))}
                  </select>

                  {telas.length > 0 && (
                    <>
                      <label className="text-xs text-neutral-600">Tela</label>
                      <select
                        className="w-full border rounded-md p-2 text-sm"
                        value={telaId ?? ""}
                        onChange={(e) => setTelaId(e.target.value ? Number(e.target.value) : null)}
                        disabled={!claseId}
                      >
                        <option value="">Todas</option>
                        {telas.map((t) => (
                          <option key={t.id} value={t.id}>{t.nombre}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              )}

              {/* ACCESORIOS */}
              {esAccesorios && (
                <div className="space-y-2">
                  <p className="font-medium">Accesorio</p>
                  <label className="text-xs text-neutral-600">Tipo</label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={accesorioId ?? ""}
                    onChange={(e) => setAccesorioId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Todos</option>
                    {accesorios.map((a) => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>

                  {accesorioTipos.length > 0 && (
                    <>
                      <label className="text-xs text-neutral-600">Modelo / estilo</label>
                      <select
                        className="w-full border rounded-md p-2"
                        value={accesorioTipoId ?? ""}
                        onChange={(e) => setAccesorioTipoId(e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">Todos</option>
                        {accesorioTipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                      </select>
                    </>
                  )}

                  {accesorioMateriales.length > 0 && (
                    <>
                      <label className="text-xs text-neutral-600">Material</label>
                      <select
                        className="w-full border rounded-md p-2"
                        value={accesorioMaterialId ?? ""}
                        onChange={(e) => setAccesorioMaterialId(e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">Todos</option>
                        {accesorioMateriales.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                      </select>
                    </>
                  )}
                </div>
              )}

              {/* PRECIO */}
              <div>
                <p className="font-medium">Precio</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-10 text-xs">Mín</span>
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => ajustarPrecio("min", -50)}>-</Button>
                  <Input type="number" value={precioMin} onChange={(e) => setPrecioMin(Number(e.target.value))} className="h-8" />
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => ajustarPrecio("min", 50)}>+</Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-10 text-xs">Máx</span>
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => ajustarPrecio("max", -50)}>-</Button>
                  <Input type="number" value={precioMax} onChange={(e) => setPrecioMax(Number(e.target.value))} className="h-8" />
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => ajustarPrecio("max", 50)}>+</Button>
                </div>
              </div>

              {/* ORDEN */}
              <div>
                <label className="font-medium">Ordenar por</label>
                <select
                  className="w-full border rounded-md p-2 mt-1"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="">Más recientes</option>
                  <option value="precio_asc">Precio: menor a mayor</option>
                  <option value="precio_desc">Precio: mayor a menor</option>
                </select>
              </div>

              {/* LIMPIAR */}
              <Button
                variant="ghost"
                className="w-full text-red-500"
                onClick={() => {
                  setBusqueda(""); setCategoriaId(null); setDepartamento(""); setMunicipio("");
                  setPrecioMin(0); setPrecioMax(2000); setSort("");
                  setClaseId(null); setTelaId(null); setAccesorioId(null);
                  setAccesorioTipoId(null); setAccesorioMaterialId(null);
                  fetchProductos(true);
                }}
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* RESULTADOS */}
        {/* Usamos el Grid-Cols-2 en móvil que querías */}
        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          
          {loading && [...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white border rounded-lg p-2 sm:p-4 shadow-sm">
              <div className="w-full aspect-square bg-neutral-200 rounded-md mb-2 sm:mb-4" />
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
            </div>
          ))}

          {!loading && productos.length > 0 && productos.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} className="block hover:opacity-90 transition">
              <Card className="border shadow-sm hover:shadow-md transition cursor-pointer h-full">
                <CardContent className="p-2 sm:p-4">
                  <div className="relative w-full aspect-square mb-2 sm:mb-3">
                    <Image
                      src={p.imagen_url || "/placeholder.jpg"}
                      alt={p.nombre}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="font-semibold line-clamp-1 text-sm sm:text-base">{p.nombre}</h3>
                  {p.categoria && <p className="text-xs text-neutral-600 hidden sm:block">{p.categoria}</p>}
                  {p.departamento && (
                    <p className="text-xs text-neutral-500 mt-1 hidden sm:block">
                      {p.municipio ? `${p.municipio}, ${p.departamento}` : p.departamento}
                    </p>
                  )}
                  <p className="text-sm sm:text-base font-bold mt-1 sm:mt-2">Q{Number(p.precio).toFixed(2)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}

          {!loading && productos.length === 0 && mostrarRelacionados && (
            <>
              <p className="col-span-full text-neutral-500 text-sm sm:text-base">
                No encontramos productos exactos para <strong>"{busqueda}"</strong>. Aquí tienes alternativas:
              </p>
              {relacionados.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className="block hover:opacity-90 transition">
                  <Card className="border shadow-sm hover:shadow-md transition h-full">
                    <CardContent className="p-2 sm:p-4">
                      <div className="relative w-full aspect-square mb-2 sm:mb-3">
                        <Image
                          src={p.imagen_url || "/placeholder.jpg"}
                          alt={p.nombre}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <h3 className="font-semibold line-clamp-1 text-sm sm:text-base">{p.nombre}</h3>
                      <p className="text-sm sm:text-base font-bold mt-1 sm:mt-2">Q{Number(p.precio).toFixed(2)}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </>
          )}

          {!loading && productos.length === 0 && !mostrarRelacionados && (
            <p className="col-span-full text-center text-neutral-500 py-10">
              No se encontraron productos.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}