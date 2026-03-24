//src/app/seller/products/page.tsx

"use client"

import { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Pencil,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
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

type Producto = {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  stock: number
  activo: boolean
  imagenes?: string[]
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

  /* ==============================
     Fetch productos del vendedor
  ============================== */
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const res = await fetch(`${API}/api/seller/products`, {
          headers: { Authorization: `Bearer ${token}` },
        })

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
    if (filter === "publicados") return productos.filter((p) => p.activo)
    if (filter === "borradores") return productos.filter((p) => !p.activo)
    if (filter === "sin_stock") return productos.filter((p) => p.stock === 0)
    return productos
  }, [productos, filter])

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
      const token = localStorage.getItem("token")
      const res = await fetch(`${API}/api/productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem("token")
      const res = await fetch(`${API}/api/productos/${id}/activo`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
  function handleCopyLink(p: Producto) {
    if (!p.internal_code) return
    const url = `${PUBLIC_BASE}/p/${p.internal_code}`
    const doCopy = () => {
      const el = document.createElement("textarea")
      el.value = url
      el.style.cssText = "position:fixed;opacity:0;"
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setLinkCopiedId(p.id)
      setTimeout(() => setLinkCopiedId(null), 2000)
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setLinkCopiedId(p.id)
        setTimeout(() => setLinkCopiedId(null), 2000)
      }).catch(doCopy)
    } else {
      doCopy()
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
            title="Sin resultados para este filtro"
            description="Prueba con otro filtro para encontrar tus productos."
            action={
              <button
                onClick={() => { setFilter("todos"); setPage(1) }}
                className="text-sm text-primary underline underline-offset-2 hover:opacity-70 transition"
              >
                Ver todos los productos
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
            {currentProducts.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center px-5 py-4 hover:bg-muted/40 transition"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4">

                  {/* Thumbnail — clickable for full preview */}
                  <div
                    onClick={() =>
                      setSelectedImage({
                        url: p.imagen_url || "/images/placeholder.jpg",
                        nombre: p.nombre,
                        id: p.id,
                      })
                    }
                    className="relative w-16 h-16 rounded-xl overflow-hidden border border-border cursor-pointer group transition"
                  >
                    <Image
                      src={p.imagen_url || "/images/placeholder.jpg"}
                      alt={p.nombre}
                      fill
                      className="object-cover group-hover:scale-110 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-semibold text-lg leading-tight text-foreground">
                      {p.nombre}
                    </h3>

                    <p className="text-sm text-muted-foreground mt-1">
                      Q {Number(p.precio).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                    </p>

                    <p
                      className={`text-xs mt-1 ${
                        p.stock > 5
                          ? "text-muted-foreground"
                          : p.stock > 0
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {p.stock > 0 ? `Stock: ${p.stock}` : "Sin stock"}
                    </p>

                    <ProductCodes internal_code={p.internal_code} seller_sku={p.seller_sku} />
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3">

                  <span
                    className={`px-3 py-1 text-xs rounded-full border ${
                      p.activo
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {p.activo ? "Publicado" : "Borrador"}
                  </span>

                  {p.internal_code && (
                    <>
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-lg"
                        title="Ver QR"
                        onClick={() => setQrProduct({ nombre: p.nombre, internal_code: p.internal_code! })}
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-lg"
                        title={linkCopiedId === p.id ? "¡Copiado!" : "Copiar enlace"}
                        onClick={() => handleCopyLink(p)}
                      >
                        {linkCopiedId === p.id
                          ? <Check className="w-4 h-4 text-green-600" />
                          : <Link2 className="w-4 h-4" />}
                      </Button>
                    </>
                  )}

                  <Link href={`/seller/products/new?id=${p.id}`}>
                    <Button size="icon" variant="outline" className="rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={processingId === p.id}
                    onClick={() => handleToggleActivo(p.id, p.activo)}
                    className="rounded-lg"
                  >
                    <Power className="w-4 h-4 mr-1" />
                    {p.activo ? "Despublicar" : "Publicar"}
                  </Button>

                  <Button
                    size="icon"
                    variant="destructive"
                    className="rounded-lg"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* ── MOBILE LIST ── */}
          <div className="md:hidden flex flex-col gap-4 p-4">
            {currentProducts.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 space-y-4"
              >
                <div className="relative w-full h-40 rounded-lg overflow-hidden">
                  <Image
                    src={p.imagen_url || "/images/placeholder.jpg"}
                    alt={p.nombre}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {p.nombre}
                  </h3>

                  <p className="text-muted-foreground">
                    Q {Number(p.precio).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                  </p>

                  <ProductCodes internal_code={p.internal_code} seller_sku={p.seller_sku} />
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Stock: {p.stock}</span>

                  <span
                    className={`px-2 py-1 rounded-full text-xs border ${
                      p.activo
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {p.activo ? "Publicado" : "Borrador"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/seller/products/new?id=${p.id}`}>Editar</Link>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleToggleActivo(p.id, p.activo)}
                    className="w-full"
                  >
                    {p.activo ? "Despublicar" : "Publicar"}
                  </Button>

                  {p.internal_code && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setQrProduct({ nombre: p.nombre, internal_code: p.internal_code! })}
                      >
                        <QrCode className="w-4 h-4" />
                        Ver QR
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => handleCopyLink(p)}
                      >
                        {linkCopiedId === p.id
                          ? <><Check className="w-4 h-4 text-green-600" /> ¡Copiado!</>
                          : <><Link2 className="w-4 h-4" /> Copiar enlace</>}
                      </Button>
                    </>
                  )}

                  <Button
                    variant="destructive"
                    className="col-span-2"
                    onClick={() => handleDelete(p.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
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
                  <Link href={`/seller/products/new?id=${selectedImage.id}`}>
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
