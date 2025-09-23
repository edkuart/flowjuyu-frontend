"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { OtroTipo } from "@/types/product"   // 🔹 importa el tipo centralizado

type Opcion = { id: number; nombre: string }

type Props = {
  accesorios: Opcion[]
  accesorioSel: string
  setAccesorioSel: (v: string) => void
  accesorioInput: string
  setAccesorioInput: (v: string) => void
  OTROS: string
  confirmarOtro: (tipo: OtroTipo, valor: string) => void   // 🔹 usa OtroTipo aquí
}

export function AccesorioSelect({
  accesorios,
  accesorioSel,
  setAccesorioSel,
  accesorioInput,
  setAccesorioInput,
  OTROS,
  confirmarOtro,
}: Props) {
  return (
    <div>
      <Label>Accesorio</Label>
      <select
        className="w-full border rounded-md px-3 py-2"
        value={accesorioSel}
        onChange={(e) => setAccesorioSel(e.target.value)}
      >
        <option value="">Seleccione…</option>
        {accesorios.map((a) => (
          <option key={a.id} value={String(a.id)}>
            {a.nombre}
          </option>
        ))}
        <option value={OTROS}>➕ Otros…</option>
      </select>

      {accesorioSel === OTROS && (
        <div className="mt-2 flex gap-2">
          <Input
            className="flex-1"
            placeholder="Otro accesorio (solo info)"
            value={accesorioInput}
            onChange={(e) => setAccesorioInput(e.target.value)}
          />
          <Button
            type="button"
            onClick={() => confirmarOtro("accesorio", accesorioInput)} // ✅ ahora no marca error
          >
            OK
          </Button>
        </div>
      )}
    </div>
  )
}
