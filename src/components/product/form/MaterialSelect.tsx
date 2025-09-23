"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { OtroTipo } from "@/types/product"   // 🔹 importamos el tipo unificado

type Opcion = { id: number; nombre: string }

type Props = {
  materiales: Opcion[]
  materialSel: string
  setMaterialSel: (v: string) => void
  materialInput: string
  setMaterialInput: (v: string) => void
  OTROS: string
  confirmarOtro: (tipo: OtroTipo, valor: string) => void   // 🔹 ahora usa OtroTipo
}

export function MaterialSelect({
  materiales,
  materialSel,
  setMaterialSel,
  materialInput,
  setMaterialInput,
  OTROS,
  confirmarOtro,
}: Props) {
  return (
    <div>
      <Label>Material</Label>
      <select
        className="w-full border rounded-md px-3 py-2"
        value={materialSel}
        onChange={(e) => setMaterialSel(e.target.value)}
      >
        <option value="">Seleccione…</option>
        {materiales.map((m) => (
          <option key={m.id} value={String(m.id)}>
            {m.nombre}
          </option>
        ))}
        <option value={OTROS}>➕ Otros…</option>
      </select>

      {materialSel === OTROS && (
        <div className="mt-2 flex gap-2">
          <Input
            className="flex-1"
            placeholder="Otro material (solo info)"
            value={materialInput}
            onChange={(e) => setMaterialInput(e.target.value)}
          />
          <Button
            type="button"
            onClick={() => confirmarOtro("material", materialInput)} // ✅ ahora compatible
          >
            OK
          </Button>
        </div>
      )}
    </div>
  )
}
