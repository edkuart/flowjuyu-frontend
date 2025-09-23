"use client"
import { Label } from "@/components/ui/label"

type Props = {
  departamentosConMunicipios: { nombre: string; municipios: string[] }[]
  departamentoSel: string
  setDepartamentoSel: (v: string) => void
  municipioSel: string
  setMunicipioSel: (v: string) => void
  municipios: string[]
  handleDepartamentoChange: (dep: string) => void
}

export function OrigenSelect({
  departamentosConMunicipios,
  departamentoSel,
  setDepartamentoSel,
  municipioSel,
  setMunicipioSel,
  municipios,
  handleDepartamentoChange,
}: Props) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
      <h2 className="text-lg font-semibold">📍 Este producto es originario de (opcional)</h2>
      <div>
        <Label>Departamento</Label>
        <select
          className="w-full border rounded-md px-3 py-2"
          value={departamentoSel}
          onChange={(e) => handleDepartamentoChange(e.target.value)}
        >
          <option value="">-- Seleccione--</option>
          {departamentosConMunicipios.map((d) => (
            <option key={d.nombre} value={d.nombre}>{d.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <Label>Municipio</Label>
        <select
          className="w-full border rounded-md px-3 py-2"
          value={municipioSel}
          onChange={(e) => setMunicipioSel(e.target.value)}
          disabled={!departamentoSel}
        >
          <option value="">-- Seleccione --</option>
          {municipios.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
