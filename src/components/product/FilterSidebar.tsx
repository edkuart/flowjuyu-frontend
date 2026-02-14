// src/components/product/FilterSidebar.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { departamentosConMunicipios } from "@/data/municipios";

type Categoria = {
  id: number;
  nombre: string;
};

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

  onReset: () => void;

  /** NUEVO */
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

      {/* Origen */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Origen</p>

        <div className="space-y-2">
          <label className="text-xs text-neutral-600">
            Departamento
          </label>
          <select
            className="w-full border rounded-lg p-2 text-sm bg-white"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
          >
            <option value="">-- Seleccione --</option>
            {departamentosConMunicipios.map((d) => (
              <option key={d.nombre}>{d.nombre}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-neutral-600">
            Municipio
          </label>
          <select
            className="w-full border rounded-lg p-2 text-sm bg-white"
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
              onClick={() =>
                ajustarPrecio(
                  tipo,
                  tipo === "min" ? -50 : -50
                )
              }
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
              onClick={() =>
                ajustarPrecio(
                  tipo,
                  tipo === "min" ? 50 : 50
                )
              }
            >
              +
            </Button>
          </div>
        ))}
      </div>

      {/* Orden */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Ordenar por
        </label>
        <select
          className="w-full border rounded-lg p-2 text-sm bg-white"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Más recientes</option>
          <option value="precio_asc">
            Precio: menor a mayor
          </option>
          <option value="precio_desc">
            Precio: mayor a menor
          </option>
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full text-red-500 text-sm font-medium hover:underline"
      >
        Limpiar filtros
      </button>
    </Card>
  );
}
