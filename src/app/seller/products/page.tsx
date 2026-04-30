//src/app/seller/products/page.tsx

"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProductImage } from "@/lib/getProductImage";
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
  PackageCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SellerProgressCard,
  type EstadoValidacion,
} from "@/components/seller/SellerProgressCard";
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil";
import type { SellerPerfil } from "@/lib/sellerProgress";
import QrModal from "@/components/seller/QrModal";
import { apiFetch } from "@/lib/api";
import { ProductTitle } from "@/components/product/ProductTitle";
import { BaseListItemCard } from "@/components/seller/ui/BaseListItemCard";
import { markSellerStoreShared } from "@/lib/sellerEducation";

type Producto = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  activo: boolean;
  imagenes?: { url: string }[];
  imagen_url?: string | null;
  internal_code?: string | null;
  seller_sku?: string | null;
};

/* ─── Copy code button ─────────────────────────────────── */
function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        const el = document.createElement("textarea");
        el.value = code;
        el.style.cssText = "position:fixed;opacity:0;";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "¡Copiado!" : "Copiar código"}
      aria-label={copied ? "Código copiado" : "Copiar código Flowjuyu"}
      className={`ml-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors ${
        copied
          ? "text-emerald-600"
          : "text-[var(--seller-muted)] hover:text-[var(--seller-ink)]"
      }`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

/* ─── Product codes badge ──────────────────────────────── */
function ProductCodes({
  internal_code,
  seller_sku,
}: {
  internal_code?: string | null;
  seller_sku?: string | null;
}) {
  if (!internal_code) return null;
  return (
    <div className="mt-1.5 space-y-0.5">
      <div className="flex items-center gap-1 text-xs text-[var(--seller-muted)]">
        <span className="font-medium select-none">FJ:</span>
        <span className="font-mono tracking-wide text-[var(--seller-ink)] select-all">
          {internal_code}
        </span>
        <CopyCodeButton code={internal_code} />
      </div>
      {seller_sku && (
        <p className="text-xs text-[var(--seller-muted)]">
          <span className="font-medium select-none">SKU:</span>{" "}
          <span className="font-mono text-[var(--seller-ink)]">
            {seller_sku}
          </span>
        </p>
      )}
    </div>
  );
}

const PUBLIC_BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://flowjuyu.com";
const PRODUCT_LIST_STATE_KEY = "seller-products-list-state";

type ProductListState = {
  page: number;
  search: string;
  expandedId: string | null;
};

/* ─── Page ─────────────────────────────────────────────── */
export default function SellerProductsPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    nombre: string;
    id: string;
  } | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [filter, setFilter] = useState<
    "todos" | "publicados" | "borradores" | "sin_stock"
  >("todos");
  const [qrProduct, setQrProduct] = useState<{
    nombre: string;
    internal_code: string;
  } | null>(null);
  const [linkCopiedId, setLinkCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const pendingScrollIdRef = useRef<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [progressPerfil, setProgressPerfil] = useState<SellerPerfil | null>(
    null,
  );
  const [estadoValidacion, setEstadoValidacion] =
    useState<EstadoValidacion>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const rawState = sessionStorage.getItem(PRODUCT_LIST_STATE_KEY);
    if (!rawState) return;
    try {
      const state = JSON.parse(rawState) as Partial<ProductListState>;
      if (typeof state.search === "string") setSearch(state.search);
      if (typeof state.page === "number" && state.page > 0) setPage(state.page);
      if (typeof state.expandedId === "string") {
        setExpandedId(state.expandedId);
        pendingScrollIdRef.current = state.expandedId;
      }
    } catch {
      /* ignore */
    } finally {
      sessionStorage.removeItem(PRODUCT_LIST_STATE_KEY);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("first") === "1") {
      setShowBanner(true);
      const t = setTimeout(() => setShowBanner(false), 7000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  useEffect(() => {
    apiGetVendedorPerfil().then((res) => {
      if (res.ok && res.perfil) {
        setProgressPerfil(res.perfil);
        setEstadoValidacion(
          (res.perfil.estado_validacion as EstadoValidacion) ?? null,
        );
      }
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await apiFetch("/api/seller/products");
        if (!res.ok) throw new Error("Error al cargar productos");
        const data = await res.json();
        setProductos(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("❌ Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, [API, router]);

  const filteredProducts = useMemo(() => {
    let list = productos;
    if (filter === "publicados") list = list.filter((p) => p.activo);
    else if (filter === "borradores") list = list.filter((p) => !p.activo);
    else if (filter === "sin_stock") list = list.filter((p) => p.stock === 0);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(q) ||
          p.internal_code?.toLowerCase().includes(q) ||
          p.seller_sku?.toLowerCase().includes(q),
      );
      const exactIdx = list.findIndex(
        (p) => p.internal_code?.toLowerCase() === q,
      );
      if (exactIdx > 0) {
        const [exact] = list.splice(exactIdx, 1);
        list = [exact, ...list];
      }
    }
    return list;
  }, [productos, filter, search]);

  const totalPages = useMemo(
    () => Math.ceil(filteredProducts.length / perPage),
    [filteredProducts, perPage],
  );
  const currentProducts = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredProducts.slice(start, start + perPage);
  }, [filteredProducts, page, perPage]);

  useEffect(() => {
    if (loading || !pendingScrollIdRef.current) return;
    const productId = pendingScrollIdRef.current;
    if (!currentProducts.some((p) => p.id === productId)) return;
    const timeout = setTimeout(() => {
      document
        .getElementById(`product-${productId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      pendingScrollIdRef.current = null;
    }, 100);
    return () => clearTimeout(timeout);
  }, [currentProducts, loading]);

  const saveProductListState = () => {
    sessionStorage.setItem(
      PRODUCT_LIST_STATE_KEY,
      JSON.stringify({ page, search, expandedId }),
    );
  };

  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await apiFetch(`/api/productos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setProductos((prev) => prev.filter((p) => p.id !== id));
      Swal.fire("Eliminado", "Producto eliminado correctamente", "success");
    } catch {
      Swal.fire("Error", "No se pudo eliminar el producto", "error");
    }
  };

  const handleToggleActivo = async (id: string, activo: boolean) => {
    const accion = activo ? "despublicar" : "publicar";
    const confirm = await Swal.fire({
      title: `¿Deseas ${accion} este producto?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
    });
    if (!confirm.isConfirmed) return;
    setProcessingId(id);
    try {
      const res = await apiFetch(`/api/productos/${id}/activo`, {
        method: "PATCH",
        body: JSON.stringify({ activo: !activo }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message || "Error actualizando producto");
      setProductos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, activo: !p.activo } : p)),
      );
      Swal.fire("Actualizado", "Estado actualizado", "success");
    } catch (err: any) {
      Swal.fire(
        "No se pudo actualizar",
        err.message || "Error inesperado",
        "error",
      );
    } finally {
      setProcessingId(null);
    }
  };

  function buildShareMessage(p: Producto): string {
    const url = `${PUBLIC_BASE}/p/${p.internal_code}`;
    const precio = Number(p.precio).toLocaleString("es-GT", {
      minimumFractionDigits: 2,
    });
    return `Hola, te comparto este producto:\n\n${p.nombre}\nQ ${precio}\n\n${url}`;
  }

  function handleCopyLink(p: Producto) {
    if (!p.internal_code) return;
    const message = buildShareMessage(p);
    markSellerStoreShared();
    const doCopy = () => {
      const el = document.createElement("textarea");
      el.value = message;
      el.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setLinkCopiedId(p.id);
      setTimeout(() => setLinkCopiedId(null), 2000);
    };
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(message)
        .then(() => {
          setLinkCopiedId(p.id);
          setTimeout(() => setLinkCopiedId(null), 2000);
        })
        .catch(doCopy);
    } else {
      doCopy();
    }
  }

  function handleWhatsApp(p: Producto) {
    if (!p.internal_code) return;
    markSellerStoreShared();
    const encoded = encodeURIComponent(buildShareMessage(p));
    try {
      window.open(
        `https://wa.me/?text=${encoded}`,
        "_blank",
        "noopener,noreferrer",
      );
    } catch {
      /* safe fallback */
    }
  }

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* ── Header editorial ──────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--seller-accent)] uppercase">
              Catálogo · Flowjuyu Seller
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--seller-ink)] sm:text-[28px] sm:leading-[1.05]">
              Mis productos
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--seller-muted)]">
              Administra tu inventario y controla qué piezas están visibles.
            </p>
          </div>
          <Link
            href="/seller/products/new"
            className="group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[var(--seller-accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(15,61,58,0.5)] transition hover:shadow-[0_14px_28px_-12px_rgba(15,61,58,0.6)] active:scale-[0.99] sm:self-start"
          >
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
            <PackagePlus className="h-4 w-4" />
            Nuevo producto
          </Link>
        </div>

        {/* ── Celebration banner ────────────────────────── */}
        {showBanner && (
          <div className="relative overflow-hidden rounded-3xl bg-[#0f3d3a] px-6 pt-6 pb-5 text-white shadow-[0_24px_60px_-30px_rgba(15,61,58,0.55)]">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,transparent_70%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(31,106,97,0.4)_0%,transparent_70%)]"
            />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <PackageCheck className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-base leading-tight font-bold">
                    ¡Tu primer producto está listo!
                  </p>
                  <p className="mt-0.5 text-sm text-white/70">
                    Publícalo para que los compradores puedan verlo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="flex-shrink-0 rounded-lg p-1 transition hover:bg-white/20"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Progress card (SAS) ───────────────────────── */}
        {!loading && (
          <SellerProgressCard
            estadoValidacion={estadoValidacion}
            productos={productos}
            perfil={progressPerfil}
          />
        )}

        {/* ── Search ───────────────────────────────────── */}
        {!loading && productos.length > 0 && (
          <div className="space-y-1.5">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--seller-faint-text)]" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Pega el código o escribe el nombre del producto..."
                className="w-full rounded-2xl border border-[var(--seller-line)] bg-white py-3 pr-10 pl-10 text-sm text-[var(--seller-ink)] transition outline-none placeholder:text-[var(--seller-faint-text)] focus:border-[var(--seller-accent)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--seller-accent)_20%,transparent)]"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--seller-muted)] transition hover:text-[var(--seller-ink)]"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {search.trim() && (
              <p className="pl-1 text-xs text-[var(--seller-muted)]">
                {search.trim().toLowerCase().startsWith("fj-")
                  ? "Buscando por código Flowjuyu"
                  : "Buscando por SKU o nombre"}
              </p>
            )}
          </div>
        )}

        {/* ── Filters ──────────────────────────────────── */}
        {!loading && productos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "todos", label: "Todos" },
                { key: "publicados", label: "Publicados" },
                { key: "borradores", label: "Borradores" },
                { key: "sin_stock", label: "Sin stock" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setFilter(key);
                  setPage(1);
                }}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  filter === key
                    ? "border-[var(--seller-accent)] bg-[var(--seller-accent)] text-white"
                    : "border-[var(--seller-line)] bg-white text-[var(--seller-muted)] hover:border-[var(--seller-line-strong)] hover:text-[var(--seller-ink)]"
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

        {/* ── Content ──────────────────────────────────── */}

        {loading ? (
          <div className="overflow-hidden rounded-3xl border border-[var(--seller-line)] bg-white">
            <div className="border-b border-[var(--seller-line)] px-5 py-4">
              <div className="h-4 w-24 animate-pulse rounded-lg bg-gray-100" />
            </div>
            <div className="divide-y divide-[var(--seller-line)]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded-lg bg-gray-100" />
                    <div className="h-3 w-1/3 animate-pulse rounded-lg bg-gray-100" />
                    <div className="h-3 w-1/4 animate-pulse rounded-lg bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : productos.length === 0 ? (
          <div className="overflow-hidden rounded-3xl border border-[var(--seller-line)] bg-white px-6 py-14 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)]">
              <PackagePlus className="h-6 w-6 text-[var(--seller-accent)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--seller-ink)]">
              Tu tienda está lista
            </p>
            <p className="mt-1 text-xs text-[var(--seller-muted)]">
              Agrega tu primer producto para que los compradores puedan
              encontrarte.
            </p>
            <Link
              href="/seller/products/new"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[var(--seller-accent)] px-6 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_-14px_rgba(15,61,58,0.5)] transition hover:shadow-[0_14px_28px_-12px_rgba(15,61,58,0.6)]"
            >
              <PackagePlus className="h-4 w-4" />
              Crear mi primer producto
            </Link>
            <p className="mt-3 text-xs text-[var(--seller-faint-text)]">
              Gratis · Solo toma unos minutos
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="overflow-hidden rounded-3xl border border-[var(--seller-line)] bg-white px-6 py-14 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)]">
              <Search className="h-6 w-6 text-[var(--seller-accent)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--seller-ink)]">
              {search.trim()
                ? "Sin resultados"
                : "Sin resultados para este filtro"}
            </p>
            <p className="mt-1 text-xs text-[var(--seller-muted)]">
              {search.trim()
                ? `No se encontró ningún producto con "${search.trim()}".`
                : "Prueba con otro filtro para encontrar tus productos."}
            </p>
            <button
              onClick={() => {
                setSearch("");
                setFilter("todos");
                setPage(1);
              }}
              className="mt-4 text-sm font-medium text-[var(--seller-accent)] underline-offset-2 hover:underline"
            >
              {search.trim() ? "Limpiar búsqueda" : "Ver todos los productos"}
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-[var(--seller-line)] bg-white">
            {/* List header */}
            <div className="border-b border-[var(--seller-line)] px-5 py-4">
              <p className="text-sm font-semibold text-[var(--seller-ink)]">
                {filteredProducts.length} producto
                {filteredProducts.length !== 1 ? "s" : ""}
              </p>
              {filter !== "todos" && (
                <p className="mt-0.5 text-xs text-[var(--seller-muted)]">
                  {filterLabel(filter)}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="flex flex-col gap-3 p-4 md:gap-0 md:divide-y md:divide-[var(--seller-line)] md:p-0">
              {currentProducts.map((p) => {
                const isExpanded = expandedId === p.id;
                return (
                  <BaseListItemCard
                    key={p.id}
                    id={`product-${p.id}`}
                    expanded={isExpanded}
                    onToggle={() =>
                      setExpandedId((prev) => (prev === p.id ? null : p.id))
                    }
                    className="md:rounded-none md:border-0 md:shadow-none"
                    media={
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage({
                            url: getProductImage(p),
                            nombre: p.nombre,
                            id: p.id,
                          });
                        }}
                        className="group relative h-40 w-full cursor-pointer overflow-hidden rounded-xl border border-[var(--seller-line)] transition sm:h-48 md:h-16 md:w-16 md:shrink-0"
                      >
                        <Image
                          src={getProductImage(p)}
                          alt={p.nombre}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                      </div>
                    }
                    title={<ProductTitle value={p.nombre} variant="list" />}
                    subtitle={
                      <p className="text-sm text-[var(--seller-muted)]">
                        Q{" "}
                        {Number(p.precio).toLocaleString("es-GT", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    }
                    badges={
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs ${
                            p.activo
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-[var(--seller-line)] bg-[var(--seller-panel)] text-[var(--seller-muted)]"
                          }`}
                        >
                          {p.activo ? "Publicado" : "Borrador"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                            p.stock > 5
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : p.stock > 0
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-red-200 bg-red-50 text-red-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              p.stock > 5
                                ? "bg-emerald-500"
                                : p.stock > 0
                                  ? "bg-amber-400"
                                  : "bg-red-500"
                            }`}
                          />
                          {p.stock > 5
                            ? "Disponible"
                            : p.stock > 0
                              ? "Pocas unidades"
                              : "Sin stock"}
                        </span>
                      </div>
                    }
                    trailing={
                      <ChevronDown
                        className={`h-4 w-4 text-[var(--seller-muted)] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    }
                    bodyClassName="space-y-4"
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <div>
                        <ProductCodes
                          internal_code={p.internal_code}
                          seller_sku={p.seller_sku}
                        />
                        {!p.internal_code && (
                          <p className="text-xs text-[var(--seller-muted)] italic">
                            Sin código asignado aún
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 border-t border-[var(--seller-line)] pt-3">
                        {p.internal_code && (
                          <div className="space-y-1.5">
                            <button
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1ebe5d]"
                              onClick={() => handleWhatsApp(p)}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4 fill-current"
                                aria-hidden
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.885a.5.5 0 0 0 .608.608l6.085-1.464A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-4.988-1.362l-.358-.212-3.718.895.912-3.645-.233-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
                              </svg>
                              Compartir por WhatsApp
                            </button>

                            <button
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--seller-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                              onClick={() => handleCopyLink(p)}
                            >
                              {linkCopiedId === p.id ? (
                                <>
                                  <Check className="h-4 w-4" /> Mensaje copiado
                                </>
                              ) : (
                                <>
                                  <Link2 className="h-4 w-4" /> Copiar mensaje
                                </>
                              )}
                            </button>

                            <p className="pt-0.5 text-center text-xs text-[var(--seller-muted)]">
                              Comparte este producto fácilmente por WhatsApp o
                              enlace
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <Link
                            href={`/seller/productos/${p.id}/editar`}
                            onClick={saveProductListState}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--seller-line-strong)] bg-white px-3 py-2 text-sm font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar producto
                          </Link>

                          {p.internal_code && (
                            <button
                              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--seller-line-strong)] bg-white px-3 py-2 text-sm font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
                              onClick={() =>
                                setQrProduct({
                                  nombre: p.nombre,
                                  internal_code: p.internal_code!,
                                })
                              }
                            >
                              <QrCode className="h-3.5 w-3.5" />
                              Ver código QR
                            </button>
                          )}

                          <button
                            disabled={processingId === p.id}
                            onClick={() => handleToggleActivo(p.id, p.activo)}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--seller-line-strong)] bg-white px-3 py-2 text-sm font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)] disabled:opacity-50"
                          >
                            <Power className="h-3.5 w-3.5" />
                            {p.activo ? "Desactivar" : "Activar"}
                          </button>

                          <button
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </BaseListItemCard>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[var(--seller-line)] px-5 py-4 text-sm">
                <span className="text-xs text-[var(--seller-muted)]">
                  Página {page} de {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-[var(--seller-line-strong)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)] disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-[var(--seller-line-strong)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)] disabled:opacity-40"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── QR Modal ─────────────────────────────────────── */}
      {qrProduct && (
        <QrModal
          open={!!qrProduct}
          onClose={() => setQrProduct(null)}
          product={qrProduct}
        />
      )}

      {/* ── Image preview modal ───────────────────────────── */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => {
          if (!open) setSelectedImage(null);
        }}
      >
        <DialogContent className="max-w-3xl p-6">
          {selectedImage && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-[var(--seller-ink)]">
                  {selectedImage.nombre}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Vista ampliada de la imagen del producto
                </DialogDescription>
              </DialogHeader>
              <div className="relative h-[450px] w-full">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.nombre}
                  fill
                  className="rounded-2xl object-contain"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="rounded-xl border border-[var(--seller-line-strong)] px-4 py-2 text-sm font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
                >
                  Cerrar
                </button>
                <Link
                  href={`/seller/productos/${selectedImage.id}/editar`}
                  onClick={saveProductListState}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--seller-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <Pencil className="h-4 w-4" />
                  Editar producto
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function filterLabel(filter: string): string {
  if (filter === "publicados") return "Solo publicados";
  if (filter === "borradores") return "Solo borradores";
  if (filter === "sin_stock") return "Solo sin stock";
  return "";
}
