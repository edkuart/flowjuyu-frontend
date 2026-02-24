// src/components/product/FilterSidebar.tsx

"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  // 🔥 NUEVOS
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
    departamentosConMunicipios.find(
      (d) => d.nombre === departamento
    )?.municipios || [];

  const ajustarPrecio = (campo: "min" | "max", delta: number) => {
    if (campo === "min") {
      setPrecioMin(Math.max(0, precioMin + delta));
    } else {
      setPrecioMax(Math.max(precioMin, precioMax + delta));
    }
  };

  return (
    <Card
      className={[
        "rounded-2xl shadow-sm space-y-6",
        variant === "desktop" ? "p-6" : "p-4",
      ].join(" ")}
    >
      <h2 className="text-base font-semibold">Filtros</h2>

      {/* Categoría */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Categoría</label>
        <select
          className="w-full border rounded-lg p-2 text-sm bg-white"
          value={categoriaId ?? ""}
          onChange={(e) =>
            setCategoriaId(
              e.target.value ? Number(e.target.value) : null
            )
          }
        >
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* 🔥 CLASES (TEXTIL) */}
      {clases.length > 0 && setClaseId && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Clase</label>
          <select
            className="w-full border rounded-lg p-2 text-sm bg-white"
            value={claseId ?? ""}
            onChange={(e) =>
              setClaseId(
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">Todas</option>
            {clases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 🔥 TELAS */}
      {telas.length > 0 && setTelaId && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Tela</label>
          <select
            className="w-full border rounded-lg p-2 text-sm bg-white"
            value={telaId ?? ""}
            onChange={(e) =>
              setTelaId(
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">Todas</option>
            {telas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 🔥 ACCESORIOS */}
      {accesorios.length > 0 && setAccesorioId && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Accesorio</label>
          <select
            className="w-full border rounded-lg p-2 text-sm bg-white"
            value={accesorioId ?? ""}
            onChange={(e) =>
              setAccesorioId(
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">Todos</option>
            {accesorios.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Precio */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Precio</p>

        {(["min", "max"] as const).map((tipo) => (
          <div key={tipo} className="flex items-center gap-2">
            <span className="text-xs w-10">
              {tipo === "min" ? "Min" : "Máx"}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => ajustarPrecio(tipo, -50)}
            >
              -
            </Button>

            <Input
              type="number"
              value={tipo === "min" ? precioMin : precioMax}
              onChange={(e) =>
                tipo === "min"
                  ? setPrecioMin(Number(e.target.value))
                  : setPrecioMax(Number(e.target.value))
              }
              className="h-8"
            />

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => ajustarPrecio(tipo, 50)}
            >
              +
            </Button>
          </div>
        ))}
      </div>

      {/* Orden */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Ordenar por</label>
        <select
          className="w-full border rounded-lg p-2 text-sm bg-white"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Más recientes</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a menor</option>
        </select>
      </div>

      <button
        onClick={onReset}
        className="w-full text-red-500 text-sm font-medium hover:underline"
      >
        Limpiar filtros
      </button>
    </Card>
  );
}
