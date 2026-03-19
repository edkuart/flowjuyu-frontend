// src/components/product/FilterSidebar.tsx
"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { departamentosConMunicipios } from "@/data/municipios";

type Categoria = { id: number; nombre: string };
type Clase = { id: number; nombre: string };
type Tela = { id: number; nombre: string };
type Accesorio = { id: number; nombre: string };
type AccesorioTipo = { id: number; nombre: string };
type AccesorioMaterial = { id: number; nombre: string };

type Props = {
  categorias?: Categoria[];
  categoriaId: number | null;
  setCategoriaId: (v: number | null) => void;

  departamento: string;
  setDepartamento: (v: string) => void;

  municipio: string;
  setMunicipio: (v: string) => void;

  precioMin: number;
  precioMax: number;
  setPrecioMin: (v: number) => void;
  setPrecioMax: (v: number) => void;

  sort: string;
  setSort: (v: string) => void;

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

  onReset: () => void;
  variant?: "desktop" | "mobile";
};

const PRECIO_MAX_LIMIT = 2000;

const selectClass =
  "w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors cursor-pointer";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="border-t border-neutral-100" />;
}

export default function FilterSidebar({
  categorias = [],
  categoriaId,
  setCategoriaId,

  departamento,
  setDepartamento,
  municipio,
  setMunicipio,

  precioMin,
  precioMax,
  setPrecioMin,
  setPrecioMax,

  sort,
  setSort,

  clases = [],
  claseId = null,
  setClaseId,

  telas = [],
  telaId = null,
  setTelaId,

  accesorios = [],
  accesorioId = null,
  setAccesorioId,

  accesorioTipos = [],
  accesorioTipoId = null,
  setAccesorioTipoId,

  accesorioMateriales = [],
  accesorioMaterialId = null,
  setAccesorioMaterialId,

  onReset,
  variant = "desktop",
}: Props) {
  const municipiosDelDepartamento =
    departamentosConMunicipios.find((d) => d.nombre === departamento)
      ?.municipios || [];

  const showTextilFilters = clases.length > 0 && setClaseId;
  const showAccesorioFilters = accesorios.length > 0 && setAccesorioId;
  const showDetalles = showTextilFilters || showAccesorioFilters;

  const handlePrecioMin = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.min(Number(e.target.value), precioMax - 1);
      setPrecioMin(val);
    },
    [precioMax, setPrecioMin]
  );

  const handlePrecioMax = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(Number(e.target.value), precioMin + 1);
      setPrecioMax(val);
    },
    [precioMin, setPrecioMax]
  );

  const hasActiveFilters =
    categoriaId !== null ||
    departamento !== "" ||
    municipio !== "" ||
    precioMin > 0 ||
    precioMax < PRECIO_MAX_LIMIT ||
    sort !== "" ||
    (claseId ?? null) !== null ||
    (telaId ?? null) !== null ||
    (accesorioId ?? null) !== null ||
    (accesorioTipoId ?? null) !== null ||
    (accesorioMaterialId ?? null) !== null;

  return (
    <aside
      className={[
        "bg-white rounded-2xl shadow-sm border border-neutral-100 sticky top-24 overflow-hidden",
        variant === "desktop" ? "p-5" : "p-4",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          <h2 className="text-sm font-semibold text-neutral-800">Filtros</h2>
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
              {
                [
                  categoriaId,
                  departamento || null,
                  municipio || null,
                  precioMin > 0 ? precioMin : null,
                  precioMax < PRECIO_MAX_LIMIT ? precioMax : null,
                  sort || null,
                  claseId,
                  telaId,
                  accesorioId,
                  accesorioTipoId,
                  accesorioMaterialId,
                ].filter(Boolean).length
              }
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors font-medium"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* ─── CATEGORÍA ─── */}
        <section>
          <SectionTitle>Categoría</SectionTitle>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoriaId(null)}
              className={[
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
                categoriaId === null
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-emerald-400 hover:text-emerald-700",
              ].join(" ")}
            >
              Todas
            </button>
            {categorias.map((c) => (
              <button
                key={c.id}
                onClick={() =>
                  setCategoriaId(categoriaId === c.id ? null : c.id)
                }
                className={[
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
                  categoriaId === c.id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-emerald-400 hover:text-emerald-700",
                ].join(" ")}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </section>

        <Divider />

        {/* ─── PRECIO ─── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Precio</SectionTitle>
            <span className="text-xs font-medium text-emerald-600">
              Q{precioMin} – Q{precioMax}
            </span>
          </div>

          <div className="space-y-3 px-1">
            {/* Min slider */}
            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Mínimo</span>
                <span className="font-medium text-neutral-600">Q{precioMin}</span>
              </div>
              <input
                type="range"
                min={0}
                max={PRECIO_MAX_LIMIT}
                step={50}
                value={precioMin}
                onChange={handlePrecioMin}
                className="w-full h-1.5 appearance-none rounded-full bg-neutral-200 accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Max slider */}
            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Máximo</span>
                <span className="font-medium text-neutral-600">Q{precioMax}</span>
              </div>
              <input
                type="range"
                min={0}
                max={PRECIO_MAX_LIMIT}
                step={50}
                value={precioMax}
                onChange={handlePrecioMax}
                className="w-full h-1.5 appearance-none rounded-full bg-neutral-200 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <div className="flex-1 relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium">
                  Q
                </span>
                <input
                  type="number"
                  min={0}
                  max={precioMax - 1}
                  value={precioMin}
                  onChange={(e) =>
                    setPrecioMin(
                      Math.min(Number(e.target.value), precioMax - 1)
                    )
                  }
                  className="w-full pl-6 pr-2 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
                  placeholder="0"
                />
              </div>
              <div className="flex items-center text-neutral-300 text-xs">—</div>
              <div className="flex-1 relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium">
                  Q
                </span>
                <input
                  type="number"
                  min={precioMin + 1}
                  max={PRECIO_MAX_LIMIT}
                  value={precioMax}
                  onChange={(e) =>
                    setPrecioMax(
                      Math.max(Number(e.target.value), precioMin + 1)
                    )
                  }
                  className="w-full pl-6 pr-2 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
                  placeholder="2000"
                />
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ─── UBICACIÓN ─── */}
        <section>
          <SectionTitle>Ubicación</SectionTitle>
          <div className="space-y-2">
            <select
              className={selectClass}
              value={departamento}
              onChange={(e) => {
                setDepartamento(e.target.value);
                setMunicipio("");
              }}
            >
              <option value="">Todos los departamentos</option>
              {departamentosConMunicipios.map((d) => (
                <option key={d.nombre} value={d.nombre}>
                  {d.nombre}
                </option>
              ))}
            </select>

            {departamento && municipiosDelDepartamento.length > 0 && (
              <select
                className={selectClass}
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
              >
                <option value="">Todos los municipios</option>
                {municipiosDelDepartamento.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}
          </div>
        </section>

        {/* ─── DETALLES (Textil / Accesorios) ─── */}
        {showDetalles && (
          <>
            <Divider />
            <section>
              <SectionTitle>Detalles</SectionTitle>
              <div className="space-y-2">
                {/* Textil: Clase */}
                {showTextilFilters && (
                  <select
                    className={selectClass}
                    value={claseId ?? ""}
                    onChange={(e) =>
                      setClaseId!(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  >
                    <option value="">Todas las clases</option>
                    {clases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                )}

                {/* Textil: Tela (sólo si hay clase seleccionada) */}
                {showTextilFilters && telas.length > 0 && setTelaId && (
                  <select
                    className={selectClass}
                    value={telaId ?? ""}
                    onChange={(e) =>
                      setTelaId!(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  >
                    <option value="">Todas las telas</option>
                    {telas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                )}

                {/* Accesorios */}
                {showAccesorioFilters && (
                  <select
                    className={selectClass}
                    value={accesorioId ?? ""}
                    onChange={(e) =>
                      setAccesorioId!(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  >
                    <option value="">Todos los accesorios</option>
                    {accesorios.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                )}

                {/* Accesorio Tipo */}
                {showAccesorioFilters &&
                  accesorioTipos.length > 0 &&
                  setAccesorioTipoId && (
                    <select
                      className={selectClass}
                      value={accesorioTipoId ?? ""}
                      onChange={(e) =>
                        setAccesorioTipoId!(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    >
                      <option value="">Todos los tipos</option>
                      {accesorioTipos.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}
                        </option>
                      ))}
                    </select>
                  )}

                {/* Accesorio Material */}
                {showAccesorioFilters &&
                  accesorioMateriales.length > 0 &&
                  setAccesorioMaterialId && (
                    <select
                      className={selectClass}
                      value={accesorioMaterialId ?? ""}
                      onChange={(e) =>
                        setAccesorioMaterialId!(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    >
                      <option value="">Todos los materiales</option>
                      {accesorioMateriales.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                  )}
              </div>
            </section>
          </>
        )}

        <Divider />

        {/* ─── ORDEN ─── */}
        <section>
          <SectionTitle>Ordenar por</SectionTitle>
          <select
            className={selectClass}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Más recientes</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
          </select>
        </section>

        {/* ─── RESET ─── */}
        {hasActiveFilters && (
          <>
            <Divider />
            <Button
              variant="outline"
              className="w-full rounded-lg text-sm font-medium text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-700 hover:border-neutral-300 transition-all"
              onClick={onReset}
            >
              <svg
                className="w-3.5 h-3.5 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Restablecer filtros
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
