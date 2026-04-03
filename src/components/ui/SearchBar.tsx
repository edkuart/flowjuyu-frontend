"use client";

import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { getProductImage } from "@/lib/getProductImage";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { useCategorias } from "@/hooks/useCategorias";
import { useClases } from "@/hooks/useClases";
import { useAccesorios } from "@/hooks/useAccesorios";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  imagenes?: { url: string }[];
  categoria?: string | null;
};

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
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  const [query, setQuery] = useState("");
  const [showBox, setShowBox] = useState(false);
  const { data: categorias } = useCategorias();
  const { data: clases } = useClases();
  const { data: accesorios } = useAccesorios();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

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
    next = next.slice(0, 7);

    setHistory(next);
    localStorage.setItem("flowjuyu_history", JSON.stringify(next));
  };

  useEffect(() => {
    if (!query.trim()) {
      setProductos([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const url = `${API}/api/products?search=${encodeURIComponent(query.trim())}&limit=5`;
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setShowBox(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const qLower = query.trim().toLowerCase();
  const categoriasMatch =
    qLower.length === 0
      ? []
      : categorias.filter((c) => c.nombre.toLowerCase().includes(qLower));
  const clasesMatch =
    qLower.length === 0
      ? []
      : clases.filter((c) => c.nombre.toLowerCase().includes(qLower));
  const accesoriosMatch =
    qLower.length === 0
      ? []
      : accesorios.filter((a) => a.nombre.toLowerCase().includes(qLower));
  const mostrarVacio = !query.trim();

  return (
    <div className="relative w-full max-w-2xl" ref={boxRef}>
      <div className="relative">
        <input
          placeholder={tr("search.placeholder")}
          value={query}
          onFocus={() => setShowBox(true)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-10 w-full rounded-full border pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
        />

        <Search
          className="absolute top-3 left-3 h-4 w-4 cursor-pointer text-neutral-400"
          onClick={goToSearch}
        />
      </div>

      {showBox && (
        <div className="animate-fade-in absolute z-50 mt-2 max-h-[440px] w-full overflow-y-auto rounded-xl border bg-white p-3 shadow-2xl transition-opacity">
          {mostrarVacio && history.length > 0 && (
            <div className="mb-4">
              <p className="mb-1 text-xs font-semibold text-neutral-500">
                {tr("search.recentSearches")}
              </p>

              <div className="flex flex-wrap gap-2">
                {history.map((h) => (
                  <button
                    key={h}
                    className="rounded-full bg-neutral-100 px-2 py-1 text-xs transition hover:bg-neutral-200"
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

          {mostrarVacio && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-semibold text-neutral-500">
                {tr("search.exploreCategories")}
              </p>
              <div className="flex flex-wrap gap-2">
                {categorias.slice(0, 8).map((c) => (
                  <Link
                    key={c.id}
                    href={`/categorias/${slugify(c.nombre)}`}
                    onClick={() => setShowBox(false)}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-xs transition hover:bg-neutral-200"
                  >
                    {c.nombre}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!mostrarVacio && (
            <>
              {(categoriasMatch.length > 0 ||
                clasesMatch.length > 0 ||
                accesoriosMatch.length > 0) && (
                <div className="mb-3">
                  <p className="mb-1 text-xs font-semibold text-neutral-500">
                    {tr("search.categoryAndStyleMatches")}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {categoriasMatch.map((c) => (
                      <button
                        key={c.id}
                        className="rounded-full border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-100"
                        onClick={() => {
                          saveHistory(c.nombre);
                          router.push(
                            `/search?query=${encodeURIComponent(c.nombre)}`,
                          );
                          setShowBox(false);
                        }}
                      >
                        {c.nombre}
                      </button>
                    ))}

                    {clasesMatch.map((cl) => (
                      <button
                        key={cl.id}
                        className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs hover:bg-amber-100"
                        onClick={() => {
                          saveHistory(cl.nombre);
                          router.push(
                            `/search?query=${encodeURIComponent(cl.nombre)}`,
                          );
                          setShowBox(false);
                        }}
                      >
                        {cl.nombre}
                      </button>
                    ))}

                    {accesoriosMatch.map((a) => (
                      <button
                        key={a.id}
                        className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-2 py-1 text-xs hover:bg-fuchsia-100"
                        onClick={() => {
                          saveHistory(a.nombre);
                          router.push(
                            `/search?query=${encodeURIComponent(a.nombre)}`,
                          );
                          setShowBox(false);
                        }}
                      >
                        {a.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-1 text-xs font-semibold text-neutral-500">
                  {tr("search.productsLabel")}
                </p>

                {loading && (
                  <p className="px-1 py-1 text-xs text-neutral-400">
                    {tr("search.searchingProducts")}
                  </p>
                )}

                {!loading && productos.length === 0 && (
                  <p className="px-1 py-1 text-xs text-neutral-400">
                    {tr("search.noProductsForQuery").replace("{query}", query)}
                  </p>
                )}

                {!loading &&
                  productos.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      className="flex items-center gap-3 rounded px-2 py-2 transition hover:bg-neutral-100"
                      onClick={() => {
                        saveHistory(p.nombre);
                        setShowBox(false);
                      }}
                    >
                      <img
                        src={getProductImage(p)}
                        alt={p.nombre}
                        className="h-10 w-10 rounded border border-neutral-200 object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="line-clamp-1 text-sm font-medium">
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
