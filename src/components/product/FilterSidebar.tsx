// src/components/product/FilterSidebar.tsx
"use client";

import { useCallback, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";
import { departamentosConMunicipios } from "@/data/municipios";
import { sortClases, formatClaseLabel } from "@/lib/formatClase";

type Categoria = { id: number; nombre: string };
type Clase = { id: number; nombre: string; alias?: string };
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

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
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
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

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
    [precioMax, setPrecioMin],
  );

  const handlePrecioMax = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(Number(e.target.value), precioMin + 1);
      setPrecioMax(val);
    },
    [precioMin, setPrecioMax],
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
        "sticky top-24 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm",
        variant === "desktop" ? "p-5" : "p-4",
      ].join(" ")}
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-emerald-600"
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
          <h2 className="text-sm font-semibold text-neutral-800">
            {tr("filters.title")}
          </h2>
          {hasActiveFilters && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
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
            className="text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600"
          >
            {tr("filters.clearAll")}
          </button>
        )}
      </div>

      <div className="space-y-5">
        <section>
          <SectionTitle>{tr("filters.category")}</SectionTitle>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoriaId(null)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150",
                categoriaId === null
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-emerald-400 hover:text-emerald-700",
              ].join(" ")}
            >
              {tr("filters.allCategories")}
            </button>
            {categorias.map((c) => (
              <button
                key={c.id}
                onClick={() =>
                  setCategoriaId(categoriaId === c.id ? null : c.id)
                }
                className={[
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150",
                  categoriaId === c.id
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-emerald-400 hover:text-emerald-700",
                ].join(" ")}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </section>

        <Divider />

        <section>
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle>{tr("filters.price")}</SectionTitle>
            <span className="text-xs font-medium text-emerald-600">
              Q{precioMin} - Q{precioMax}
            </span>
          </div>

          <div className="space-y-3 px-1">
            <div>
              <div className="mb-1 flex justify-between text-xs text-neutral-400">
                <span>{tr("filters.min")}</span>
                <span className="font-medium text-neutral-600">
                  Q{precioMin}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={PRECIO_MAX_LIMIT}
                step={50}
                value={precioMin}
                onChange={handlePrecioMin}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-emerald-600"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs text-neutral-400">
                <span>{tr("filters.max")}</span>
                <span className="font-medium text-neutral-600">
                  Q{precioMax}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={PRECIO_MAX_LIMIT}
                step={50}
                value={precioMax}
                onChange={handlePrecioMax}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-emerald-600"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <div className="relative flex-1">
                <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-medium text-neutral-400">
                  Q
                </span>
                <input
                  type="number"
                  min={0}
                  max={precioMax - 1}
                  value={precioMin}
                  onChange={(e) =>
                    setPrecioMin(
                      Math.min(Number(e.target.value), precioMax - 1),
                    )
                  }
                  className="w-full rounded-lg border border-neutral-200 py-1.5 pr-2 pl-6 text-xs transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div className="flex items-center text-xs text-neutral-300">
                -
              </div>
              <div className="relative flex-1">
                <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-medium text-neutral-400">
                  Q
                </span>
                <input
                  type="number"
                  min={precioMin + 1}
                  max={PRECIO_MAX_LIMIT}
                  value={precioMax}
                  onChange={(e) =>
                    setPrecioMax(
                      Math.max(Number(e.target.value), precioMin + 1),
                    )
                  }
                  className="w-full rounded-lg border border-neutral-200 py-1.5 pr-2 pl-6 text-xs transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 focus:outline-none"
                  placeholder="2000"
                />
              </div>
            </div>
          </div>
        </section>

        <Divider />

        <section>
          <SectionTitle>{tr("filters.location")}</SectionTitle>
          <div className="space-y-2">
            <select
              className={selectClass}
              value={departamento}
              onChange={(e) => {
                setDepartamento(e.target.value);
                setMunicipio("");
              }}
            >
              <option value="">{tr("filters.allDepartments")}</option>
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
                <option value="">{tr("filters.allMunicipalities")}</option>
                {municipiosDelDepartamento.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}
          </div>
        </section>

        {showDetalles && (
          <>
            <Divider />
            <section>
              <SectionTitle>{tr("filters.details")}</SectionTitle>
              <div className="space-y-2">
                {showTextilFilters && (
                  <select
                    className={selectClass}
                    value={claseId ?? ""}
                    onChange={(e) =>
                      setClaseId!(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  >
                    <option value="">{tr("filters.allClasses")}</option>
                    {sortClases(clases).map((c) => (
                      <option key={c.id} value={c.id}>
                        {formatClaseLabel(c)}
                      </option>
                    ))}
                  </select>
                )}

                {showTextilFilters && telas.length > 0 && setTelaId && (
                  <select
                    className={selectClass}
                    value={telaId ?? ""}
                    onChange={(e) =>
                      setTelaId!(e.target.value ? Number(e.target.value) : null)
                    }
                  >
                    <option value="">{tr("filters.allFabrics")}</option>
                    {telas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                )}

                {showAccesorioFilters && (
                  <select
                    className={selectClass}
                    value={accesorioId ?? ""}
                    onChange={(e) =>
                      setAccesorioId!(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  >
                    <option value="">{tr("filters.allAccessories")}</option>
                    {accesorios.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                )}

                {showAccesorioFilters &&
                  accesorioTipos.length > 0 &&
                  setAccesorioTipoId && (
                    <select
                      className={selectClass}
                      value={accesorioTipoId ?? ""}
                      onChange={(e) =>
                        setAccesorioTipoId!(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    >
                      <option value="">{tr("filters.allTypes")}</option>
                      {accesorioTipos.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}
                        </option>
                      ))}
                    </select>
                  )}

                {showAccesorioFilters &&
                  accesorioMateriales.length > 0 &&
                  setAccesorioMaterialId && (
                    <select
                      className={selectClass}
                      value={accesorioMaterialId ?? ""}
                      onChange={(e) =>
                        setAccesorioMaterialId!(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    >
                      <option value="">{tr("filters.allMaterials")}</option>
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

        <section>
          <SectionTitle>{tr("filters.sortBy")}</SectionTitle>
          <select
            className={selectClass}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">{tr("filters.sortNewest")}</option>
            <option value="price_asc">{tr("filters.sortPriceAsc")}</option>
            <option value="price_desc">{tr("filters.sortPriceDesc")}</option>
          </select>
        </section>

        {hasActiveFilters && (
          <>
            <Divider />
            <Button
              variant="outline"
              className="w-full rounded-lg border-neutral-200 text-sm font-medium text-neutral-500 transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700"
              onClick={onReset}
            >
              <svg
                className="mr-1.5 h-3.5 w-3.5"
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
              {tr("filters.reset")}
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
