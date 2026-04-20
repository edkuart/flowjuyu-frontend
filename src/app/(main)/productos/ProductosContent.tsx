"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductImage } from "@/lib/getProductImage";
import FallbackImg from "@/components/FallbackImg";

import ProductDiscoveryLayout from "@/components/product/discovery/ProductDiscoveryLayout";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";
import { getLocalizedField } from "@/lib/getLocalizedField";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

// --- TIPOS ---
type Categoria = {
  id: number;
  nombre: string;
  nombre_kiche?: string | null;
  nombre_kaqchikel?: string | null;
  nombre_qeqchi?: string | null;
};
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
  imagenes?: { url: string }[];
  categoria?: string;
  categoria_obj?: Categoria | null;
  nombre_kiche?: string | null;
  nombre_kaqchikel?: string | null;
  nombre_qeqchi?: string | null;
  departamento?: string;
  municipio?: string;
};

export default function ProductosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { dictionary, language } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  // ---------------------------
  // 1. ESTADOS
  // ---------------------------
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros Básicos
  // NOTA: Leemos "categoria" (del link del home) o "categoria_id" (si vienes de otro lado)
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(10000);
  const [precioMaxLimit, setPrecioMaxLimit] = useState(10000);
  const precioMaxLimitRef = useRef(10000);
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
  const [accesorioMateriales, setAccesorioMateriales] = useState<
    AccesorioMaterial[]
  >([]);

  const [accesorioId, setAccesorioId] = useState<number | null>(null);
  const [accesorioTipoId, setAccesorioTipoId] = useState<number | null>(null);
  const [accesorioMaterialId, setAccesorioMaterialId] = useState<number | null>(
    null,
  );

  // ---------------------------
  // 2. INICIALIZAR DESDE URL
  // ---------------------------
  useEffect(() => {
    // Categoría: Puede venir como "categoria" (Home) o "categoria_id" (Search)
    const cat =
      searchParams.get("categoria") || searchParams.get("categoria_id");
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
    [categoriaNombre],
  );

  const esAccesorios = useMemo(
    () =>
      categoriaNombre.includes("accesorio") ||
      categoriaNombre.includes("accesorios típico"),
    [categoriaNombre],
  );

  const esCalzado = useMemo(
    () => categoriaNombre.includes("calzado"),
    [categoriaNombre],
  );

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
      .then((r) => r.json())
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
      .then((r) => r.json())
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
      fetch(`${API}/api/accesorio-tipos?accesorio_id=${accesorioId}`).then(
        (r) => r.json(),
      ),
      fetch(`${API}/api/accesorio-materiales?accesorio_id=${accesorioId}`).then(
        (r) => r.json(),
      ),
    ])
      .then(([tips, mats]) => {
        setAccesorioTipos(tips);
        setAccesorioMateriales(mats);
      })
      .catch(console.error);
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
        if (precioMax < precioMaxLimitRef.current) params.set("precioMax", String(precioMax));
        if (sort) params.set("sort", sort);
        if (departamento) params.set("departamento", departamento);
        if (municipio) params.set("municipio", municipio);

        // Sub-filtros
        if (esTextil && !esCalzado && claseId) {
          params.set("clase_id", String(claseId));
        }
        if (esTextil && !esCalzado && telaId) {
          params.set("tela_id", String(telaId));
        }

        if (esAccesorios && accesorioId) {
          params.set("accesorio_id", String(accesorioId));
        }
        if (esAccesorios && accesorioTipoId) {
          params.set("accesorio_tipo_id", String(accesorioTipoId));
        }
        if (esAccesorios && accesorioMaterialId) {
          params.set("accesorio_material_id", String(accesorioMaterialId));
        }

        // Actualizamos URL del navegador (sin recargar)
        // Usamos "categoria" para mantener consistencia con el Home, pero internamente usamos ID
        const browserParams = new URLSearchParams(params.toString());
        if (categoriaId) {
          browserParams.delete("categoria_id");
          browserParams.set("categoria", String(categoriaId));
        }
        router.replace(`/productos?${browserParams.toString()}`, {
          scroll: false,
        });

        // Llamada API (Usando los params correctos para el backend)
        const res = await fetch(`${API}/api/products?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();

        const lista = data.data || data || [];
        const arr: any[] = Array.isArray(lista) ? lista : [];
        setProductos(arr);

        if (arr.length > 0) {
          const maxPrecio = Math.max(...arr.map((p: any) => Number(p.precio) || 0));
          const newLimit = Math.ceil(maxPrecio / 500) * 500 || 10000;
          if (newLimit !== precioMaxLimitRef.current) {
            precioMaxLimitRef.current = newLimit;
            setPrecioMaxLimit(newLimit);
          }
        }
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
    categoriaId,
    precioMin,
    precioMax,
    sort,
    departamento,
    municipio,
    claseId,
    telaId,
    accesorioId,
    accesorioTipoId,
    accesorioMaterialId,
    esTextil,
    esAccesorios,
    esCalzado,
    router,
  ]);

  // ---------------------------
  // 7. RESET
  // ---------------------------
  const handleReset = () => {
    setCategoriaId(null);
    setPrecioMin(0);
    setPrecioMax(precioMaxLimitRef.current);
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
      title={tr("product.catalogTitle")}
      subtitle={tr("product.catalogSubtitle")}
      total={productos.length}
      categorias={categorias}
      categoriaId={categoriaId}
      setCategoriaId={setCategoriaId}
      precioMin={precioMin}
      setPrecioMin={setPrecioMin}
      precioMax={precioMax}
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
      onReset={handleReset}
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {loading &&
          [...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/5] rounded-sm bg-[#0d2d20]/8" />
              <div className="mt-3 space-y-2 px-0.5">
                <div className="h-3 w-3/4 rounded bg-[#0d2d20]/8" />
                <div className="h-3 w-1/2 rounded bg-[#0d2d20]/8" />
              </div>
            </div>
          ))}

        {!loading &&
          productos.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} className="group block">
              {/* Image card */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#1a3d2e]">
                <FallbackImg
                  src={getProductImage(p)}
                  fallback="/images/productos/default.jpg"
                  alt={getLocalizedField(p, "nombre", language) ?? p.nombre}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                {/* Green gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d2d20]/65 via-[#0d2d20]/10 to-transparent" />

                {/* Favorite button */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <FavoriteButton productId={String(p.id)} size="sm" />
                </div>

                {/* Info overlay */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <p className="font-serif italic text-white text-[14px] leading-tight line-clamp-2 sm:text-[15px]">
                    {getLocalizedField(p, "nombre", language) ?? p.nombre}
                  </p>
                  {p.departamento && (
                    <p className="mt-1 text-[9.5px] tracking-[0.16em] text-white/55 uppercase">
                      {p.departamento}
                    </p>
                  )}
                  <p className="mt-1.5 text-[11px] tracking-[0.18em] text-white/80 uppercase">
                    Q {Number(p.precio).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Category tag below */}
              {p.categoria && (
                <p className="mt-2 px-0.5 text-[10px] tracking-[0.16em] text-[#0d2d20]/45 uppercase">
                  {getLocalizedField(p.categoria_obj, "nombre", language) ?? p.categoria}
                </p>
              )}
            </Link>
          ))}
      </div>

      {!loading && productos.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#0d2d20]/40">
            <span className="text-[#d4a853] mr-2" aria-hidden>✦</span>
            Búsqueda
          </p>
          <p className="mt-4 font-serif italic text-[1.75rem] text-[#0d2d20] leading-tight">
            {tr("empty.noProductsTitle")}
          </p>
          <button
            onClick={handleReset}
            className="mt-6 border-b border-[#0d2d20]/20 pb-0.5 text-[11px] uppercase tracking-[0.26em] text-[#0d2d20]/55 transition hover:border-[#0d2d20]/50 hover:text-[#0d2d20]"
          >
            {tr("empty.noProductsAction")}
          </button>
        </div>
      )}
    </ProductDiscoveryLayout>
  );
}
