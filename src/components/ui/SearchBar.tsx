"use client";

import {
  useState,
  useEffect,
  useRef,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

type Categoria = { id: number; nombre: string; imagen_url?: string | null };
type Clase = { id: number; nombre: string; alias?: string | null };
type Accesorio = { id: number; nombre: string; categoria_tipo?: string | null };

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  categoria?: string | null;
};

// Convertir nombre a slug
function slugify(nombre: string) {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function SearchBar() {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [showBox, setShowBox] = useState(false);

  // Catálogos
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [accesorios, setAccesorios] = useState<Accesorio[]>([]);

  // Productos sugeridos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);

  // Historial
  const [history, setHistory] = useState<string[]>([]);

  // ============================
  // Cargar catálogos (una vez)
  // ============================
  useEffect(() => {
    async function loadCatalogos() {
      try {
        const [catRes, clsRes, accNormalRes, accTipicoRes] = await Promise.all([
          fetch(`${API}/api/categorias`).then((r) => r.json()),
          fetch(`${API}/api/clases`).then((r) => r.json()),
          fetch(`${API}/api/accesorios?tipo=normal`).then((r) => r.json()),
          fetch(`${API}/api/accesorios?tipo=tipico`).then((r) => r.json()),
        ]);

        setCategorias(catRes || []);
        setClases(clsRes || []);

        // Unir accesorios normales + típicos, evitando duplicados
        const mapa = new Map<number, Accesorio>();
        [...(accNormalRes || []), ...(accTipicoRes || [])].forEach((a: Accesorio) => {
          if (!mapa.has(a.id)) mapa.set(a.id, a);
        });

        setAccesorios([...mapa.values()]);
      } catch (e) {
        console.error("Error cargando catálogos searchbar:", e);
      }
    }

    loadCatalogos();
  }, []);

  // ============================
  // Cargar historial
  // ============================
  useEffect(() => {
    const saved = localStorage.getItem("flowjuyu_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const saveHistory = (term: string) => {
    const clean = term.trim();
    if (!clean) return;

    let next = [clean, ...history.filter((h) => h !== clean)];
    next = next.slice(0, 7); // máximo 7

    setHistory(next);
    localStorage.setItem("flowjuyu_history", JSON.stringify(next));
  };

  // ====================================================
  // Autosuggest productos (debounce)
  // ====================================================
  useEffect(() => {
    if (!query.trim()) {
      setProductos([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        const url = `${API}/api/products?search=${encodeURIComponent(
          query.trim(),
        )}&limit=5`;

        const res = await fetch(url);
        const data = await res.json();

        setProductos(data.data || []);
      } catch (err) {
        console.error("Error autosuggest productos:", err);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(delay);
  }, [query]);

  // ============================
  // Cerrar caja al hacer click fuera
  // ============================
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setShowBox(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ============================
  // Buscar (ENTER / icono)
  // ============================
  const goToSearch = () => {
    const q = query.trim();
    if (!q) return;
    saveHistory(q);
    router.push(`/search?query=${encodeURIComponent(q)}`);
    setShowBox(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") goToSearch();
  };

  // ============================
  // Coincidencias en catálogos
  // ============================
  const qLower = query.trim().toLowerCase();

  const categoriasMatch =
    qLower.length === 0
      ? []
      : categorias.filter((c) =>
          c.nombre.toLowerCase().includes(qLower),
        );

  const clasesMatch =
    qLower.length === 0
      ? []
      : clases.filter((c) =>
          c.nombre.toLowerCase().includes(qLower),
        );

  const accesoriosMatch =
    qLower.length === 0
      ? []
      : accesorios.filter((a) =>
          a.nombre.toLowerCase().includes(qLower),
        );

  const mostrarVacio = !query.trim();

  return (
    <div className="relative w-full max-w-2xl" ref={boxRef}>
      {/* INPUT PRINCIPAL */}
      <div className="relative">
        <input
          placeholder="Buscar productos, categorías o estilos..."
          value={query}
          onFocus={() => setShowBox(true)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-10 rounded-full border pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
        />

        <Search
          className="absolute left-3 top-3 h-4 w-4 text-neutral-400 cursor-pointer"
          onClick={goToSearch}
        />
      </div>

      {/* CAJA DE RESULTADOS */}
      {showBox && (
        <div className="absolute z-50 w-full mt-2 bg-white border shadow-2xl rounded-xl p-3 max-h-[440px] overflow-y-auto transition-opacity animate-fade-in">
          
          {/* ================= HISTORIAL ================= */}
          {mostrarVacio && history.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-neutral-500 mb-1">
                Búsquedas recientes
              </p>

              <div className="flex flex-wrap gap-2">
                {history.map((h) => (
                  <button
                    key={h}
                    className="px-2 py-1 text-xs rounded-full bg-neutral-100 hover:bg-neutral-200 transition"
                    onClick={() => {
                      setQuery(h);
                      saveHistory(h);
                      router.push(`/search?query=${encodeURIComponent(h)}`);
                      setShowBox(false);
                    }}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= CATEGORÍAS SUGERIDAS ================= */}
          {mostrarVacio && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-neutral-500 mb-1">
                Explorar categorías
              </p>
              <div className="flex flex-wrap gap-2">
                {categorias.slice(0, 8).map((c) => (
                  <Link
                    key={c.id}
                    href={`/categorias/${slugify(c.nombre)}`}
                    onClick={() => setShowBox(false)}
                    className="px-3 py-1 text-xs rounded-full bg-neutral-100 hover:bg-neutral-200 transition"
                  >
                    {c.nombre}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ================= COINCIDENCIAS EN CATÁLOGOS ================= */}
          {!mostrarVacio && (
            <>
              {(categoriasMatch.length > 0 ||
                clasesMatch.length > 0 ||
                accesoriosMatch.length > 0) && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-neutral-500 mb-1">
                    Coincidencias en categorías y estilos
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {categoriasMatch.map((c) => (
                      <button
                        key={c.id}
                        className="px-2 py-1 text-xs rounded-full border border-neutral-200 hover:bg-neutral-100"
                        onClick={() => {
                          saveHistory(c.nombre);
                          router.push(`/search?query=${encodeURIComponent(c.nombre)}`);
                          setShowBox(false);
                        }}
                      >
                        {c.nombre}
                      </button>
                    ))}

                    {clasesMatch.map((cl) => (
                      <button
                        key={cl.id}
                        className="px-2 py-1 text-xs rounded-full border border-amber-200 bg-amber-50 hover:bg-amber-100"
                        onClick={() => {
                          saveHistory(cl.nombre);
                          router.push(`/search?query=${encodeURIComponent(cl.nombre)}`);
                          setShowBox(false);
                        }}
                      >
                        {cl.nombre}
                      </button>
                    ))}

                    {accesoriosMatch.map((a) => (
                      <button
                        key={a.id}
                        className="px-2 py-1 text-xs rounded-full border border-fuchsia-200 bg-fuchsia-50 hover:bg-fuchsia-100"
                        onClick={() => {
                          saveHistory(a.nombre);
                          router.push(`/search?query=${encodeURIComponent(a.nombre)}`);
                          setShowBox(false);
                        }}
                      >
                        {a.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= RESULTADOS DE PRODUCTOS ================= */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 mb-1">
                  Productos
                </p>

                {loading && (
                  <p className="text-xs text-neutral-400 px-1 py-1">
                    Buscando productos...
                  </p>
                )}

                {!loading && productos.length === 0 && (
                  <p className="text-xs text-neutral-400 px-1 py-1">
                    No se encontraron productos para "{query}"
                  </p>
                )}

                {!loading &&
                  productos.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-100 transition"
                      onClick={() => {
                        saveHistory(p.nombre);
                        setShowBox(false);
                      }}
                    >
                      <img
                        src={p.imagen_url || "/placeholder.jpg"}
                        alt={p.nombre}
                        className="w-10 h-10 rounded object-cover border border-neutral-200"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium line-clamp-1">
                          {p.nombre}
                        </span>
                        <span className="text-xs text-neutral-500">
                          Q{Number(p.precio).toFixed(2)}
                        </span>
                      </div>
                    </Link>
                  ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}