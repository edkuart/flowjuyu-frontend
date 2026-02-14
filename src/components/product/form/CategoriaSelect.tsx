// src/components/product/form/CategoriaSelect.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { OtroTipo } from "@/types/product";

type Props = {
  categorias: { id: number; nombre: string }[];
  categoriaSel: string;
  setCategoriaSel: (v: string) => void;
  categoriaInput: string;
  setCategoriaInput: (v: string) => void;
  OTROS: string;
  confirmarOtro: (tipo: OtroTipo, valor: string) => void;
};

export function CategoriaSelect({
  categorias,
  categoriaSel,
  setCategoriaSel,
  categoriaInput,
  setCategoriaInput,
  OTROS,
  confirmarOtro,
}: Props) {
  return (
    <div>
      <Label>Categoría</Label>

      <select
        className="w-full border rounded-md px-3 py-2"
        value={categoriaSel}
        onChange={(e) => setCategoriaSel(e.target.value)}
      >
        <option value="">Seleccione…</option>

        {categorias.map((c) => (
          <option key={c.id} value={String(c.id)}>
            {c.nombre}
          </option>
        ))}

        <option value={OTROS}>Otros…</option>
      </select>

      {categoriaSel === OTROS && (
        <div className="mt-2 flex gap-2">
          <Input
            className="flex-1"
            placeholder="Nueva categoría (solo info)"
            value={categoriaInput}
            onChange={(e) => setCategoriaInput(e.target.value)}
          />
          <Button
            type="button"
            onClick={() => confirmarOtro("categoria", categoriaInput)}
          >
            OK
          </Button>
        </div>
      )}
    </div>
  );
}
