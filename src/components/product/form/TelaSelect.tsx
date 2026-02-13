// src/components/product/form/TelaSelect.tsx
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { OtroTipo, Opcion } from "@/types/product"

type Props = {
  claseSel: string
  telas: Opcion[]
  telaSel: string
  setTelaSel: (v: string) => void
  telaInput: string
  setTelaInput: (v: string) => void
  OTROS: string
  NA: string
  confirmarOtro: (tipo: OtroTipo, valor: string) => void   // 🔹 aquí el fix
}

export function TelaSelect({
  claseSel,
  telas,
  telaSel,
  setTelaSel,
  telaInput,
  setTelaInput,
  OTROS,
  NA,
  confirmarOtro,
}: Props) {
  return (
    <div>
      <Label>Tela</Label>
      <select
        className="w-full border rounded-md px-3 py-2"
        disabled={!claseSel}
        value={telaSel}
        onChange={(e) => setTelaSel(e.target.value)}
      >
        <option value="">
          {claseSel ? "Seleccione…" : "Seleccione una clase primero"}
        </option>
        {telas.map((t) => (
          <option key={t.id} value={String(t.id)}>
            {t.nombre}
          </option>
        ))}
        <option value={OTROS}> Otros…</option>
        <option value={NA}>— No aplica —</option>
      </select>

      {telaSel === OTROS && (
        <div className="mt-2 flex gap-2">
          <Input
            className="flex-1"
            placeholder="Nueva tela (solo info)"
            value={telaInput}
            onChange={(e) => setTelaInput(e.target.value)}
          />
          <Button type="button" onClick={() => confirmarOtro("tela", telaInput)}>
            OK
          </Button>
        </div>
      )}
    </div>
  )
}
