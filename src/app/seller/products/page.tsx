//src/app/seller/products/page.tsx

"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { getProductImage } from "@/lib/getProductImage"
import {
  Pencil,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  PackagePlus,
  Copy,
  Check,
  QrCode,
  Link2,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Swal from "sweetalert2"
import { useRouter, useSearchParams } from "next/navigation"
import { SellerProgressCard, type EstadoValidacion } from "@/components/seller/SellerProgressCard"
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil"
import type { SellerPerfil } from "@/lib/sellerProgress"
import QrModal from "@/components/seller/QrModal"
import { PageHeader } from "@/components/layout/PageHeader"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { apiFetch } from "@/lib/api"

type Producto = {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  stock: number
  activo: boolean
  imagenes?: { url: string }[]
  imagen_url?: string | null
  internal_code?: string | null
  seller_sku?: string | null
}

/* ─────────────────────────────────────────────────────────
   Inline copy button — self-contained, zero dependencies.
   Shows a checkmark for 1.5 s after a successful copy.
───────────────────────────────────────────────────────── */
function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {
      // Fallback for restricted contexts (old browsers, non-HTTPS)
      const el = document.createElement("textarea")
      el.value = code
      el.style.cssText = "position:fixed;opacity:0;"
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "¡Copiado!" : "Copiar código"}
      aria-label={copied ? "Código copiado" : "Copiar código Flowjuyu"}
      className={`ml-1 inline-flex items-center justify-center w-5 h-5 rounded transition-colors flex-shrink-0 ${
        copied
          ? "text-green-600"
          : "text-muted-foreground hover:text-primary"
      }`}
    >
      {copied
        ? <Check className="w-3.5 h-3.5" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────
   Code badge — renders internal_code + optional seller_sku
   in a consistent, compact format for both desktop and mobile.
───────────────────────────────────────────────────────── */
function ProductCodes({
  internal_code,
  seller_sku,
}: {
  internal_code?: string | null
  seller_sku?: string | null
}) {
  if (!internal_code) return null
  return (
    <div className="mt-1.5 space-y-0.5">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className="font-medium select-none">FJ:</span>
        <span className="font-mono tracking-wide text-foreground select-all">
          {internal_code}
        </span>
        <CopyCodeButton code={internal_code} />
      </div>
      {seller_sku && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium select-none">SKU:</span>{" "}
          <span className="font-mono text-foreground">{seller_sku}</span>
        </p>
      )}
    </div>
  )
}

const PUBLIC_BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://flowjuyu.com"

export default function SellerProductsPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    nombre: string
    id: string
  } | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [filter, setFilter] = useState<"todos" | "publicados" | "borradores" | "sin_stock">("todos")
  const [qrProduct, setQrProduct] = useState<{ nombre: string; internal_code: string } | null>(null)
  const [linkCopiedId, setLinkCopiedId] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const [page, setPage] = useState(1)
  const [perPage] = useState(10)

  /* ── SAS: progress card data ── */
  const [progressPerfil, setProgressPerfil] = useState<SellerPerfil | null>(null)
  const [estadoValidacion, setEstadoValidacion] = useState<EstadoValidacion>(null)

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"
  const router = useRouter()
  const searchParams = useSearchParams()

  // Show first-product celebration banner when redirected with ?first=1
  useEffect(() => {
    if (searchParams.get("first") === "1") {
      setShowBanner(true)
      // Auto-dismiss after 7s
      const t = setTimeout(() => setShowBanner(false), 7000)
      return () => clearTimeout(t)
    }
  }, [searchParams])

  /* ==============================
     SAS: fetch perfil for progress card
  ============================== */
  useEffect(() => {
    apiGetVendedorPerfil().then(res => {
      if (res.ok && res.perfil) {
        setProgressPerfil(res.perfil)
        setEstadoValidacion(
          (res.perfil.estado_validacion as EstadoValidacion) ?? null
        )
      }
    })
  }, [])

  // Auto-focus search input on mount (deferred so SSR doesn't complain)
  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 150)
    return () => clearTimeout(t)
  }, [])

  /* ==============================
     Fetch productos del vendedor
  ============================== */
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await apiFetch("/api/seller/products")

        if (!res.ok) throw new Error("Error al cargar productos")

        const data = await res.json()
        setProductos(Array.isArray(data) ? data : data.data || [])
      } catch (error) {
        console.error("❌ Error cargando productos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
  }, [API, router])

  /* ==============================
     Paginación
  ============================== */
  const filteredProducts = useMemo(() => {
    let list = productos
    if (filter === "publicados") list = list.filter((p) => p.activo)
    else if (filter === "borradores") list = list.filter((p) => !p.activo)
    else if (filter === "sin_stock") list = list.filter((p) => p.stock === 0)

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(q) ||
          p.internal_code?.toLowerCase().includes(q) ||
          p.seller_sku?.toLowerCase().includes(q)
      )
      // Exact internal_code match → bubble to top
      const exactIdx = list.findIndex(
        (p) => p.internal_code?.toLowerCase() === q
      )
      if (exactIdx > 0) {
        const [exact] = list.splice(exactIdx, 1)
        list = [exact, ...list]
      }
    }

    return list
  }, [productos, filter, search])

  const totalPages = useMemo(
    () => Math.ceil(filteredProducts.length / perPage),
    [filteredProducts, perPage]
  )

  const currentProducts = useMemo(() => {
    const start = (page - 1) * perPage
    return filteredProducts.slice(start, start + perPage)
  }, [filteredProducts, page, perPage])

  /* ==============================
     Acciones
  ============================== */
  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
    })

    if (!confirm.isConfirmed) return

    try {
      const res = await apiFetch(`/api/productos/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error()

      setProductos((prev) => prev.filter((p) => p.id !== id))
      Swal.fire("Eliminado", "Producto eliminado correctamente", "success")
    } catch {
      Swal.fire("Error", "No se pudo eliminar el producto", "error")
    }
  }

  const handleToggleActivo = async (id: string, activo: boolean) => {
    const accion = activo ? "despublicar" : "publicar"
    const confirm = await Swal.fire({
      title: `¿Deseas ${accion} este producto?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
    })

    if (!confirm.isConfirmed) return

    setProcessingId(id)

    try {
      const res = await apiFetch(`/api/productos/${id}/activo`, {
        method: "PATCH",
        body: JSON.stringify({ activo: !activo }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Error actualizando producto")
      }

      setProductos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, activo: !p.activo } : p
        )
      )

      Swal.fire("Actualizado", "Estado actualizado", "success")
    } catch (err: any) {
      Swal.fire(
        "No se pudo actualizar",
        err.message || "Error inesperado",
        "error"
      )
    } finally {
      setProcessingId(null)
    }
  }

  /* ==============================
     QR / share helpers
  ============================== */
  function buildShareMessage(p: Producto): string {
    const url = `${PUBLIC_BASE}/p/${p.internal_code}`
    const precio = Number(p.precio).toLocaleString("es-GT", { minimumFractionDigits: 2 })
    return `Hola, te comparto este producto:\n\n${p.nombre}\nQ ${precio}\n\n${url}`
  }

  function handleCopyLink(p: Producto) {
    if (!p.internal_code) return
    const message = buildShareMessage(p)
    const doCopy = () => {
      const el = document.createElement("textarea")
      el.value = message
      el.style.cssText = "position:fixed;opacity:0;"
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setLinkCopiedId(p.id)
      setTimeout(() => setLinkCopiedId(null), 2000)
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message).then(() => {
        setLinkCopiedId(p.id)
        setTimeout(() => setLinkCopiedId(null), 2000)
      }).catch(doCopy)
    } else {
      doCopy()
    }
  }

  function handleWhatsApp(p: Producto) {
    if (!p.internal_code) return
    const message = buildShareMessage(p)
    const encoded = encodeURIComponent(message)
    try {
      window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer")
    } catch {
      // safe fallback — do nothing
    }
  }

  /* ==============================
     Render
  ============================== */
  return (
    <div className="space-y-8">

      {/* ── HEADER ── */}
      <PageHeader
        title="Gestión de productos"
        description="Administra tu inventario y controla qué productos están visibles."
        action={
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-5">
            <Link href="/seller/products/new">
              <PackagePlus className="w-4 h-4 mr-2" />
              Nuevo producto
            </Link>
          </Button>
        }
      />

      {/* ── FIRST PRODUCT CELEBRATION ── */}
      {showBanner && (
        <div className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl px-6 py-5 text-white shadow-lg">
          {/* Decorative blobs */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 left-10 w-16 h-16 bg-white/10 rounded-full" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎉</span>
              <div>
                <p className="font-bold text-lg leading-tight">
                  ¡Tu primer producto está listo!
                </p>
                <p className="text-green-100 text-sm mt-1">
                  Ahora publícalo para que los compradores puedan verlo.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition flex-shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── ACTIVATION PROGRESS (SAS) ── */}
      {!loading && (
        <SellerProgressCard
          estadoValidacion={estadoValidacion}
          productos={productos}
          perfil={progressPerfil}
        />
      )}

      {/* ── SEARCH ── */}
      {!loading && productos.length > 0 && (
        <div className="space-y-1.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Pega el código o escribe el nombre del producto..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setPage(1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {search.trim() && (
            <p className="text-xs text-muted-foreground pl-1">
              {search.trim().toLowerCase().startsWith("fj-")
                ? "Buscando por código Flowjuyu"
                : "Buscando por SKU o nombre"}
            </p>
          )}
        </div>
      )}

      {/* ── FILTERS ── */}
      {!loading && productos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "todos",      label: "Todos" },
              { key: "publicados", label: "Publicados" },
              { key: "borradores", label: "Borradores" },
              { key: "sin_stock",  label: "Sin stock" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setPage(1) }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                filter === key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/30"
              }`}
            >
              {label}
              {key !== "todos" && (
                <span className="ml-1.5 text-xs opacity-70">
                  {key === "publicados"
                    ? productos.filter((p) => p.activo).length
                    : key === "borradores"
                    ? productos.filter((p) => !p.activo).length
                    : productos.filter((p) => p.stock === 0).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── CONTENT ── */}
      {loading ? (

        <DashboardCard>
          <div className="text-center py-12 text-muted-foreground animate-pulse">
            Cargando productos…
          </div>
        </DashboardCard>

      ) : productos.length === 0 ? (

        <DashboardCard>
          <EmptyState
            icon={PackagePlus}
            title="Tu tienda está lista"
            description="Agrega tu primer producto para que los compradores puedan encontrarte en el catálogo."
            action={
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-11 font-semibold">
                <Link href="/seller/products/new">
                  <PackagePlus className="w-4 h-4 mr-2" />
                  Crear mi primer producto
                </Link>
              </Button>
            }
          />
          <p className="text-center text-xs text-muted-foreground pb-4">
            Gratis · Solo toma unos minutos
          </p>
        </DashboardCard>

      ) : filteredProducts.length === 0 ? (

        <DashboardCard>
          <EmptyState
            icon={Search}
            title={search.trim() ? "Sin resultados" : "Sin resultados para este filtro"}
            description={
              search.trim()
                ? `No se encontró ningún producto con "${search.trim()}".`
                : "Prueba con otro filtro para encontrar tus productos."
            }
            action={
              <button
                onClick={() => { setSearch(""); setFilter("todos"); setPage(1) }}
                className="text-sm text-primary underline underline-offset-2 hover:opacity-70 transition"
              >
                {search.trim() ? "Limpiar búsqueda" : "Ver todos los productos"}
              </button>
            }
          />
        </DashboardCard>

      ) : (

        <DashboardCard
          title={`${filteredProducts.length} producto${filteredProducts.length !== 1 ? "s" : ""}`}
          description={filter !== "todos" ? label(filter) : undefined}
          contentClassName="p-0"
        >

          {/* ── DESKTOP LIST ── */}
          <div className="hidden md:flex flex-col divide-y divide-border">
            {currentProducts.map((p) => {
              const isExpanded = expandedId === p.id
              return (
                <div key={p.id}>

                  {/* SUMMARY ROW — click to expand/collapse */}
                  <div
                    onClick={() => setExpandedId(prev => prev === p.id ? null : p.id)}
                    className={`flex justify-between items-center px-5 py-4 cursor-pointer transition-colors ${
                      isExpanded ? "bg-muted/40" : "hover:bg-muted/30"
                    }`}
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-4">

                      {/* Thumbnail — stops propagation so image modal doesn't collapse row */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedImage({
                            url: getProductImage(p),
                            nombre: p.nombre,
                            id: p.id,
                          })
                        }}
                        className="relative w-16 h-16 rounded-xl overflow-hidden border border-border cursor-pointer group transition flex-shrink-0"
                      >
                        <Image
                          src={getProductImage(p)}
                          alt={p.nombre}
                          fill
                          className="object-cover group-hover:scale-110 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                      </div>

                      {/* Info */}
                      <div>
                        <h3 className="font-semibold text-base leading-tight text-foreground">
                          {p.nombre}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Q {Number(p.precio).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs mt-1">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            p.stock > 5 ? "bg-green-500" : p.stock > 0 ? "bg-amber-400" : "bg-red-500"
                          }`} />
                          <span className={
                            p.stock > 5 ? "text-muted-foreground" : p.stock > 0 ? "text-amber-600" : "text-red-600"
                          }>
                            {p.stock > 5 ? "Disponible" : p.stock > 0 ? "Pocas unidades" : "Sin stock"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* RIGHT — status + chevron */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-3 py-1 text-xs rounded-full border ${
                        p.activo
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-neutral-50 text-neutral-500 border-neutral-200"
                      }`}>
                        {p.activo ? "Publicado" : "Borrador"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`} />
                    </div>
                  </div>

                  {/* EXPANDED PANEL */}
                  {isExpanded && (
                    <div
                      className="px-5 py-4 bg-muted/30 border-t border-border space-y-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Codes */}
                      <div>
                        <ProductCodes internal_code={p.internal_code} seller_sku={p.seller_sku} />
                        {!p.internal_code && (
                          <p className="text-xs text-muted-foreground italic">Sin código asignado aún</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="border-t border-border pt-3 space-y-2">

                        {/* Primary share buttons */}
                        {p.internal_code && (
                          <div className="space-y-1.5">
                            {/* WhatsApp — top priority */}
                            <Button
                              className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-lg gap-2 font-semibold"
                              onClick={() => handleWhatsApp(p)}
                            >
                              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.885a.5.5 0 0 0 .608.608l6.085-1.464A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-4.988-1.362l-.358-.212-3.718.895.912-3.645-.233-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                              </svg>
                              Compartir por WhatsApp
                            </Button>

                            {/* Copy message */}
                            <Button
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg gap-2"
                              onClick={() => handleCopyLink(p)}
                            >
                              {linkCopiedId === p.id
                                ? <><Check className="w-4 h-4" /> Mensaje copiado</>
                                : <><Link2 className="w-4 h-4" /> Copiar mensaje</>}
                            </Button>

                            <p className="text-center text-xs text-muted-foreground pt-0.5">
                              Comparte este producto fácilmente por WhatsApp o enlace
                            </p>
                          </div>
                        )}

                        {/* Secondary grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button asChild variant="outline" className="rounded-lg gap-1.5">
                            <Link href={`/seller/productos/${p.id}/editar`}>
                              <Pencil className="w-3.5 h-3.5" />
                              Editar producto
                            </Link>
                          </Button>

                          {p.internal_code && (
                            <Button
                              variant="outline"
                              className="rounded-lg gap-1.5"
                              onClick={() => setQrProduct({ nombre: p.nombre, internal_code: p.internal_code! })}
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              Ver código QR
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            disabled={processingId === p.id}
                            onClick={() => handleToggleActivo(p.id, p.activo)}
                            className="rounded-lg gap-1.5"
                          >
                            <Power className="w-3.5 h-3.5" />
                            {p.activo ? "Desactivar" : "Activar"}
                          </Button>

                          <Button
                            variant="outline"
                            className="rounded-lg gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar producto
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* ── MOBILE LIST ── */}
          <div className="md:hidden flex flex-col gap-3 p-4">
            {currentProducts.map((p) => {
              const isExpanded = expandedId === p.id
              return (
                <div
                  key={p.id}
                  className={`rounded-xl border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden transition-colors ${
                    isExpanded ? "border-primary/20" : "border-border"
                  }`}
                >
                  {/* SUMMARY — tap to expand */}
                  <div
                    onClick={() => setExpandedId(prev => prev === p.id ? null : p.id)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      isExpanded ? "bg-muted/40" : "hover:bg-muted/20"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={getProductImage(p)}
                        alt={p.nombre}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight text-foreground truncate">
                        {p.nombre}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Q {Number(p.precio).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="flex items-center gap-1 text-xs">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            p.stock > 5 ? "bg-green-500" : p.stock > 0 ? "bg-amber-400" : "bg-red-500"
                          }`} />
                          <span className={
                            p.stock > 5 ? "text-muted-foreground" : p.stock > 0 ? "text-amber-600" : "text-red-600"
                          }>
                            {p.stock > 5 ? "Disponible" : p.stock > 0 ? "Pocas unidades" : "Sin stock"}
                          </span>
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                          p.activo
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-neutral-50 text-neutral-500 border-neutral-200"
                        }`}>
                          {p.activo ? "Publicado" : "Borrador"}
                        </span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`} />
                  </div>

                  {/* EXPANDED PANEL */}
                  {isExpanded && (
                    <div className="px-4 py-4 bg-muted/30 border-t border-border space-y-4">
                      {/* Codes */}
                      <ProductCodes internal_code={p.internal_code} seller_sku={p.seller_sku} />

                      {/* Actions */}
                      <div className="border-t border-border pt-3 space-y-2">

                        {/* Primary share buttons */}
                        {p.internal_code && (
                          <div className="space-y-1.5">
                            {/* WhatsApp — top priority */}
                            <Button
                              className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-lg gap-2 font-semibold"
                              onClick={() => handleWhatsApp(p)}
                            >
                              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.885a.5.5 0 0 0 .608.608l6.085-1.464A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-4.988-1.362l-.358-.212-3.718.895.912-3.645-.233-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                              </svg>
                              Compartir por WhatsApp
                            </Button>

                            {/* Copy message */}
                            <Button
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg gap-2"
                              onClick={() => handleCopyLink(p)}
                            >
                              {linkCopiedId === p.id
                                ? <><Check className="w-4 h-4" /> Mensaje copiado</>
                                : <><Link2 className="w-4 h-4" /> Copiar mensaje</>}
                            </Button>

                            <p className="text-center text-xs text-muted-foreground pt-0.5">
                              Comparte este producto fácilmente por WhatsApp o enlace
                            </p>
                          </div>
                        )}

                        {/* Secondary grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button asChild variant="outline" className="w-full gap-1.5">
                            <Link href={`/seller/productos/${p.id}/editar`}>
                              <Pencil className="w-3.5 h-3.5" />
                              Editar producto
                            </Link>
                          </Button>

                          {p.internal_code && (
                            <Button
                              variant="outline"
                              className="w-full gap-1.5"
                              onClick={() => setQrProduct({ nombre: p.nombre, internal_code: p.internal_code! })}
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              Ver código QR
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            onClick={() => handleToggleActivo(p.id, p.activo)}
                            className="w-full gap-1.5"
                          >
                            <Power className="w-3.5 h-3.5" />
                            {p.activo ? "Desactivar" : "Activar"}
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar producto
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* ── PAGINATION ── */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center text-sm px-5 py-4 border-t border-border">
              <span className="text-muted-foreground">
                Página {page} de {totalPages}
              </span>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

        </DashboardCard>
      )}

      {/* ── QR MODAL ── */}
      {qrProduct && (
        <QrModal
          open={!!qrProduct}
          onClose={() => setQrProduct(null)}
          product={qrProduct}
        />
      )}

      {/* ── IMAGE PREVIEW MODAL ── */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => { if (!open) setSelectedImage(null) }}
      >
        <DialogContent className="max-w-3xl p-6">
          {selectedImage && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  {selectedImage.nombre}
                </DialogTitle>
              </DialogHeader>

              <div className="relative w-full h-[450px]">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.nombre}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedImage(null)}>
                  Cerrar
                </Button>

                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/seller/productos/${selectedImage.id}/editar`}>
                    Editar producto
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Filter label — converts filter key to a readable string
   for the DashboardCard description.
───────────────────────────────────────────────────────── */
function label(filter: string): string {
  if (filter === "publicados") return "Solo publicados"
  if (filter === "borradores") return "Solo borradores"
  if (filter === "sin_stock")  return "Solo sin stock"
  return ""
}
