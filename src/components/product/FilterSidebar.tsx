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
  precioMaxLimit?: number;
  onReset: () => void;
  variant?: "desktop" | "mobile";
};

const selectClass =
  "w-full appearance-none rounded-lg border border-[#0d2d20]/15 bg-white px-3 py-2.5 pr-9 text-sm text-[#0d2d20] transition-colors cursor-pointer focus:outline-none focus:border-[#0d2d20]/40 focus:ring-2 focus:ring-[#0d2d20]/10 bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%2212%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%230d2d20%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22><polyline%20points=%226%209%2012%2015%2018%209%22/></svg>')] bg-[length:12px_12px] bg-[right_0.75rem_center] bg-no-repeat";

const sliderClass =
  "h-[3px] w-full cursor-pointer appearance-none rounded-full bg-[#0d2d20]/10 accent-[#0d2d20] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0d2d20] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#f8f5ef] [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(13,45,32,0.2)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#0d2d20] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#f8f5ef]";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#0d2d20]/60">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="h-px bg-[#0d2d20]/10" />;
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
  precioMaxLimit = 10000,
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
    precioMax < precioMaxLimit ||
    sort !== "" ||
    (claseId ?? null) !== null ||
    (telaId ?? null) !== null ||
    (accesorioId ?? null) !== null ||
    (accesorioTipoId ?? null) !== null ||
    (accesorioMaterialId ?? null) !== null;

  const activeCount = [
    categoriaId,
    departamento || null,
    municipio || null,
    precioMin > 0 ? precioMin : null,
    precioMax < precioMaxLimit ? precioMax : null,
    sort || null,
    claseId,
    telaId,
    accesorioId,
    accesorioTipoId,
    accesorioMaterialId,
  ].filter((v) => v !== null && v !== undefined && v !== "").length;

  const isMobile = variant === "mobile";

  return (
    <aside
      className={[
        "overflow-hidden border border-[#0d2d20]/10 bg-[#f8f5ef]",
        isMobile
          ? "rounded-none border-0 p-5"
          : "sticky top-24 rounded-2xl p-5 shadow-[0_1px_2px_rgba(13,45,32,0.04)]",
      ].join(" ")}
    >
      <div className="mb-6 flex items-end justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#0d2d20]/50">
            <span className="mr-2 text-[#d4a853]" aria-hidden>✦</span>
            {tr("filters.title")}
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="font-serif italic text-2xl leading-none text-[#0d2d20]">
              Refinar
            </h2>
            {hasActiveFilters && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0d2d20] px-1.5 text-[10px] font-medium text-white">
                {activeCount}
              </span>
            )}
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#0d2d20]/50 transition-colors hover:text-[#0d2d20]"
          >
            {tr("filters.clearAll")}
          </button>
        )}
      </div>

      <div className="space-y-6">
        <section>
          <SectionTitle>{tr("filters.category")}</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCategoriaId(null)}
              className={[
                "rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors",
                categoriaId === null
                  ? "border-[#0d2d20] bg-[#0d2d20] text-white"
                  : "border-[#0d2d20]/20 bg-white text-[#0d2d20]/70 hover:border-[#0d2d20]/50 hover:text-[#0d2d20]",
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
                  "rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors",
                  categoriaId === c.id
                    ? "border-[#0d2d20] bg-[#0d2d20] text-white"
                    : "border-[#0d2d20]/20 bg-white text-[#0d2d20]/70 hover:border-[#0d2d20]/50 hover:text-[#0d2d20]",
                ].join(" ")}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </section>

        <Divider />

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <SectionTitle>{tr("filters.price")}</SectionTitle>
            <span className="font-serif italic text-sm text-[#0d2d20]">
              Q{precioMin}
              <span className="mx-1.5 text-[#0d2d20]/30">–</span>
              {precioMax >= precioMaxLimit ? "Sin límite" : `Q${precioMax}`}
            </span>
          </div>

          <div className="space-y-4 px-0.5">
            <div>
              <div className="mb-1.5 flex justify-between text-[10px] uppercase tracking-[0.22em] text-[#0d2d20]/50">
                <span>{tr("filters.min")}</span>
                <span className="normal-case tracking-normal text-[#0d2d20]/80">
                  Q{precioMin}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={precioMaxLimit}
                step={50}
                value={precioMin}
                onChange={handlePrecioMin}
                className={sliderClass}
              />
            </div>

            <div>
              <div className="mb-1.5 flex justify-between text-[10px] uppercase tracking-[0.22em] text-[#0d2d20]/50">
                <span>{tr("filters.max")}</span>
                <span className="normal-case tracking-normal text-[#0d2d20]/80">
                  {precioMax >= precioMaxLimit ? "Sin límite" : `Q${precioMax}`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={precioMaxLimit}
                step={50}
                value={precioMax}
                onChange={handlePrecioMax}
                className={sliderClass}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-medium text-[#0d2d20]/40">
                  Q
                </span>
                <input
                  type="number"
                  min={0}
                  max={precioMax - 1}
                  value={precioMin}
                  onChange={(e) =>
                    setPrecioMin(Math.min(Number(e.target.value), precioMax - 1))
                  }
                  className="w-full rounded-lg border border-[#0d2d20]/15 bg-white py-2 pl-7 pr-2 text-xs text-[#0d2d20] transition-colors focus:border-[#0d2d20]/40 focus:outline-none focus:ring-2 focus:ring-[#0d2d20]/10"
                  placeholder="0"
                />
              </div>
              <div className="h-px w-2 bg-[#0d2d20]/20" />
              <div className="relative flex-1">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-medium text-[#0d2d20]/40">
                  Q
                </span>
                <input
                  type="number"
                  min={precioMin + 1}
                  max={precioMaxLimit}
                  value={precioMax}
                  onChange={(e) =>
                    setPrecioMax(Math.max(Number(e.target.value), precioMin + 1))
                  }
                  className="w-full rounded-lg border border-[#0d2d20]/15 bg-white py-2 pl-7 pr-2 text-xs text-[#0d2d20] transition-colors focus:border-[#0d2d20]/40 focus:outline-none focus:ring-2 focus:ring-[#0d2d20]/10"
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
                      setClaseId!(e.target.value ? Number(e.target.value) : null)
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
              className="w-full rounded-full border-[#0d2d20]/20 bg-transparent py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#0d2d20] transition-colors hover:bg-[#0d2d20] hover:text-white"
              onClick={onReset}
            >
              {tr("filters.reset")}
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
