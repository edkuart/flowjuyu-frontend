"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type Opcion = { id: number; nombre: string }
type Clase = { id: number; nombre: string; alias?: string }

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null
const toDecimal = (v: string) => v.trim().replace(",", ".")

// Sentinelas UI
const OTROS = "__OTROS__"
const NA = "__NA__"

export default function AddProductPage() {
  const [estado, setEstado] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle")
  const [mensaje, setMensaje] = useState("")
  const [infoMsg, setInfoMsg] = useState("") // Mensaje informativo para “Otros”
  const [activo, setActivo] = useState(true)

  const [categorias, setCategorias] = useState<Opcion[]>([])
  const [clases, setClases] = useState<Clase[]>([])
  const [telas, setTelas] = useState<Opcion[]>([])
  const [regiones, setRegiones] = useState<Opcion[]>([])

  const [categoriaSel, setCategoriaSel] = useState<string>("")
  const [claseSel, setClaseSel] = useState<string>("")
  const [telaSel, setTelaSel] = useState<string>("")
  const [regionSel, setRegionSel] = useState<string>("")

  // textos libres (solo info/telemetría)
  const [categoriaInput, setCategoriaInput] = useState("")
  const [telaInput, setTelaInput] = useState("")
  const [regionInput, setRegionInput] = useState("")

  const fileRef = useRef<HTMLInputElement>(null)

  const fetchJSON = async <T,>(path: string, init?: RequestInit) => {
    const r = await fetch(`${API}${path}`, {
      credentials: "include",
      cache: "no-store",
      ...init,
    })
    if (!r.ok) throw new Error(await r.text())
    return (await r.json()) as T
  }

  useEffect(() => {
    ;(async () => {
      try {
        const [cats, cls, regs] = await Promise.all([
          fetchJSON<Opcion[]>("/api/categorias"),
          fetchJSON<Clase[]>("/api/clases"),
          fetchJSON<Opcion[]>("/api/regiones"),
        ])
        setCategorias(cats)
        setClases(cls)
        setRegiones(regs)
      } catch (e: any) {
        setEstado("error")
        setMensaje(e.message || "No se pudieron cargar opciones.")
      }
    })()
  }, [])

  useEffect(() => {
    setTelaSel("")
    if (!claseSel || claseSel === OTROS) {
      setTelas([])
      return
    }
    ;(async () => {
      try {
        setTelas(await fetchJSON<Opcion[]>(`/api/telas?clase_id=${claseSel}`))
      } catch (e: any) {
        setEstado("error")
        setMensaje(e.message || "No se pudieron cargar telas.")
      }
    })()
  }, [claseSel])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget as any

    if (!categoriaSel) return err("Selecciona una categoría (o agrega Otra).")
    if (!claseSel) return err("Selecciona clase.")
    if (!regionSel) return err("Selecciona región (o agrega Otra).")
    if (telaSel !== NA && telaSel !== OTROS && !telaSel)
      return err("Selecciona tela o 'No aplica'.")

    if (categoriaSel === OTROS && !categoriaInput.trim())
      return err("Escribe la nueva categoría (solo información).")
    if (regionSel === OTROS && !regionInput.trim())
      return err("Escribe la nueva región (solo información).")
    if (telaSel === OTROS && !telaInput.trim())
      return err("Escribe la nueva tela (solo información).")

    const fd = new FormData(form)
    fd.set("precio", toDecimal(String(form["precio"].value)))

    // Categoría
    if (categoriaSel === OTROS) {
      fd.set("categoria_id", "") // null en backend
      fd.set("categoria_input", categoriaInput)
    } else {
      fd.set("categoria_id", categoriaSel)
      fd.delete("categoria_input")
    }

    fd.set("clase_id", claseSel)

    // Región
    if (regionSel === OTROS) {
      fd.set("region_id", "") // null en backend
      fd.set("region_input", regionInput)
    } else {
      fd.set("region_id", regionSel)
      fd.delete("region_input")
    }

    // Tela
    if (telaSel === NA) {
      fd.set("tela_id", "")
      fd.delete("tela_input")
    } else if (telaSel === OTROS) {
      fd.set("tela_id", "") // null en backend
      fd.set("tela_input", telaInput)
    } else {
      fd.set("tela_id", telaSel)
      fd.delete("tela_input")
    }

    fd.set("activo", String(activo))

    const files = fileRef.current?.files
    if (files)
      Array.from(files)
        .slice(0, 9)
        .forEach((f) => fd.append("imagenes[]", f))

    try {
      setEstado("loading")
      setMensaje("")
      const headers: HeadersInit = {}
      const token = getToken()
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch(`${API}/api/productos`, {
        method: "POST",
        body: fd,
        headers,
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())

      ok("✅ Producto creado con éxito.")
      ;(e.target as HTMLFormElement).reset()
      setCategoriaSel("")
      setClaseSel("")
      setTelaSel("")
      setRegionSel("")
      setActivo(true)
      setCategoriaInput("")
      setTelaInput("")
      setRegionInput("")
      if (fileRef.current) fileRef.current.value = ""
    } catch (err: any) {
      errMsg(err.message || "Error al guardar el producto.")
    }
  }

  const err = (m: string) => {
    setEstado("error")
    setMensaje(m)
  }
  const ok = (m: string) => {
    setEstado("ok")
    setMensaje(m)
  }
  const errMsg = (m: string) => err(m)

  const handlePrecioKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const ok =
      ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(
        e.key
      ) || /[0-9.,]/.test(e.key)
    if (!ok) e.preventDefault()
  }

  // confirmar input “Otros”
  const confirmarOtro = (
    tipo: "categoria" | "tela" | "region",
    valor: string
  ) => {
    if (!valor.trim()) return
    setInfoMsg(`"${valor}" agregado como información en ${tipo}.`)
    setTimeout(() => setInfoMsg(""), 4000)
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Agregar nuevo producto</h1>
      <form className="space-y-5" onSubmit={onSubmit}>
        {/* CATEGORÍA */}
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
            <option value={OTROS}>➕ Otros…</option>
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

        {/* CLASE */}
        <div>
          <Label>Clase</Label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={claseSel}
            onChange={(e) => setClaseSel(e.target.value)}
          >
            <option value="">Seleccione…</option>
            {clases.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* TELA */}
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
            <option value={OTROS}>➕ Otros…</option>
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
              <Button
                type="button"
                onClick={() => confirmarOtro("tela", telaInput)}
              >
                OK
              </Button>
            </div>
          )}
        </div>

        {/* REGIÓN */}
        <div>
          <Label>Región</Label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={regionSel}
            onChange={(e) => setRegionSel(e.target.value)}
          >
            <option value="">Seleccione…</option>
            {regiones.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.nombre}
              </option>
            ))}
            <option value={OTROS}>➕ Otros…</option>
          </select>
          {regionSel === OTROS && (
            <div className="mt-2 flex gap-2">
              <Input
                className="flex-1"
                placeholder="Nueva región (solo info)"
                value={regionInput}
                onChange={(e) => setRegionInput(e.target.value)}
              />
              <Button
                type="button"
                onClick={() => confirmarOtro("region", regionInput)}
              >
                OK
              </Button>
            </div>
          )}
        </div>

        {/* MENSAJE DE CONFIRMACIÓN */}
        {infoMsg && <p className="text-sm text-blue-600">{infoMsg}</p>}

        {/* DATOS BÁSICOS */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Nombre del producto</Label>
            <Input name="nombre" required placeholder="Ej. Huipil de Sololá" />
          </div>
          <div>
            <Label>Precio</Label>
            <Input
              name="precio"
              type="text"
              inputMode="decimal"
              pattern="^[0-9]+([.,][0-9]{1,2})?$"
              title="Ejemplo: 10, 10.5 o 10,50"
              onKeyDown={handlePrecioKeyDown}
              onBlur={(e) => {
                const v = e.currentTarget.value.trim()
                if (v) e.currentTarget.value = toDecimal(v)
              }}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Label>Stock</Label>
            <Input name="stock" type="number" min={0} required />
          </div>
          <div className="flex items-center justify-between">
            <Label>Producto activo</Label>
            <Switch checked={activo} onCheckedChange={setActivo} />
          </div>
        </div>

        <div>
          <Label>Descripción</Label>
          <Textarea name="descripcion" rows={4} required />
        </div>
        <div>
          <Label>Imágenes (máx. 9)</Label>
          <Input ref={fileRef} type="file" accept="image/*" multiple />
        </div>

        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={estado === "loading"}
        >
          {estado === "loading" ? "Guardando…" : "Guardar producto"}
        </Button>
        {mensaje && (
          <p
            className={`text-sm ${
              estado === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {mensaje}
          </p>
        )}
      </form>
    </main>
  )
}
