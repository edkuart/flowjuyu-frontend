//src/app/seller/products/new/page.tsx

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

import { CategoriaSelect } from "@/components/product/form/CategoriaSelect"
import { AccesorioSelect } from "@/components/product/form/AccesorioSelect"
import { TipoAccesorioSelect } from "@/components/product/form/TipoAccesorioSelect"
import { MaterialSelect } from "@/components/product/form/MaterialSelect"
import { TelaSelect } from "@/components/product/form/TelaSelect"
import { OrigenSelect } from "@/components/product/form/OrigenSelect"
import { useSearchParams } from "next/navigation"

import type { Opcion, Clase, OtroTipo } from "@/types/product"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null
const toDecimal = (v: string) => v.trim().replace(",", ".")

const OTROS = "__OTROS__"
const NA = "__NA__"

export default function AddProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 🧠 Detectar si estamos editando
  const productId = searchParams.get("id")
  const isEditing = Boolean(productId)

    // =========================
  // Estados principales
  // =========================
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [precio, setPrecio] = useState("")
  const [stock, setStock] = useState("")
  const [activo, setActivo] = useState(false)

  const [departamento, setDepartamento] = useState<string | null>(null)
  const [municipio, setMunicipio] = useState<string | null>(null)

  const [dataReady, setDataReady] = useState(false)

  const [estado, setEstado] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [mensaje, setMensaje] = useState("")
  const [infoMsg, setInfoMsg] = useState("")

  const [categorias, setCategorias] = useState<Opcion[]>([])
  const [clases, setClases] = useState<Clase[]>([])
  const [telas, setTelas] = useState<Opcion[]>([])

  const [categoriaSel, setCategoriaSel] = useState("")
  const [claseSel, setClaseSel] = useState("")
  const [telaSel, setTelaSel] = useState("")

  const [accesorios, setAccesorios] = useState<Opcion[]>([])
  const [accesorioSel, setAccesorioSel] = useState("")
  const [accesorioInput, setAccesorioInput] = useState("")

  const [tipos, setTipos] = useState<Opcion[]>([])
  const [tipoSel, setTipoSel] = useState("")
  const [tipoInput, setTipoInput] = useState("")

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
  const [previews, setPreviews] = useState<string[]>([])

  const [imagenPrincipal, setImagenPrincipal] = useState<string | null>(null)

  const [imagenesExistentes, setImagenesExistentes] = useState<
    { id: number; url: string }[]
  >([])

  const MAX_IMAGES = 5;

  const fetchJSON = async <T,>(path: string) => {
    const r = await fetch(`${API}${path}`, {
      credentials: "include",
      cache: "no-store",
    })
    if (!r.ok) throw new Error(await r.text())
    return (await r.json()) as T
  }

    // =========================
  // Precargar producto (EDIT)
  // =========================
  useEffect(() => {
    if (!productId || !dataReady) return
  
    const fetchProduct = async () => {
      try {
        const token = getToken()
        if (!token) return
  
        const res = await fetch(`${API}/api/productos/${productId}/edit`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
  
        if (!res.ok) return
  
        const { product } = await res.json()
  
        // =============================
        // Básicos
        // =============================
        setNombre(product.nombre ?? "")
        setDescripcion(product.descripcion ?? "")
        setPrecio(String(product.precio ?? ""))
        setStock(String(product.stock ?? ""))
        setActivo(Boolean(product.activo))
        setImagenPrincipal(product.imagen_principal ?? null)
  
        // =============================
        // Categoría / Clase / Tela
        // =============================
        setCategoriaSel(
          product.categoria_id ? String(product.categoria_id) : ""
        )
  
        setClaseSel(
          product.clase_id ? String(product.clase_id) : ""
        )
  
        if (product.tela_custom) {
          setTelaSel(OTROS)
          setTelaInput(product.tela_custom)
        } else {
          setTelaSel(
            product.tela_id ? String(product.tela_id) : ""
          )
        }
  
        // =============================
        // Departamento / Municipio
        // =============================
        if (product.departamento) {
          handleDepartamentoChange(product.departamento)
          setMunicipioSel(product.municipio ?? "")
        }
  
        // =============================
        // Accesorio
        // =============================
        if (product.accesorio_custom) {
          setAccesorioSel(OTROS)
          setAccesorioInput(product.accesorio_custom)
        } else if (product.accesorio_id) {
          setAccesorioSel(String(product.accesorio_id))
        }
  
        // ⚠️ Delay para esperar que carguen tipos/materiales
        setTimeout(() => {
          // Tipo
          if (product.accesorio_tipo_custom) {
            setTipoSel(OTROS)
            setTipoInput(product.accesorio_tipo_custom)
          } else if (product.accesorio_tipo_id) {
            setTipoSel(String(product.accesorio_tipo_id))
          }
  
          // Material
          if (product.accesorio_material_custom) {
            setMaterialSel(OTROS)
            setMaterialInput(product.accesorio_material_custom)
          } else if (product.accesorio_material_id) {
            setMaterialSel(String(product.accesorio_material_id))
          }
        }, 200)
  
        // =============================
        // Imágenes
        // =============================
        setImagenesExistentes(
          Array.isArray(product.imagenes) ? product.imagenes : []
        )
  
      } catch (err) {
        console.error("Error cargando producto:", err)
      }
    }
  
    fetchProduct()
  }, [productId, dataReady])    

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
  
        setDataReady(true) 
      } catch (e: any) {
        setEstado("error")
        setMensaje(e.message)
      }
    })()
  }, [])  

  // Telas dependen de la clase
  useEffect(() => {
    if (!claseSel || claseSel === OTROS) return setTelas([])
    fetchJSON<Opcion[]>(`/api/telas?clase_id=${claseSel}`)
      .then(setTelas)
      .catch(() => setTelas([]))
  }, [claseSel])

  // ============================
  // Reglas por categoría
  // ============================
  const reglasCategoria: Record<
    string,
    { clase: boolean; tela: boolean; accesorio: boolean }
  > = {
    // Huipil
    hupil: { clase: true, tela: true, accesorio: false },
    hupiles: { clase: true, tela: true, accesorio: false },

    // Cortes
    corte: { clase: true, tela: true, accesorio: false },
    cortes: { clase: true, tela: true, accesorio: false },

    // Fajas (por si luego las manejas como categoría)
    faja: { clase: true, tela: true, accesorio: false },
    fajas: { clase: true, tela: true, accesorio: false },

    // Telas como categoría
    tela: { clase: true, tela: true, accesorio: false },
    telas: { clase: true, tela: true, accesorio: false },

    // Calzado
    calzado: { clase: true, tela: true, accesorio: false },
    calzados: { clase: true, tela: true, accesorio: false },

    // Accesorios
    accesorio: { clase: false, tela: false, accesorio: true },
    accesorios: { clase: false, tela: false, accesorio: true },

    // Accesorios típicos
    "accesorios típicos": { clase: false, tela: false, accesorio: true },

    // CALZADO (NO mostrar clase ni tela)
    Calzado: { clase: false, tela: false, accesorio: false },

    // Default
    default: { clase: false, tela: false, accesorio: false },
  }

  const nombreCategoriaSel = useMemo(() => {
    const cat = categorias.find((c) => String(c.id) === categoriaSel)
    return cat?.nombre?.toLowerCase().trim() || ""
  }, [categorias, categoriaSel])

  const reglas = useMemo(() => {
    return reglasCategoria[nombreCategoriaSel] ?? reglasCategoria.default
  }, [nombreCategoriaSel])

  const esAccesorio = ["accesorio", "accesorios"].includes(nombreCategoriaSel)
  const esAccesorioTipico = nombreCategoriaSel === "accesorios típicos"

  // ============================
  // Accesorios / Tipos / Materiales
  // ============================
  // Lista de accesorios (normal / típico)
  useEffect(() => {
    if (!(esAccesorio || esAccesorioTipico)) return setAccesorios([])
    const tipo = esAccesorio ? "normal" : "tipico"
    fetchJSON<Opcion[]>(`/api/accesorios?tipo=${tipo}`)
      .then(setAccesorios)
      .catch(() => setAccesorios([]))
  }, [esAccesorio, esAccesorioTipico])

  // Tipos (modelo / estilo) del accesorio seleccionado
  useEffect(() => {
    if (!(esAccesorio || esAccesorioTipico) || !accesorioSel || accesorioSel === OTROS) {
      return setTipos([])
    }

    fetchJSON<Opcion[]>(`/api/accesorio-tipos?accesorio_id=${accesorioSel}`)
      .then(setTipos)
      .catch(() => setTipos([]))
  }, [esAccesorio, esAccesorioTipico, accesorioSel])

  // Materiales del accesorio seleccionado
  useEffect(() => {
    if ((!esAccesorio && !esAccesorioTipico) || !accesorioSel || accesorioSel === OTROS) {
      return setMateriales([])
    }

    const q = `/api/accesorio-materiales?accesorio_id=${accesorioSel}`

    fetchJSON<Opcion[]>(q)
      .then(setMateriales)
      .catch(() => setMateriales([]))
  }, [esAccesorio, esAccesorioTipico, accesorioSel, tipoSel])

  // ============================
  // Helpers
  // ============================
  const confirmarOtro = (tipo: OtroTipo, valor: string) => {
    if (!valor.trim()) return
    setInfoMsg(`"${valor}" agregado como información en ${tipo}.`)
    setEstado("ok")

    setTimeout(() => {
      router.push("/seller/products")
    }, 1200)
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
    fd.set("activo", "false")

    // -------------------------------
    // 1. Categoría
    // -------------------------------
    if (categoriaSel === OTROS) fd.set("categoria_custom", categoriaInput)
    else fd.set("categoria_id", categoriaSel)

    // Clase (aunque después se borre si no aplica)
    fd.set("clase_id", claseSel)

    // Tela (aunque después se borre si no aplica)
    if (telaSel === OTROS) fd.set("tela_custom", telaInput)
    else if (telaSel && telaSel !== NA) fd.set("tela_id", telaSel)

    // Accesorio (aunque luego se borre si no aplica)
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

    fd.set("departamento", departamentoSel || "")
    fd.set("municipio", municipioSel || "")

    // --------------------------------
    // 2. LIMPIAR CAMPOS SEGÚN REGLA
    // --------------------------------
    if (!reglas.clase) {
      fd.delete("clase_id")
    }

    if (!reglas.tela) {
      fd.delete("tela_id")
      fd.delete("tela_custom")
    }

    if (!reglas.accesorio) {
      fd.delete("accesorio_id")
      fd.delete("accesorio_custom")
      fd.delete("accesorio_tipo_id")
      fd.delete("accesorio_tipo_custom")
      fd.delete("accesorio_material_id")
      fd.delete("accesorio_material_custom")
    }

    // --------------------------------
    // 3. Imágenes
    // --------------------------------
    const files = fileRef.current?.files
    if (files) Array.from(files).slice(0, 9).forEach((f) => fd.append("imagenes[]", f))

    try {
      setEstado("loading")
      const token = getToken()
      const url = isEditing
        ? `${API}/api/productos/${productId}`
        : `${API}/api/productos`

      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
        setMensaje(
          isEditing
            ? "✅ Producto actualizado correctamente."
            : "✅ Producto creado como borrador."
        )        
      setEstado("ok")
      if (formRef.current) formRef.current.reset()
      setPreviews([])
    } catch (err: any) {
      setMensaje(err.message || "Error al guardar el producto.")
      setEstado("error")
    }
  }

  const eliminarImagen = async (imageId: number) => {
    try {
      const token = getToken()
      if (!token || !productId) return
  
      const res = await fetch(
        `${API}/api/productos/${productId}/imagenes/${imageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
  
      if (!res.ok) {
        console.error("Error eliminando imagen")
        return
      }
  
      // 🔹 quitar del estado
      setImagenesExistentes((prev) =>
        prev.filter((img) => img.id !== imageId)
      )
    } catch (err) {
      console.error("Error eliminando imagen:", err)
    }
  }  

  const hacerPrincipal = async (url: string) => {
    try {
      const token = getToken()
      if (!token || !productId) return
  
      const res = await fetch(
        `${API}/api/productos/${productId}/set-principal`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imagen_url: url }),
        }
      )
  
      if (!res.ok) {
        console.error("Error cambiando imagen principal")
        return
      }
  
      // 🔥 Actualizar visualmente
      setImagenesExistentes((prev) => [...prev])
  
    } catch (err) {
      console.error("Error cambiando principal:", err)
    }
  }  

  // ============================
  // Render con preview
  // ============================
  return (
    <main className="min-h-screen px-4 py-10 bg-gradient-to-b from-gray-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 border-2 border-gray-800 text-gray-800 hover:bg-gray-900 hover:text-white dark:border-gray-600 dark:text-gray-200 dark:hover:bg-black transition-all rounded-lg px-4 py-2 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? "Editar producto" : "Agregar nuevo producto"}
          </h1>
        </div>

        <form
          ref={formRef}
          className="grid md:grid-cols-2 gap-8 bg-white dark:bg-zinc-900 rounded-2xl shadow p-6"
          onSubmit={onSubmit}
        >
          {/* Columna izquierda */}
          <div className="space-y-5">
            <CategoriaSelect
              categorias={categorias}
              categoriaSel={categoriaSel}
              setCategoriaSel={setCategoriaSel}
              categoriaInput={categoriaInput}
              setCategoriaInput={setCategoriaInput}
              OTROS={OTROS}
              confirmarOtro={confirmarOtro}
            />

            {reglas.accesorio && (esAccesorio || esAccesorioTipico) && (
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

                {accesorioSel && accesorioSel !== OTROS && (
                  <>
                    <TipoAccesorioSelect
                      tipos={tipos}
                      tipoSel={tipoSel}
                      setTipoSel={setTipoSel}
                      tipoInput={tipoInput}
                      setTipoInput={setTipoInput}
                      OTROS={OTROS}
                      confirmarOtro={confirmarOtro}
                    />

                    <MaterialSelect
                      materiales={materiales}
                      materialSel={materialSel}
                      setMaterialSel={setMaterialSel}
                      materialInput={materialInput}
                      setMaterialInput={setMaterialInput}
                      OTROS={OTROS}
                      confirmarOtro={confirmarOtro}
                    />
                  </>
                )}
              </>
            )}

            {reglas.clase && (
              <div>
                <Label>Clase</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 dark:bg-zinc-800"
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
            )}

            {reglas.tela && (
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
            )}

            <OrigenSelect
              departamentosConMunicipios={departamentosConMunicipios}
              departamentoSel={departamentoSel}
              setDepartamentoSel={setDepartamentoSel}
              municipioSel={municipioSel}
              setMunicipioSel={setMunicipioSel}
              municipios={municipios}
              handleDepartamentoChange={handleDepartamentoChange}
            />
          </div>

          {/* Columna derecha */}
          <div className="space-y-5">
            {infoMsg && (
              <p className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-md">
                {infoMsg}
              </p>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Nombre del producto</Label>
                <Input
                  name="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  placeholder="Ej. Faja bordada"
                />
              </div>
              <div>
                <Label>Precio</Label>
                <Input
                  name="precio"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  type="text"
                  inputMode="decimal"
                  onKeyDown={handlePrecioKeyDown}
                  required
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  name="stock"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  type="number"
                  min={0}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                name="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div>
              <label>Imágenes (máx. {MAX_IMAGES})</label>
                <Input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="border-dashed border-2 p-2 rounded-lg cursor-pointer hover:border-sky-500"
                  onChange={(e) => {
                    const files = e.target.files
                    if (!files) return

                    // 🔹 Evitar sobreescribir las anteriores
                    const newFiles = Array.from(files).slice(0, 9 - previews.length)
                    const newPreviews = newFiles.map((f) => URL.createObjectURL(f))
                    setPreviews((prev) => [...prev, ...newPreviews])
                  }}
              />

                {/* 🖼️ Imágenes existentes (modo edición) */}
                {imagenesExistentes.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {imagenesExistentes.map((img) => (
                      <div key={img.id} className="relative group rounded-md overflow-hidden">
                        <img
                          src={img.url}
                          className="w-full h-24 object-cover"
                        />

                        {/* ⭐ Hacer principal */}
                        {img.url !== imagenPrincipal && (
                          <button
                            type="button"
                            onClick={() => {
                              hacerPrincipal(img.url)
                              setImagenPrincipal(img.url)
                            }}
                            className="absolute bottom-1 left-1 bg-white/90 text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition"
                          >
                            ⭐ Principal
                          </button>
                        )}

                        {/* Indicador visual */}
                        {img.url === imagenPrincipal && (
                          <span className="absolute bottom-1 left-1 bg-yellow-400 text-white text-xs px-2 py-1 rounded shadow">
                            ⭐ Principal
                          </span>
                        )}

                        {/* Eliminar */}
                        <button
                          type="button"
                          onClick={() => eliminarImagen(img.id)}
                          className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full px-2 opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 🖼️ Previews con botón ❌ */}
                {previews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {previews.map((src, i) => (
                      <div
                        key={i}
                        className="relative group rounded-md overflow-hidden border border-gray-300 dark:border-gray-700"
                      >
                        <img
                          src={src}
                          alt={`preview-${i}`}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            // 🔹 Eliminar imagen visualmente
                            setPreviews((prev) => prev.filter((_, idx) => idx !== i))

                            // 🔹 También quitarla del input
                            const dt = new DataTransfer()
                            const currentFiles = Array.from(fileRef.current?.files || [])
                            currentFiles.forEach((f, idx) => {
                              if (idx !== i) dt.items.add(f)
                            })
                            if (fileRef.current) fileRef.current.files = dt.files
                          }}
                          className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full px-2 opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>


              <Button
                type="submit"
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
                disabled={estado === "loading"}
              >
                {estado === "loading"
                  ? isEditing
                    ? "Actualizando…"
                    : "Guardando borrador…"
                  : isEditing
                    ? "Guardar cambios"
                    : "Guardar como borrador"}
              </Button>

            {mensaje && (
              <p
                className={`text-sm px-3 py-2 rounded-md ${
                  estado === "error"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30"
                }`}
              >
                {mensaje}
              </p>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}
