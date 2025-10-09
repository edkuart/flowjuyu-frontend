"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { departamentosConMunicipios } from "@/data/municipios"

// Subcomponentes
import { CategoriaSelect } from "@/components/product/form/CategoriaSelect"
import { AccesorioSelect } from "@/components/product/form/AccesorioSelect"
import { TipoAccesorioSelect } from "@/components/product/form/TipoAccesorioSelect"
import { MaterialSelect } from "@/components/product/form/MaterialSelect"
import { TelaSelect } from "@/components/product/form/TelaSelect"
import { OrigenSelect } from "@/components/product/form/OrigenSelect"

import type { Opcion, Clase, OtroTipo } from "@/types/product"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null
const toDecimal = (v: string) => v.trim().replace(",", ".")

const OTROS = "__OTROS__"
const NA = "__NA__"

export default function AddProductPage() {
  const router = useRouter()

  const [estado, setEstado] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [mensaje, setMensaje] = useState("")
  const [infoMsg, setInfoMsg] = useState("")
  const [activo, setActivo] = useState(true)

  const [categorias, setCategorias] = useState<Opcion[]>([])
  const [clases, setClases] = useState<Clase[]>([])
  const [telas, setTelas] = useState<Opcion[]>([])

  const [categoriaSel, setCategoriaSel] = useState("")
  const [claseSel, setClaseSel] = useState("")
  const [telaSel, setTelaSel] = useState("")

  // Accesorios
  const [accesorios, setAccesorios] = useState<Opcion[]>([])
  const [accesorioSel, setAccesorioSel] = useState("")
  const [accesorioInput, setAccesorioInput] = useState("")

  // Tipos (solo Accesorios normales)
  const [tipos, setTipos] = useState<Opcion[]>([])
  const [tipoSel, setTipoSel] = useState("")
  const [tipoInput, setTipoInput] = useState("")

  // Materiales
  const [materiales, setMateriales] = useState<Opcion[]>([])
  const [materialSel, setMaterialSel] = useState("")
  const [materialInput, setMaterialInput] = useState("")

  const [departamentoSel, setDepartamentoSel] = useState("")
  const [municipioSel, setMunicipioSel] = useState("")
  const [municipios, setMunicipios] = useState<string[]>([])

  const [categoriaInput, setCategoriaInput] = useState("")
  const [telaInput, setTelaInput] = useState("")

  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const fetchJSON = async <T,>(path: string) => {
    const r = await fetch(`${API}${path}`, { credentials: "include", cache: "no-store" })
    if (!r.ok) throw new Error(await r.text())
    return (await r.json()) as T
  }

  // ============================
  // Cargar opciones iniciales
  // ============================
  useEffect(() => {
    ;(async () => {
      try {
        const [cats, cls] = await Promise.all([
          fetchJSON<Opcion[]>("/api/categorias"),
          fetchJSON<Clase[]>("/api/clases"),
        ])
        setCategorias(cats)
        setClases(cls)
      } catch (e: any) {
        setEstado("error")
        setMensaje(e.message)
      }
    })()
  }, [])

  useEffect(() => {
    if (!claseSel || claseSel === OTROS) return setTelas([])
    fetchJSON<Opcion[]>(`/api/telas?clase_id=${claseSel}`).then(setTelas).catch(() => setTelas([]))
  }, [claseSel])

  const nombreCategoriaSel = useMemo(
    () => categorias.find((c) => String(c.id) === categoriaSel)?.nombre.toLowerCase() || "",
    [categorias, categoriaSel]
  )

  // 🔹 aceptar "accesorio" o "accesorios"
  const esAccesorio = ["accesorio", "accesorios"].includes(nombreCategoriaSel)
  const esAccesorioTipico = nombreCategoriaSel === "accesorios típicos"

  // ============================
  // Accesorios / Tipos / Materiales
  // ============================
  useEffect(() => {
    if (!(esAccesorio || esAccesorioTipico)) return setAccesorios([])
    const tipo = esAccesorio ? "normal" : "tipico"
    fetchJSON<Opcion[]>(`/api/accesorios?tipo=${tipo}`).then(setAccesorios).catch(() => setAccesorios([]))
  }, [esAccesorio, esAccesorioTipico])

  useEffect(() => {
    if (!esAccesorio || !accesorioSel || accesorioSel === OTROS) return setTipos([])
    fetchJSON<Opcion[]>(`/api/accesorio-tipos?accesorio_id=${accesorioSel}`)
      .then(setTipos)
      .catch(() => setTipos([]))
  }, [esAccesorio, accesorioSel])

  useEffect(() => {
    if ((!esAccesorio && !esAccesorioTipico) || !accesorioSel || accesorioSel === OTROS)
      return setMateriales([])

    let q = `/api/accesorio-materiales?accesorio_id=${accesorioSel}`
    if (esAccesorio && tipoSel && tipoSel !== OTROS) {
      q += `&tipo_id=${tipoSel}`
    }

    fetchJSON<Opcion[]>(q).then(setMateriales).catch(() => setMateriales([]))
  }, [esAccesorio, esAccesorioTipico, accesorioSel, tipoSel])

  // ============================
  // Helpers
  // ============================
  const confirmarOtro = (tipo: OtroTipo, valor: string) => {
    if (!valor.trim()) return
    setInfoMsg(`"${valor}" agregado como información en ${tipo}.`)
    setTimeout(() => setInfoMsg(""), 4000)
  }

  const handleDepartamentoChange = (dep: string) => {
    setDepartamentoSel(dep)
    const depObj = departamentosConMunicipios.find((d) => d.nombre === dep)
    setMunicipios(depObj ? depObj.municipios : [])
    setMunicipioSel("")
  }

  const handlePrecioKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const ok =
      ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key) ||
      /[0-9.,]/.test(e.key)
    if (!ok) e.preventDefault()
  }

  // ============================
  // Submit
  // ============================
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set("precio", toDecimal(String(fd.get("precio") || "")))
    fd.set("activo", String(activo))

    if (categoriaSel === OTROS) fd.set("categoria_custom", categoriaInput)
    else fd.set("categoria_id", categoriaSel)

    fd.set("clase_id", claseSel)

    if (telaSel === OTROS) fd.set("tela_custom", telaInput)
    else if (telaSel && telaSel !== NA) fd.set("tela_id", telaSel)

    if ((esAccesorio || esAccesorioTipico) && accesorioSel) {
      if (accesorioSel === OTROS) fd.set("accesorio_custom", accesorioInput)
      else fd.set("accesorio_id", accesorioSel)

      if (esAccesorio && tipoSel) {
        if (tipoSel === OTROS) fd.set("accesorio_tipo_custom", tipoInput)
        else fd.set("accesorio_tipo_id", tipoSel)
      }

      if (materialSel) {
        if (materialSel === OTROS) fd.set("accesorio_material_custom", materialInput)
        else fd.set("accesorio_material_id", materialSel)
      }
    }

    if (departamentoSel) fd.set("departamento", departamentoSel)
    if (municipioSel) fd.set("municipio", municipioSel)

    const files = fileRef.current?.files
    if (files) Array.from(files).slice(0, 9).forEach((f) => fd.append("imagenes[]", f))

    try {
      setEstado("loading")
      const token = getToken()
      const res = await fetch(`${API}/api/productos`, {
        method: "POST",
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      setMensaje("✅ Producto creado con éxito.")
      setEstado("ok")

      // ✅ limpiar el formulario
      if (formRef.current) formRef.current.reset()
    } catch (err: any) {
      setMensaje(err.message || "Error al guardar el producto.")
      setEstado("error")
    }
  }

  // ============================
  // Render
  // ============================
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
<div className="mb-6">
  <Button
    variant="outline"
    onClick={() => router.back()}
    className="flex items-center gap-2 border-2 border-gray-800 text-gray-800 hover:bg-gray-900 hover:text-white dark:border-gray-600 dark:text-gray-200 dark:hover:bg-black transition-all rounded-lg px-4 py-2 shadow-sm hover:shadow-md"
  >
    <ArrowLeft className="w-5 h-5" />
    <span className="font-medium">Volver</span>
  </Button>
</div>

      <h1 className="text-2xl font-semibold">Agregar nuevo producto</h1>

      <form ref={formRef} className="space-y-5" onSubmit={onSubmit}>
        <CategoriaSelect
          categorias={categorias}
          categoriaSel={categoriaSel}
          setCategoriaSel={setCategoriaSel}
          categoriaInput={categoriaInput}
          setCategoriaInput={setCategoriaInput}
          OTROS={OTROS}
          confirmarOtro={confirmarOtro}
        />

        {(esAccesorio || esAccesorioTipico) && (
          <>
            <AccesorioSelect
              accesorios={accesorios}
              accesorioSel={accesorioSel}
              setAccesorioSel={setAccesorioSel}
              accesorioInput={accesorioInput}
              setAccesorioInput={setAccesorioInput}
              OTROS={OTROS}
              confirmarOtro={confirmarOtro}
            />

            {esAccesorio && accesorioSel && accesorioSel !== OTROS && (
              <TipoAccesorioSelect
                tipos={tipos}
                tipoSel={tipoSel}
                setTipoSel={setTipoSel}
                tipoInput={tipoInput}
                setTipoInput={setTipoInput}
                OTROS={OTROS}
                confirmarOtro={confirmarOtro}
              />
            )}

            {accesorioSel && (
              <MaterialSelect
                materiales={materiales}
                materialSel={materialSel}
                setMaterialSel={setMaterialSel}
                materialInput={materialInput}
                setMaterialInput={setMaterialInput}
                OTROS={OTROS}
                confirmarOtro={confirmarOtro}
              />
            )}
          </>
        )}

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

        <TelaSelect
          claseSel={claseSel}
          telas={telas}
          telaSel={telaSel}
          setTelaSel={setTelaSel}
          telaInput={telaInput}
          setTelaInput={setTelaInput}
          OTROS={OTROS}
          NA={NA}
          confirmarOtro={confirmarOtro}
        />

        <OrigenSelect
          departamentosConMunicipios={departamentosConMunicipios}
          departamentoSel={departamentoSel}
          setDepartamentoSel={setDepartamentoSel}
          municipioSel={municipioSel}
          setMunicipioSel={setMunicipioSel}
          municipios={municipios}
          handleDepartamentoChange={handleDepartamentoChange}
        />

        {infoMsg && <p className="text-sm text-blue-600">{infoMsg}</p>}

        {/* Datos básicos */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Nombre del producto</Label>
            <Input name="nombre" required placeholder="Ej. Faja bordada" />
          </div>
          <div>
            <Label>Precio</Label>
            <Input
              name="precio"
              type="text"
              inputMode="decimal"
              pattern="^[0-9]+([.,][0-9]{1,2})?$"
              onKeyDown={handlePrecioKeyDown}
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

        <Button type="submit" className="w-full sm:w-auto" disabled={estado === "loading"}>
          {estado === "loading" ? "Guardando…" : "Guardar producto"}
        </Button>

        {mensaje && (
          <p className={`text-sm ${estado === "error" ? "text-red-600" : "text-green-600"}`}>
            {mensaje}
          </p>
        )}
      </form>
    </main>
  )
}
