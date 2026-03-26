//src/app/seller/products/new/page.tsx
"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Check, Copy, ImagePlus, MapPin, Tag, FileText, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"
import { departamentosConMunicipios } from "@/data/municipios"

import { CategoriaSelect } from "@/components/product/form/CategoriaSelect"
import { AccesorioSelect } from "@/components/product/form/AccesorioSelect"
import { TipoAccesorioSelect } from "@/components/product/form/TipoAccesorioSelect"
import { MaterialSelect } from "@/components/product/form/MaterialSelect"
import { TelaSelect } from "@/components/product/form/TelaSelect"
import { OrigenSelect } from "@/components/product/form/OrigenSelect"
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil"
import { ProductConversionCard } from "@/components/product/ProductConversionCard"
import { getProductConversionInsights } from "@/lib/productConversion"

import type { Opcion, Clase, OtroTipo } from "@/types/product"

/* ──────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null
const toDecimal = (v: string) => v.trim().replace(",", ".")
const OTROS = "__OTROS__"
const NA = "__NA__"
const MAX_IMAGES = 5
const TOTAL_STEPS = 5

const STEPS = [
  { label: "Info básica",    icon: FileText },
  { label: "Clasificación",  icon: Tag      },
  { label: "Ubicación",      icon: MapPin   },
  { label: "Imágenes",       icon: ImagePlus},
  { label: "Revisión",       icon: Eye      },
]

/* ──────────────────────────────────────────
   PROGRESS BAR
────────────────────────────────────────── */
function ProgressSteps({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => {
        const num = i + 1
        const done = num < step
        const active = num === step

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                    : "bg-neutral-200 text-neutral-400"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : num}
              </div>
              <span
                className={`text-[11px] mt-1 whitespace-nowrap hidden sm:block ${
                  active
                    ? "text-orange-600 font-semibold"
                    : done
                    ? "text-green-600"
                    : "text-neutral-400"
                }`}
              >
                {s.label}
              </span>
            </div>

            {/* Connector */}
            {i < TOTAL_STEPS - 1 && (
              <div className="flex-1 h-0.5 mx-1 mb-4 sm:mb-5 rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    done ? "bg-green-400" : "bg-neutral-200"
                  }`}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ──────────────────────────────────────────
   COMPLETION SCORE
────────────────────────────────────────── */
function completionScore({
  nombre,
  descripcion,
  precio,
  categoriaSel,
  totalImages,
}: {
  nombre: string
  descripcion: string
  precio: string
  categoriaSel: string
  totalImages: number
}): number {
  let pct = 0
  if (nombre.trim().length >= 5)        pct += 25
  if (descripcion.trim().length > 0)    pct += 20
  if (Number(precio) > 0)               pct += 20
  if (categoriaSel)                     pct += 15
  if (totalImages > 0)                  pct += 20
  return pct
}

/* ──────────────────────────────────────────
   LIVE PREVIEW CARD
────────────────────────────────────────── */
function LivePreviewCard({
  nombre,
  precio,
  municipioSel,
  departamentoSel,
  activo,
  previews,
  existingImages,
  descripcion,
  categoriaSel,
  categoriaNombre,
}: {
  nombre: string
  precio: string
  municipioSel: string
  departamentoSel: string
  activo: boolean
  previews: string[]
  existingImages: { id: number; url: string }[]
  descripcion: string
  categoriaSel: string
  categoriaNombre?: string
}) {
  const previewImg = previews[0] || existingImages[0]?.url || null
  const priceNum   = Number(precio) || 0
  const location   = [municipioSel, departamentoSel].filter(Boolean).join(", ")
  const totalImages = previews.length + existingImages.length
  const pct = completionScore({ nombre, descripcion, precio, categoriaSel, totalImages })

  const scoreColor =
    pct < 40  ? "bg-red-400"    :
    pct < 70  ? "bg-amber-400"  :
    pct < 100 ? "bg-orange-500" :
                "bg-green-500"

  const scoreLabel =
    pct < 40  ? "Incompleto"    :
    pct < 70  ? "En progreso"   :
    pct < 100 ? "Casi listo"    :
                "Completo ✓"

  return (
    <div className="border border-neutral-100 rounded-2xl overflow-hidden bg-white shadow-md sticky top-6">
      {/* Completion bar — top accent */}
      <div className="h-1.5 bg-neutral-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${scoreColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Image */}
      <div className="relative w-full h-44 bg-neutral-100">
        {previewImg ? (
          <img
            src={previewImg}
            alt="preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral-300 gap-2">
            <ImagePlus className="w-8 h-8" />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}

        {/* Status badge */}
        <span
          className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${
            activo
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {activo ? "Publicado" : "Borrador"}
        </span>

        {/* Disponible badge */}
        <span className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide">
          Disponible
        </span>

        {/* Category badge */}
        {categoriaNombre && (
          <span className="absolute bottom-2 right-2 bg-black/55 text-white text-[10px] px-2 py-0.5 rounded-full truncate max-w-[45%]">
            {categoriaNombre}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-1.5">
        <p
          className={`font-bold text-neutral-800 leading-tight line-clamp-2 ${
            nombre ? "" : "text-neutral-300"
          }`}
        >
          {nombre || "Nombre del producto"}
        </p>

        <p
          className={`text-2xl font-black tracking-tight ${
            priceNum > 0 ? "text-neutral-900" : "text-neutral-300"
          }`}
        >
          {priceNum > 0 ? (
            <>
              <span className="text-base font-semibold text-neutral-500 mr-0.5">Q</span>
              {priceNum.toFixed(2)}
            </>
          ) : "Q 0.00"}
        </p>

        {location && (
          <p className="text-xs text-neutral-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location}
          </p>
        )}

        {/* CTA simulation */}
        <div className="pt-1.5 space-y-1">
          <div className="w-full bg-[#0F3D3A] text-white rounded-lg py-2 text-xs font-semibold text-center cursor-default select-none">
            Contactar vendedor
          </div>
          <p className="text-center text-[10px] text-neutral-400">
            Responde directamente el vendedor
          </p>
        </div>

        {/* Completion score footer */}
        <div className="pt-2 border-t border-neutral-50 flex items-center justify-between">
          <p className="text-xs text-neutral-400">Completado</p>
          <span className={`text-xs font-bold ${
            pct < 40 ? "text-red-500" : pct < 100 ? "text-orange-500" : "text-green-600"
          }`}>
            {pct}% — {scoreLabel}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────
   FIELD WRAPPER (consistent spacing/style)
────────────────────────────────────────── */
function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-neutral-700">{label}</Label>
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

/* ──────────────────────────────────────────
   PAGE
────────────────────────────────────────── */
export default function AddProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("id")
  const isEditing = Boolean(productId)

  /* ── KYC state ── */
  type EstadoValidacion = "pendiente" | "aprobado" | "rechazado"
  const [estadoValidacion, setEstadoValidacion] = useState<EstadoValidacion | null>(null)
  const [checkingEstado, setCheckingEstado] = useState(true)

  /* ── Wizard ── */
  const [step, setStep] = useState(1)
  const [stepError, setStepError] = useState<string | null>(null)

  /* ── Product fields ── */
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [precio, setPrecio] = useState("")
  const [stock, setStock] = useState("")
  const [activo, setActivo] = useState(false)

  /* ── Classification ── */
  const [categorias, setCategorias] = useState<Opcion[]>([])
  const [clases, setClases] = useState<Clase[]>([])
  const [telas, setTelas] = useState<Opcion[]>([])
  const [categoriaSel, setCategoriaSel] = useState("")
  const [claseSel, setClaseSel] = useState("")
  const [telaSel, setTelaSel] = useState("")
  const [categoriaInput, setCategoriaInput] = useState("")
  const [telaInput, setTelaInput] = useState("")
  const [accesorios, setAccesorios] = useState<Opcion[]>([])
  const [accesorioSel, setAccesorioSel] = useState("")
  const [accesorioInput, setAccesorioInput] = useState("")
  const [tipos, setTipos] = useState<Opcion[]>([])
  const [tipoSel, setTipoSel] = useState("")
  const [tipoInput, setTipoInput] = useState("")
  const [materiales, setMateriales] = useState<Opcion[]>([])
  const [materialSel, setMaterialSel] = useState("")
  const [materialInput, setMaterialInput] = useState("")

  /* ── Location ── */
  const [departamentoSel, setDepartamentoSel] = useState("")
  const [municipioSel, setMunicipioSel] = useState("")
  const [municipios, setMunicipios] = useState<string[]>([])

  /* ── Images ── */
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [imagenPrincipal, setImagenPrincipal] = useState<string | null>(null)
  const [imagenesExistentes, setImagenesExistentes] = useState<{ id: number; url: string }[]>([])
  const [imagenesAEliminar, setImagenesAEliminar] = useState<number[]>([])

  /* ── Seller SKU ── */
  const [useCustomSku, setUseCustomSku] = useState(false)
  const [sellerSku, setSellerSku] = useState("")
  const [skuError, setSkuError] = useState<string | null>(null)
  const [previewSku, setPreviewSku] = useState("AUTO-??????")

  /* ── Submit state ── */
  const [estado, setEstado] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [mensaje, setMensaje] = useState("")

  /* ── Post-creation success modal ── */
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)

  /* ── Data ready flag (wait for options before loading product) ── */
  const [dataReady, setDataReady] = useState(false)

  /* ────────────────────────────────────────
     AUTO-SAVE (new products only)
  ──────────────────────────────────────── */
  const DRAFT_KEY = "flowjuyu_product_draft"

  // Regenerate preview SKU when product name changes (or on mount)
  useEffect(() => {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
    const trimmed = nombre.trim()
    if (!trimmed) {
      setPreviewSku(`AUTO-${rand}`)
      return
    }
    const prefix = trimmed
      .split(/\s+/)
      .slice(0, 3)
      .map(w => w.toUpperCase().replace(/[^A-Z0-9]/g, ""))
      .join("-")
      .substring(0, 10)
    setPreviewSku(`AUTO-${prefix}-${rand}`)
  }, [nombre])

  // Restore draft on mount (only when creating)
  useEffect(() => {
    if (isEditing) return
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const draft = JSON.parse(raw)
      if (draft.nombre)     setNombre(draft.nombre)
      if (draft.descripcion) setDescripcion(draft.descripcion)
      if (draft.precio)     setPrecio(draft.precio)
      if (draft.stock)      setStock(draft.stock)
    } catch { /* silent */ }
  }, [isEditing])

  // Debounced save on field changes (only when creating)
  useEffect(() => {
    if (isEditing) return
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ nombre, descripcion, precio, stock })
        )
      } catch { /* silent */ }
    }, 800)
    return () => clearTimeout(t)
  }, [nombre, descripcion, precio, stock, isEditing])

  /* ────────────────────────────────────────
     EFFECTS
  ──────────────────────────────────────── */

  // KYC check
  useEffect(() => {
    async function checkEstado() {
      try {
        const res = await apiGetVendedorPerfil()
        if (res.ok && res.perfil) setEstadoValidacion(res.perfil.estado_validacion ?? null)
      } catch {
        /* silent */
      } finally {
        setCheckingEstado(false)
      }
    }
    checkEstado()
  }, [])

  // Load options
  useEffect(() => {
    ;(async () => {
      try {
        const fetchJSON = async <T,>(path: string) => {
          const r = await fetch(`${API}${path}`, { credentials: "include", cache: "no-store" })
          if (!r.ok) throw new Error(await r.text())
          return (await r.json()) as T
        }
        const [cats, cls] = await Promise.all([
          fetchJSON<Opcion[]>("/api/categorias"),
          fetchJSON<Clase[]>("/api/clases"),
        ])
        setCategorias(Array.isArray(cats) ? cats : (cats as any)?.data ?? [])
        setClases(Array.isArray(cls)  ? cls  : (cls  as any)?.data ?? [])
        setDataReady(true)
      } catch {
        /* silent */
      }
    })()
  }, [])

  // Telas depend on clase
  useEffect(() => {
    if (!claseSel || claseSel === OTROS) return setTelas([])
    fetch(`${API}/api/telas?clase_id=${claseSel}`, { credentials: "include", cache: "no-store" })
      .then(r => r.json())
      .then(d => setTelas(Array.isArray(d) ? d : d?.data ?? []))
      .catch(() => setTelas([]))
  }, [claseSel])

  // Load product for editing
  useEffect(() => {
    if (!productId || !dataReady) return
    ;(async () => {
      try {
        const token = getToken()
        if (!token) return
        const res = await fetch(`${API}/api/productos/${productId}/edit`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const { product } = await res.json()

        setNombre(product.nombre ?? "")
        setDescripcion(product.descripcion ?? "")
        setPrecio(String(product.precio ?? ""))
        setStock(String(product.stock ?? ""))
        setActivo(Boolean(product.activo))
        setImagenPrincipal(product.imagen_principal ?? null)
        setCategoriaSel(product.categoria_id ? String(product.categoria_id) : "")
        setClaseSel(product.clase_id ? String(product.clase_id) : "")

        if (product.tela_custom) { setTelaSel(OTROS); setTelaInput(product.tela_custom) }
        else setTelaSel(product.tela_id ? String(product.tela_id) : "")

        if (product.departamento) {
          handleDepartamentoChange(product.departamento)
          setMunicipioSel(product.municipio ?? "")
        }

        if (product.accesorio_custom) { setAccesorioSel(OTROS); setAccesorioInput(product.accesorio_custom) }
        else if (product.accesorio_id) setAccesorioSel(String(product.accesorio_id))

        setTimeout(() => {
          if (product.accesorio_tipo_custom) { setTipoSel(OTROS); setTipoInput(product.accesorio_tipo_custom) }
          else if (product.accesorio_tipo_id) setTipoSel(String(product.accesorio_tipo_id))

          if (product.accesorio_material_custom) { setMaterialSel(OTROS); setMaterialInput(product.accesorio_material_custom) }
          else if (product.accesorio_material_id) setMaterialSel(String(product.accesorio_material_id))
        }, 200)

        setImagenesExistentes(Array.isArray(product.imagenes) ? product.imagenes : [])
      } catch {
        /* silent */
      }
    })()
  }, [productId, dataReady])

  /* ── Category rules ── */
  const reglasCategoria: Record<string, { clase: boolean; tela: boolean; accesorio: boolean }> = {
    hupil:             { clase: true,  tela: true,  accesorio: false },
    hupiles:           { clase: true,  tela: true,  accesorio: false },
    corte:             { clase: true,  tela: true,  accesorio: false },
    cortes:            { clase: true,  tela: true,  accesorio: false },
    faja:              { clase: true,  tela: true,  accesorio: false },
    fajas:             { clase: true,  tela: true,  accesorio: false },
    tela:              { clase: true,  tela: true,  accesorio: false },
    telas:             { clase: true,  tela: true,  accesorio: false },
    calzado:           { clase: true,  tela: true,  accesorio: false },
    calzados:          { clase: true,  tela: true,  accesorio: false },
    accesorio:         { clase: false, tela: false, accesorio: true  },
    accesorios:        { clase: false, tela: false, accesorio: true  },
    "accesorios típicos": { clase: false, tela: false, accesorio: true },
    Calzado:           { clase: false, tela: false, accesorio: false },
    default:           { clase: false, tela: false, accesorio: false },
  }

  const nombreCategoriaSel = useMemo(() => {
    const cat = categorias.find(c => String(c.id) === categoriaSel)
    return cat?.nombre?.toLowerCase().trim() || ""
  }, [categorias, categoriaSel])

  const reglas = useMemo(
    () => reglasCategoria[nombreCategoriaSel] ?? reglasCategoria.default,
    [nombreCategoriaSel]
  )

  const esAccesorio = ["accesorio", "accesorios"].includes(nombreCategoriaSel)
  const esAccesorioTipico = nombreCategoriaSel === "accesorios típicos"

  /* ── Accessories ── */
  useEffect(() => {
    if (!(esAccesorio || esAccesorioTipico)) return setAccesorios([])
    const tipo = esAccesorio ? "normal" : "tipico"
    fetch(`${API}/api/accesorios?tipo=${tipo}`, { credentials: "include", cache: "no-store" })
      .then(r => r.json()).then(d => setAccesorios(Array.isArray(d) ? d : d?.data ?? [])).catch(() => setAccesorios([]))
  }, [esAccesorio, esAccesorioTipico])

  useEffect(() => {
    if (!(esAccesorio || esAccesorioTipico) || !accesorioSel || accesorioSel === OTROS) return setTipos([])
    fetch(`${API}/api/accesorio-tipos?accesorio_id=${accesorioSel}`, { credentials: "include", cache: "no-store" })
      .then(r => r.json()).then(d => setTipos(Array.isArray(d) ? d : d?.data ?? [])).catch(() => setTipos([]))
  }, [esAccesorio, esAccesorioTipico, accesorioSel])

  useEffect(() => {
    if ((!esAccesorio && !esAccesorioTipico) || !accesorioSel || accesorioSel === OTROS) return setMateriales([])
    fetch(`${API}/api/accesorio-materiales?accesorio_id=${accesorioSel}`, { credentials: "include", cache: "no-store" })
      .then(r => r.json()).then(d => setMateriales(Array.isArray(d) ? d : d?.data ?? [])).catch(() => setMateriales([]))
  }, [esAccesorio, esAccesorioTipico, accesorioSel, tipoSel])

  /* ────────────────────────────────────────
     HELPERS
  ──────────────────────────────────────── */
  const confirmarOtro = (_tipo: OtroTipo, _valor: string) => {}

  const handleDepartamentoChange = (dep: string) => {
    setDepartamentoSel(dep)
    const depObj = departamentosConMunicipios.find(d => d.nombre === dep)
    setMunicipios(depObj ? depObj.municipios : [])
    setMunicipioSel("")
  }

  const handlePrecioKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const ok = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key) || /[0-9.,]/.test(e.key)
    if (!ok) e.preventDefault()
  }

  const eliminarImagen = (imageId: number) => {
    if (!window.confirm("¿Quitar esta imagen al guardar?")) return
    setImagenesAEliminar(prev => [...prev, imageId])
    setImagenesExistentes(prev => prev.filter(img => img.id !== imageId))
  }

  const hacerPrincipal = async (url: string) => {
    try {
      const token = getToken()
      if (!token || !productId) return
      await fetch(`${API}/api/productos/${productId}/set-principal`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imagen_url: url }),
      })
      setImagenPrincipal(url)
    } catch { /* silent */ }
  }

  const totalImages = imagenesExistentes.length + previews.length

  /* ────────────────────────────────────────
     STEP NAVIGATION
  ──────────────────────────────────────── */
  function validateStep(s: number): string | null {
    if (s === 1) {
      if (nombre.trim().length < 5) return "El nombre debe tener al menos 5 caracteres."
      if (!precio || Number(toDecimal(precio)) <= 0) return "Ingresa un precio válido (mayor a 0)."
      if (!descripcion.trim()) return "Agrega una descripción del producto."
    }
    if (s === 4 && totalImages === 0 && !isEditing) {
      return null // soft warning only, not blocking
    }
    return null
  }

  function goNext() {
    const err = validateStep(step)
    if (err) { setStepError(err); return }
    setStepError(null)
    setStep(s => Math.min(s + 1, TOTAL_STEPS))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function goBack() {
    setStepError(null)
    setStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /* ────────────────────────────────────────
     SUBMIT
  ──────────────────────────────────────── */
  async function handleSave(forceActivo?: boolean) {
    // Validate SKU before opening loading state
    const trimmedSku = useCustomSku ? sellerSku.trim() : ""
    if (useCustomSku && trimmedSku !== "" && !/^[A-Za-z0-9\-_]{1,100}$/.test(trimmedSku)) {
      setSkuError("Solo letras, números, guiones (-) y guiones bajos (_). Máximo 100 caracteres.")
      return
    }
    setSkuError(null)

    try {
      setEstado("loading")
      const token = getToken()
      if (!token) throw new Error("Sesión expirada")

      const resolvedActivo = forceActivo !== undefined ? forceActivo : activo

      const fd = new FormData()
      fd.set("nombre", nombre)
      fd.set("descripcion", descripcion)
      fd.set("precio", toDecimal(precio))
      fd.set("stock", stock)
      fd.set("activo", resolvedActivo ? "true" : "false")

      // Always send seller_sku — empty string tells the backend to store null
      if (trimmedSku !== "") fd.set("seller_sku", trimmedSku)

      if (categoriaSel === OTROS) fd.set("categoria_custom", categoriaInput)
      else fd.set("categoria_id", categoriaSel)

      if (reglas.clase) fd.set("clase_id", claseSel)

      if (reglas.tela) {
        if (telaSel === OTROS) fd.set("tela_custom", telaInput)
        else if (telaSel && telaSel !== NA) fd.set("tela_id", telaSel)
      }

      if (reglas.accesorio && (esAccesorio || esAccesorioTipico) && accesorioSel) {
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

      console.log("[submit] images state:", images.map(f => ({ name: f.name, size: f.size, type: f.type })))
      images.forEach(f => fd.append("imagenes", f))

      const url = isEditing ? `${API}/api/productos/${productId}` : `${API}/api/productos`
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        body: fd,
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })

      // Parse response body before checking status so we can surface API error messages
      let responseData: any = {}
      try { responseData = await res.json() } catch { /* response had no body */ }

      if (!res.ok) {
        throw new Error(responseData?.message || `Error ${res.status} al guardar el producto`)
      }

      if (isEditing && imagenesAEliminar.length > 0) {
        for (const imageId of imagenesAEliminar) {
          await fetch(`${API}/api/productos/${productId}/imagenes/${imageId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        }
      }

      setEstado("ok")

      if (isEditing) {
        setMensaje("✅ Producto actualizado correctamente.")
        setTimeout(() => {
          router.push("/seller/products")
          router.refresh()
        }, 900)
        return
      }

      // ── New product created ──
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* silent */ }
      if (formRef.current) { formRef.current.reset(); setPreviews([]) }

      if (responseData?.internal_code) {
        // Show success modal with the generated code
        setCreatedCode(responseData.internal_code)
      } else {
        // Fallback: redirect immediately (code not returned by this API version)
        router.push("/seller/products?first=1")
        router.refresh()
      }
    } catch (err: any) {
      setMensaje(err.message || "Error al guardar el producto.")
      setEstado("error")
    }
  }

  function handleSuccessModalClose() {
    setCreatedCode(null)
    setCodeCopied(false)
    router.push("/seller/products?first=1")
    router.refresh()
  }

  function copyInternalCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }).catch(() => {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea")
      el.value = code
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    })
  }

  /* ────────────────────────────────────────
     GUARDS
  ──────────────────────────────────────── */
  if (checkingEstado) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400 text-sm animate-pulse">Verificando estado del comercio…</p>
      </main>
    )
  }

  if (estadoValidacion !== "aprobado") {
    return (
      <main className="min-h-screen px-4 py-10 max-w-xl mx-auto flex items-center">
        <Card className="w-full border shadow-sm">
          <CardContent className="p-10 text-center space-y-4">
            <div className="text-5xl">⏳</div>
            <h2 className="text-xl font-bold text-neutral-800">Tu comercio está en revisión</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Estamos validando tu información. Este proceso tarda entre 1 y 24 horas.
              Te notificaremos por correo cuando sea aprobado.
            </p>
            <Link href="/seller/my-business">
              <Button variant="outline" className="mt-2">Volver a mi tienda</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  /* ────────────────────────────────────────
     PUBLISH VALIDATION
  ──────────────────────────────────────── */
  interface PublishIssue { icon: string; label: string; ok: boolean }

  const publishChecklist: PublishIssue[] = [
    { icon: "📷", label: "Al menos 1 foto del producto",      ok: totalImages > 0 },
    { icon: "📝", label: "Nombre (mínimo 5 caracteres)",      ok: nombre.trim().length >= 5 },
    { icon: "📄", label: "Descripción del producto",          ok: descripcion.trim().length > 0 },
    { icon: "🏷️", label: "Categoría seleccionada",            ok: !!(categoriaSel || categoriaInput) },
    { icon: "💰", label: "Precio válido",                     ok: Number(toDecimal(precio || "0")) > 0 },
    { icon: "📍", label: "Ubicación del producto",            ok: !!(departamentoSel || municipioSel) },
  ]

  const publishErrors = publishChecklist.filter(c => !c.ok)
  const canPublish = publishErrors.length === 0

  function handlePublish() {
    if (!canPublish) {
      setStepError("Completa los requisitos de publicación antes de publicar.")
      return
    }
    setStepError(null)
    setActivo(true)
    handleSave(true)
  }

  /* ────────────────────────────────────────
     REVIEW SUMMARY ROWS
  ──────────────────────────────────────── */
  const categoriaNombre = categorias.find(c => String(c.id) === categoriaSel)?.nombre
  const claseNombre = clases.find(c => String(c.id) === claseSel)?.nombre
  const telaNombre = telas.find(t => String(t.id) === telaSel)?.nombre
  const accesorioNombre = accesorios.find(a => String(a.id) === accesorioSel)?.nombre

  const summaryRows = [
    { label: "Nombre",        value: nombre                                  },
    { label: "Descripción",   value: descripcion ? `${descripcion.slice(0, 60)}${descripcion.length > 60 ? "…" : ""}` : null },
    { label: "Precio",        value: precio ? `Q ${Number(toDecimal(precio)).toFixed(2)}` : null },
    { label: "Stock",         value: stock ? `${stock} unidades` : null      },
    { label: "Estado",        value: activo ? "Publicado" : "Borrador"       },
    { label: "Categoría",     value: categoriaNombre || categoriaInput || null },
    { label: "Clase",         value: claseNombre || null                     },
    { label: "Tela",          value: telaNombre || telaInput || null          },
    { label: "Accesorio",     value: accesorioNombre || accesorioInput || null },
    { label: "Departamento",  value: departamentoSel || null                 },
    { label: "Municipio",     value: municipioSel || null                    },
    { label: "Imágenes",      value: totalImages > 0 ? `${totalImages} imagen${totalImages > 1 ? "es" : ""}` : "Sin imágenes" },
  ].filter(r => !!r.value)

  /* ────────────────────────────────────────
     RENDER
  ──────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-xl hover:bg-neutral-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {isEditing ? "Editar producto" : "Nuevo producto"}
            </h1>
            <p className="text-sm text-neutral-400">
              Paso {step} de {TOTAL_STEPS} — {STEPS[step - 1].label}
            </p>
          </div>
        </div>

        {/* PROGRESS */}
        <ProgressSteps step={step} />

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* ── STEP PANEL ── */}
          <form ref={formRef} className="lg:col-span-2" onSubmit={e => e.preventDefault()}>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-6">

              {/* ═══════════════════════════
                  STEP 1 — INFO BÁSICA
              ═══════════════════════════ */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-800">Cuéntanos sobre tu producto</h2>
                    <p className="text-sm text-neutral-400 mt-0.5">
                      Esta información es lo primero que verán los compradores.
                    </p>
                  </div>

                  <Field
                    label="¿Cómo se llama tu producto?"
                    hint="Sé específico: 'Faja bordada a mano — San Marcos' convierte mejor que solo 'Faja'."
                    error={nombre.trim().length > 0 && nombre.trim().length < 5 ? "Mínimo 5 caracteres" : undefined}
                  >
                    <div className="relative">
                      <Input
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        placeholder="Ej. Huipil tejido a mano — Quetzaltenango"
                        maxLength={120}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                        {nombre.length}/120
                      </span>
                    </div>
                  </Field>

                  <Field
                    label="Describe tu producto como si se lo vendieras a alguien"
                    hint="Habla de materiales, técnica artesanal, cómo se usa y qué lo hace único. Más detalle = más confianza."
                  >
                    <div className="relative">
                      <Textarea
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        rows={4}
                        placeholder="Ej. Tejido a mano con hilo de algodón natural en telar de cintura. Colores naturales derivados de plantas..."
                        maxLength={1000}
                        className="resize-none"
                      />
                      <span className="absolute right-3 bottom-3 text-xs text-neutral-400">
                        {descripcion.length}/1000
                      </span>
                    </div>
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="¿Cuánto cuesta?" hint="Precio en Quetzales guatemaltecos.">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold text-sm">Q</span>
                        <Input
                          value={precio}
                          onChange={e => setPrecio(e.target.value)}
                          onKeyDown={handlePrecioKeyDown}
                          inputMode="decimal"
                          placeholder="0.00"
                          className="pl-8"
                        />
                      </div>
                    </Field>

                    <Field label="¿Cuántas unidades tienes?" hint="Unidades disponibles en tu inventario.">
                      <Input
                        value={stock}
                        onChange={e => setStock(e.target.value)}
                        type="number"
                        min={0}
                        placeholder="1"
                      />
                    </Field>
                  </div>

                  {/* ── SELLER SKU (optional, toggle-based) ── */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-neutral-700">
                        Código interno del vendedor (SKU)
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">
                          {useCustomSku ? "Manual" : "Automático"}
                        </span>
                        <Switch
                          checked={useCustomSku}
                          onCheckedChange={checked => {
                            setUseCustomSku(checked)
                            if (!checked) {
                              setSellerSku("")
                              setSkuError(null)
                            }
                          }}
                        />
                      </div>
                    </div>

                    {useCustomSku ? (
                      <div>
                        <div className="relative">
                          <Input
                            value={sellerSku}
                            onChange={e => {
                              setSellerSku(e.target.value)
                              if (skuError) setSkuError(null)
                            }}
                            placeholder="Ej: CORTE-ROJO-01"
                            maxLength={100}
                            className="pr-20"
                            autoComplete="off"
                            spellCheck={false}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                            {sellerSku.length}/100
                          </span>
                        </div>
                        {skuError && (
                          <p className="mt-1 text-xs text-red-500">{skuError}</p>
                        )}
                        <p className="mt-1 text-xs text-neutral-400">
                          Solo letras, números, guiones y guiones bajos. No visible para compradores.
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400 space-y-0.5">
                        <p>Se asignará automáticamente al crear el producto.</p>
                        <p className="font-mono text-neutral-500">
                          Ej: {previewSku}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div>
                      <p className="text-sm font-semibold text-neutral-700">Publicar producto</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {activo
                          ? "El producto será visible en el marketplace."
                          : "Se guardará como borrador (no visible para compradores)."}
                      </p>
                    </div>
                    <Switch
                      checked={activo}
                      onCheckedChange={setActivo}
                    />
                  </div>
                </div>
              )}

              {/* ═══════════════════════════
                  STEP 2 — CLASIFICACIÓN
              ═══════════════════════════ */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-800">Clasificación</h2>
                    <p className="text-sm text-neutral-400 mt-0.5">
                      Ayuda a los compradores a encontrar tu producto en el catálogo.
                    </p>
                  </div>

                  <CategoriaSelect
                    categorias={categorias}
                    categoriaSel={categoriaSel}
                    setCategoriaSel={setCategoriaSel}
                    categoriaInput={categoriaInput}
                    setCategoriaInput={setCategoriaInput}
                    OTROS={OTROS}
                    confirmarOtro={confirmarOtro}
                  />

                  {/* Contextual hint */}
                  {categoriaSel && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                      <span className="text-amber-500 mt-0.5">💡</span>
                      <p className="text-sm text-amber-800">
                        {reglas.tela
                          ? "Este tipo de producto requiere especificar la tela o material."
                          : reglas.accesorio
                          ? "Este producto es un accesorio — selecciona el tipo y material."
                          : "Categoría seleccionada. Sin campos adicionales requeridos."}
                      </p>
                    </div>
                  )}

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
                    <Field label="Clase" hint="Especifica el tipo o estilo dentro de la categoría.">
                      <select
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white"
                        value={claseSel}
                        onChange={e => setClaseSel(e.target.value)}
                      >
                        <option value="">Seleccione…</option>
                        {clases.map(c => (
                          <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                        ))}
                      </select>
                    </Field>
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
                </div>
              )}

              {/* ═══════════════════════════
                  STEP 3 — UBICACIÓN
              ═══════════════════════════ */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-800">Ubicación</h2>
                    <p className="text-sm text-neutral-400 mt-0.5">
                      Indica dónde se elabora o se encuentra el producto.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      La ubicación ayuda a los compradores a conocer el origen artesanal
                      de tu producto y mejora la visibilidad en búsquedas locales.
                    </p>
                  </div>

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
              )}

              {/* ═══════════════════════════
                  STEP 4 — IMÁGENES
              ═══════════════════════════ */}
              {step === 4 && (
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-lg font-bold text-neutral-800">
                      Agrega fotos para generar confianza
                    </h2>
                    <p className="text-sm text-neutral-400 mt-0.5">
                      La primera foto será la <strong>portada</strong> de tu producto.
                      Puedes reordenar las demás usando las flechas.
                    </p>
                  </div>

                  {/* Slot counter bar */}
                  <div className="flex gap-1.5 items-center">
                    {Array.from({ length: MAX_IMAGES }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i < totalImages ? "bg-orange-400" : "bg-neutral-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-neutral-400 ml-1 flex-shrink-0">
                      {totalImages}/{MAX_IMAGES}
                    </span>
                  </div>

                  {/* No-image nudge */}
                  {totalImages === 0 && (
                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                      <span className="text-2xl">📷</span>
                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          Los productos con fotos venden 3× más
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          Agrega al menos una imagen clara de tu producto.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Upload zone */}
                  <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                      totalImages >= MAX_IMAGES
                        ? "border-neutral-200 bg-neutral-50 opacity-50 cursor-not-allowed"
                        : "border-neutral-300 hover:border-orange-400 hover:bg-orange-50 active:scale-[0.99]"
                    }`}
                  >
                    <ImagePlus className={`w-6 h-6 mb-1.5 ${totalImages >= MAX_IMAGES ? "text-neutral-300" : "text-orange-400"}`} />
                    <p className="text-sm font-medium text-neutral-600">
                      {totalImages >= MAX_IMAGES
                        ? `Límite de ${MAX_IMAGES} fotos alcanzado`
                        : "Haz clic o arrastra tus fotos aquí"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      JPG, PNG o WEBP — Quedan {MAX_IMAGES - totalImages} ranura{MAX_IMAGES - totalImages !== 1 ? "s" : ""}
                    </p>
                    <input
                      id="file-upload"
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={totalImages >= MAX_IMAGES}
                      className="hidden"
                      onChange={e => {
                        const files = e.target.files
                        if (!files) return
                        const slots = MAX_IMAGES - totalImages
                        const newFiles = Array.from(files).slice(0, slots)
                        const newPreviews = newFiles.map(f => URL.createObjectURL(f))
                        setImages(prev => [...prev, ...newFiles])
                        setPreviews(prev => [...prev, ...newPreviews])
                        // Reset input so the same file can be re-selected if needed
                        if (fileRef.current) fileRef.current.value = ""
                      }}
                    />
                  </label>

                  {/* Existing images (edit mode) */}
                  {imagenesExistentes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                        Fotos guardadas
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {imagenesExistentes.map((img, idx) => {
                          const isPrincipal = img.url === imagenPrincipal || idx === 0
                          return (
                            <div
                              key={img.id}
                              className={`relative group rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                                isPrincipal
                                  ? "border-orange-400 ring-2 ring-orange-200"
                                  : "border-neutral-200 hover:border-neutral-300"
                              }`}
                            >
                              <img src={img.url} className="w-full h-full object-cover" />

                              {/* Portada badge */}
                              {isPrincipal && (
                                <span className="absolute top-0 inset-x-0 text-center bg-orange-500 text-white text-[10px] py-0.5 font-bold tracking-wide">
                                  PORTADA
                                </span>
                              )}

                              {/* Make principal button */}
                              {!isPrincipal && (
                                <button
                                  type="button"
                                  onClick={() => hacerPrincipal(img.url)}
                                  className="absolute bottom-1.5 inset-x-1.5 bg-white/90 text-neutral-700 text-[10px] py-1 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition text-center shadow-sm border border-neutral-200"
                                >
                                  Hacer portada
                                </button>
                              )}

                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() => eliminarImagen(img.id)}
                                className="absolute top-1.5 right-1.5 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow opacity-0 group-hover:opacity-100 transition"
                                aria-label="Eliminar"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* New previews with reorder */}
                  {previews.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                        Nuevas fotos — {imagenesExistentes.length === 0 ? "La primera es la portada" : "Se agregarán al producto"}
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {previews.map((src, i) => (
                          <div
                            key={src}
                            className={`relative group rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                              i === 0 && imagenesExistentes.length === 0
                                ? "border-orange-400 ring-2 ring-orange-200"
                                : "border-orange-100 hover:border-orange-300"
                            }`}
                          >
                            <img src={src} alt={`nueva-${i}`} className="w-full h-full object-cover" />

                            {/* Portada badge */}
                            {i === 0 && imagenesExistentes.length === 0 && (
                              <span className="absolute top-0 inset-x-0 text-center bg-orange-500 text-white text-[10px] py-0.5 font-bold tracking-wide">
                                PORTADA
                              </span>
                            )}

                            {/* Reorder arrows */}
                            <div className="absolute bottom-1.5 inset-x-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              {i > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviews(prev => {
                                      const n = [...prev]
                                      ;[n[i - 1], n[i]] = [n[i], n[i - 1]]
                                      return n
                                    })
                                    setImages(prev => {
                                      const n = [...prev]
                                      ;[n[i - 1], n[i]] = [n[i], n[i - 1]]
                                      return n
                                    })
                                  }}
                                  className="bg-white/90 text-neutral-700 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow border border-neutral-200 font-bold"
                                  aria-label="Mover izquierda"
                                >
                                  ←
                                </button>
                              )}
                              {i < previews.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviews(prev => {
                                      const n = [...prev]
                                      ;[n[i], n[i + 1]] = [n[i + 1], n[i]]
                                      return n
                                    })
                                    setImages(prev => {
                                      const n = [...prev]
                                      ;[n[i], n[i + 1]] = [n[i + 1], n[i]]
                                      return n
                                    })
                                  }}
                                  className="bg-white/90 text-neutral-700 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow border border-neutral-200 font-bold"
                                  aria-label="Mover derecha"
                                >
                                  →
                                </button>
                              )}
                            </div>

                            {/* Remove */}
                            <button
                              type="button"
                              onClick={() => {
                                setPreviews(prev => prev.filter((_, idx) => idx !== i))
                                setImages(prev => prev.filter((_, idx) => idx !== i))
                              }}
                              className="absolute top-1.5 right-1.5 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow opacity-0 group-hover:opacity-100 transition"
                              aria-label="Eliminar"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      {previews.length > 1 && (
                        <p className="text-xs text-neutral-400">
                          Pasa el cursor sobre una foto y usa las flechas ← → para reordenarla.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════════════════
                  STEP 5 — REVISIÓN
              ═══════════════════════════ */}
              {step === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-800">
                      Así verán tu producto las personas
                    </h2>
                    <p className="text-sm text-neutral-400 mt-0.5">
                      Revisa que todo esté correcto antes de guardar o publicar.
                    </p>
                  </div>

                  {/* ── MARKETPLACE CARD PREVIEW ── */}
                  {(() => {
                    const previewImg =
                      previews[0] ||
                      imagenesExistentes.find(i => i.url === imagenPrincipal)?.url ||
                      imagenesExistentes[0]?.url ||
                      null
                    const priceNum = Number(toDecimal(precio || "0")) || 0
                    const location = [municipioSel, departamentoSel].filter(Boolean).join(", ")
                    const catLabel = categorias.find(c => String(c.id) === categoriaSel)?.nombre || categoriaInput

                    return (
                      <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-md max-w-xs mx-auto">
                        {/* Hero image */}
                        <div className="relative w-full h-52 bg-neutral-100">
                          {previewImg ? (
                            <img
                              src={previewImg}
                              alt={nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-neutral-300 gap-2">
                              <ImagePlus className="w-10 h-10" />
                              <span className="text-sm">Sin foto</span>
                            </div>
                          )}
                          {catLabel && (
                            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                              {catLabel}
                            </span>
                          )}
                        </div>

                        {/* Card body */}
                        <div className="p-4 space-y-1.5">
                          <p className={`font-bold text-neutral-900 leading-tight line-clamp-2 ${!nombre && "text-neutral-400"}`}>
                            {nombre || "Nombre del producto"}
                          </p>
                          <p className={`text-2xl font-black ${priceNum > 0 ? "text-neutral-900" : "text-neutral-300"}`}>
                            {priceNum > 0 ? `Q${priceNum.toFixed(2)}` : "Q—"}
                          </p>
                          {location && (
                            <p className="text-xs text-neutral-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{location}
                            </p>
                          )}
                          {descripcion && (
                            <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 pt-1 border-t border-neutral-50">
                              {descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {/* ── QUALITY CHECKLIST ── */}
                  <div className="border border-neutral-100 rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-neutral-700">
                        Calidad del producto
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {canPublish
                          ? "¡Listo para publicar! Todos los requisitos están completos."
                          : `${publishErrors.length} elemento${publishErrors.length !== 1 ? "s" : ""} pendiente${publishErrors.length !== 1 ? "s" : ""} para publicar.`}
                      </p>
                    </div>
                    <div className="divide-y divide-neutral-50">
                      {publishChecklist.map((item, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-3 px-5 py-3 ${item.ok ? "bg-white" : "bg-amber-50/40"}`}
                        >
                          <span className="text-base">{item.icon}</span>
                          <p className={`flex-1 text-sm ${item.ok ? "text-neutral-700" : "text-amber-800"}`}>
                            {item.label}
                          </p>
                          {item.ok ? (
                            <span className="text-green-500 font-bold text-sm">✓</span>
                          ) : (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                              Pendiente
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status message */}
                  {mensaje && (
                    <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
                      estado === "error"
                        ? "bg-red-50 border border-red-200 text-red-700"
                        : "bg-green-50 border border-green-200 text-green-700"
                    }`}>
                      {mensaje}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════════════════
                  STEP ERROR
              ═══════════════════════════ */}
              {stepError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                  {stepError}
                </div>
              )}

              {/* ═══════════════════════════
                  NAVIGATION
              ═══════════════════════════ */}
              <div className={`pt-4 border-t border-neutral-100 ${step === TOTAL_STEPS ? "space-y-3" : "flex justify-between items-center"}`}>
                {step === TOTAL_STEPS ? (
                  <>
                    {/* Dual action buttons on final step */}
                    <Button
                      type="button"
                      onClick={handlePublish}
                      disabled={estado === "loading"}
                      className={`w-full h-12 font-bold text-base shadow-sm transition-all ${
                        canPublish
                          ? "bg-[#0F3D3A] hover:bg-[#0C2F2C] text-white shadow-emerald-100"
                          : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                      }`}
                    >
                      {estado === "loading"
                        ? "Publicando…"
                        : canPublish
                        ? "🚀 Publicar producto"
                        : `Publicar (${publishErrors.length} pendiente${publishErrors.length !== 1 ? "s" : ""})`}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSave(false)}
                      disabled={estado === "loading"}
                      className="w-full h-10 font-semibold border-neutral-300 text-neutral-600"
                    >
                      {estado === "loading" ? "Guardando…" : isEditing ? "Guardar cambios" : "Guardar como borrador"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={goBack}
                      className="w-full text-neutral-400 text-sm"
                    >
                      ← Volver a editar
                    </Button>
                  </>
                ) : (
                  <>
                    {step > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={goBack}
                        className="text-neutral-500"
                      >
                        ← Atrás
                      </Button>
                    ) : (
                      <div />
                    )}

                    <Button
                      type="button"
                      onClick={goNext}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6"
                    >
                      Siguiente →
                    </Button>
                  </>
                )}
              </div>

            </div>
          </form>

          {/* ── RIGHT COLUMN (desktop) ── */}
          <div className="hidden lg:block space-y-4">
            {/* Conversion score — live as seller types */}
            <ProductConversionCard
              insights={getProductConversionInsights({
                nombre,
                descripcion,
                precio: Number(toDecimal(precio || "0")),
                imagesCount: totalImages,
                categoria: categorias.find(c => String(c.id) === categoriaSel)?.nombre || categoriaInput,
                location: [municipioSel, departamentoSel].filter(Boolean).join(", "),
              })}
            />

            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-1">
              Vista previa
            </p>
            <LivePreviewCard
              nombre={nombre}
              precio={precio}
              descripcion={descripcion}
              categoriaSel={categoriaSel}
              categoriaNombre={categorias.find(c => String(c.id) === categoriaSel)?.nombre || categoriaInput}
              municipioSel={municipioSel}
              departamentoSel={departamentoSel}
              activo={activo}
              previews={previews}
              existingImages={imagenesExistentes}
            />
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SUCCESS MODAL — shown after new product creation
          Displays the auto-generated Flowjuyu reference code
          and allows the seller to copy it before navigating away.
      ═══════════════════════════════════════════════ */}
      <Dialog open={!!createdCode} onOpenChange={(open) => { if (!open) handleSuccessModalClose() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              Producto creado correctamente
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-1">
            <p className="text-sm text-neutral-500 leading-relaxed">
              Tu producto fue guardado. Aquí está tu código de referencia único en Flowjuyu —
              guárdalo si lo necesitas para soporte o seguimiento.
            </p>

            {/* Code display */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Código Flowjuyu
              </p>
              <div className="flex items-center justify-between gap-3">
                <code className="font-mono text-base font-bold text-neutral-800 tracking-wide select-all break-all">
                  {createdCode}
                </code>
                <button
                  type="button"
                  onClick={() => createdCode && copyInternalCode(createdCode)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    codeCopied
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-white border-neutral-200 text-neutral-600 hover:border-orange-300 hover:text-orange-600"
                  }`}
                  aria-label="Copiar código"
                >
                  {codeCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Este código identifica tu producto de forma única en la plataforma.
                Lo puedes consultar en cualquier momento desde tu lista de productos.
              </p>
            </div>

            <Button
              onClick={handleSuccessModalClose}
              className="w-full bg-[#0F3D3A] hover:bg-[#0C2F2C] text-white font-semibold h-11"
            >
              Ver mis productos →
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </main>
  )
}
