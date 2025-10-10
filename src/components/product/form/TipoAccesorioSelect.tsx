"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { OtroTipo } from "@/types/product"   // 🔹 importamos el tipo

type Opcion = { id: number; nombre: string }

type Props = {
  tipos: Opcion[]
  tipoSel: string
  setTipoSel: (v: string) => void
  tipoInput: string
  setTipoInput: (v: string) => void
  OTROS: string
  confirmarOtro: (tipo: OtroTipo, valor: string) => void   // 🔹 usamos OtroTipo
}

export function TipoAccesorioSelect({
  tipos,
  tipoSel,
  setTipoSel,
  tipoInput,
  setTipoInput,
  OTROS,
  confirmarOtro,
}: Props) {
  return (
    <div>
      <Label>Tipo de accesorio</Label>
      <select
        className="w-full border rounded-md px-3 py-2"
        value={tipoSel}
        onChange={(e) => setTipoSel(e.target.value)}
      >
        <option value="">Seleccione…</option>
        {tipos.map((t) => (
          <option key={t.id} value={String(t.id)}>
            {t.nombre}
          </option>
        ))}
        <option value={OTROS}> Otros…</option>
      </select>

      {tipoSel === OTROS && (
        <div className="mt-2 flex gap-2">
          <Input
            className="flex-1"
            placeholder="Otro tipo (solo info)"
            value={tipoInput}
            onChange={(e) => setTipoInput(e.target.value)}
          />
          <Button type="button" onClick={() => confirmarOtro("tipo", tipoInput)}>
            OK
          </Button>
        </div>
      )}
    </div>
  )
}
