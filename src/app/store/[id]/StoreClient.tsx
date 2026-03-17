//src/app/store/[id]/StoreClient.tsx

"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Star,
  Heart,
  HeartOff,
  BookOpen,
} from "lucide-react";
import ProductDiscoveryLayout from "@/components/product/discovery/ProductDiscoveryLayout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

/* =====================================================
   TYPES
===================================================== */

type Producto = {
  id: string;
  nombre: string;
  precio: number | string;
  imagen_url?: string | null;
};

type Seller = {
  id: number;
  nombre_comercio: string;
  descripcion?: string | null;
  logo?: string | null;
  departamento?: string | null;
  municipio?: string | null;
  banner_url?: string | null;
  identidad_tags?: string[] | null;
  productos_destacados?: string[] | null;
  mensaje_destacado?: string | null;
  created_at?: string | null;
  whatsapp?: string | null;
  plan?: "free" | "founder";
  plan_activo?: boolean;
  estado_validacion?: "pendiente" | "aprobado" | "rechazado";
};

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  buyer_name: string;
  product_nombre: string | null;
  created_at: string;
};

type RatingSummary = { avg_rating: number | null; total: number };

/* =====================================================
   STAR DISPLAY
===================================================== */

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const s = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${s} ${n <= rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
        />
      ))}
    </div>
  );
}

/* =====================================================
   PRODUCT CARD (with favorites)
===================================================== */

function ProductCard({
  p,
  favoriteId,
  onToggleFavorite,
  isLoggedIn,
}: {
  p: Producto;
  favoriteId: number | null;
  onToggleFavorite: (productId: string, favoriteId: number | null) => void;
  isLoggedIn: boolean;
}) {
  const precio = Number(p.precio);

  return (
    <Link href={`/product/${p.id}`}>
      <div className="group bg-white rounded-3xl border border-neutral-200 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">

        {/* Favorite button */}
        {isLoggedIn && (
          <button
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur shadow-sm hover:bg-red-50 transition"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(p.id, favoriteId);
            }}
            aria-label={favoriteId ? "Quitar de favoritos" : "Guardar en favoritos"}
          >
            {favoriteId ? (
              <HeartOff className="w-4 h-4 text-red-500" />
            ) : (
              <Heart className="w-4 h-4 text-neutral-400 hover:text-red-400" />
            )}
          </button>
        )}

        {/* Image */}
        <div className="relative w-full aspect-square bg-neutral-50 rounded-2xl overflow-hidden mb-4">
          <Image
            src={p.imagen_url || "/placeholder.jpg"}
            alt={p.nombre}
            fill
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-white/90 backdrop-blur-sm text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200 shadow-sm">
              Artesanal
            </span>
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-semibold">
            Ver producto
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="font-semibold text-neutral-800 text-sm leading-snug line-clamp-2 group-hover:text-[#0F3D3A] transition-colors">
            {p.nombre}
          </h3>
          <p className="font-black text-[#0F3D3A] text-lg tracking-tight">
            Q{precio.toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  );
}

/* =====================================================
   REVIEW FORM
===================================================== */

function ReviewForm({
  sellerId,
  onSubmitted,
}: {
  sellerId: number;
  onSubmitted: () => void;
}) {
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [comment, setComment]   = useState("");
  const [name, setName]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError("Selecciona una calificación"); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/api/reviews/seller/${sellerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment || null, buyer_name: name || "Comprador" }),
      });
      if (res.status === 409) { setError("Ya dejaste una reseña para esta tienda"); return; }
      if (!res.ok) throw new Error();
      setSuccess(true);
      onSubmitted();
    } catch {
      setError("No se pudo enviar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6 text-emerald-700 font-semibold">
        ¡Gracias por tu reseña! 🙏
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
      <p className="font-semibold text-neutral-800 text-sm">Deja tu opinión</p>

      {/* Star selector */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(n)}
          >
            <Star
              className={`w-7 h-7 transition ${
                n <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "text-neutral-300"
              }`}
            />
          </button>
        ))}
      </div>

      <input
        placeholder="Tu nombre (opcional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
      />
      <textarea
        placeholder="Cuéntanos tu experiencia (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full border rounded-xl px-3 py-2 text-sm resize-none bg-white"
      />

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-[#0F3D3A] text-white font-semibold rounded-xl text-sm disabled:opacity-60 transition hover:bg-[#0a2e2b]"
      >
        {loading ? "Enviando…" : "Enviar reseña"}
      </button>
    </form>
  );
}

/* =====================================================
   COMPONENT
===================================================== */

export default function StoreClient({
  seller,
  initialProducts,
}: {
  seller: Seller;
  initialProducts: Producto[];
}) {
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(2000);
  const [sort, setSort]           = useState("");
  const [fabVisible, setFabVisible] = useState(false);

  // Reviews
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null);
  const [reviews, setReviews]             = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Favorites
  const [favMap, setFavMap] = useState<Record<string, number | null>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* ── FAB scroll ── */
  useEffect(() => {
    const onScroll = () => setFabVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Auth check ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  /* ── Load reviews ── */
  const loadReviews = useCallback(async () => {
    try {
      const [ratingRes, reviewsRes] = await Promise.all([
        fetch(`${API}/api/reviews/seller/${seller.id}/rating`),
        fetch(`${API}/api/reviews/seller/${seller.id}?limit=20`),
      ]);
      if (ratingRes.ok) setRatingSummary(await ratingRes.json());
      if (reviewsRes.ok) {
        const d = await reviewsRes.json();
        setReviews(d.data || []);
      }
    } catch {}
  }, [seller.id]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  /* ── Load favorites for visible products ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !initialProducts.length) return;

    const checkFavs = async () => {
      const results: Record<string, number | null> = {};
      await Promise.all(
        initialProducts.map(async (p) => {
          try {
            const res = await fetch(`${API}/api/favorites/check?product_id=${p.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const d = await res.json();
              results[p.id] = d.favorited ? d.favoriteId : null;
            }
          } catch {}
        })
      );
      setFavMap(results);
    };

    checkFavs();
  }, [initialProducts]);

  /* ── Toggle favorite ── */
  const handleToggleFavorite = useCallback(async (productId: string, favoriteId: number | null) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (favoriteId) {
      // Remove
      await fetch(`${API}/api/favorites/${favoriteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavMap((prev) => ({ ...prev, [productId]: null }));
    } else {
      // Add
      const res = await fetch(`${API}/api/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId }),
      });
      if (res.ok) {
        const d = await res.json();
        setFavMap((prev) => ({ ...prev, [productId]: d.id }));
      }
    }
  }, []);

  /* ── Filtros + Sort ── */
  const productos = useMemo(() => {
    let list = [...initialProducts];
    list = list.filter((p) => {
      const precio = Number(p.precio);
      return precio >= precioMin && precio <= precioMax;
    });
    if (sort === "price_asc")  list.sort((a, b) => Number(a.precio) - Number(b.precio));
    if (sort === "price_desc") list.sort((a, b) => Number(b.precio) - Number(a.precio));
    return list;
  }, [initialProducts, precioMin, precioMax, sort]);

  /* ── Destacados ── */
  const destacados =
    seller.productos_destacados && seller.productos_destacados.length > 0
      ? productos.filter((p) => seller.productos_destacados?.includes(p.id))
      : [];

  /* ── Featured (most relevant if no destacados) ── */
  const featuredProduct = destacados.length === 0 && productos.length > 0 ? productos[0] : null;

  /* ── Member since ── */
  const memberSince = seller.created_at
    ? new Date(seller.created_at).getFullYear()
    : null;

  /* ── WhatsApp ── */
  const phone = seller.whatsapp || (seller as any).whatsapp_numero || "";
  const showWhatsapp = !!phone;

  const handleWhatsappClick = async (productId?: string) => {
    // Track the click
    try {
      await fetch(`${API}/api/analytics/whatsapp-click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: seller.id, product_id: productId || null }),
      });
    } catch {}
    // Also track as purchase intention
    try {
      await fetch(`${API}/api/intentions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: seller.id, source: "store_whatsapp" }),
      });
    } catch {}
    const mensaje = `Hola 👋\n\nEstoy interesado en los productos de "${seller.nombre_comercio}" que vi en Flowjuyu.\n\n¿Podrías brindarme más información?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <ProductDiscoveryLayout
      hideHeader={true}
      title={seller.nombre_comercio}
      subtitle={seller.descripcion ?? undefined}
      total={productos.length}
      precioMin={precioMin}
      precioMax={precioMax}
      setPrecioMin={setPrecioMin}
      setPrecioMax={setPrecioMax}
      sort={sort}
      setSort={setSort}
      onReset={() => { setPrecioMin(0); setPrecioMax(2000); setSort(""); }}
    >

      {/* ══════════════════════════════════════════════
          FLOATING WHATSAPP FAB
      ══════════════════════════════════════════════ */}
      {showWhatsapp && (
        <button
          onClick={() => handleWhatsappClick()}
          aria-label="Contactar por WhatsApp"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full shadow-2xl transition-all duration-300 active:scale-95 ${
            fabVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <MessageCircle className="w-5 h-5 shrink-0" />
          <span className="hidden sm:inline">Consultar por WhatsApp</span>
        </button>
      )}

      {/* ══════════════════════════════════════════════
          HERO
          Content drives height; background is absolute.
      ══════════════════════════════════════════════ */}
      <div className="relative -mx-6 mb-0 rounded-b-[40px] overflow-hidden">

        {/* Background layer */}
        <div className="absolute inset-0">
          {seller.banner_url ? (
            <>
              <Image src={seller.banner_url} alt="Banner tienda" fill className="object-cover" priority />
              <div className="absolute inset-0 bg-emerald-900/70 mix-blend-multiply" />
            </>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-emerald-900/60 to-emerald-800/80" />
        </div>

        {/* Content layer */}
        <div className="relative px-6 pt-16 pb-10 md:px-10 md:py-14 text-white">
          <div className="max-w-6xl mx-auto">

            <div className="flex flex-col sm:flex-row items-start gap-6 md:gap-10">

              {seller.logo && (
                <div className="relative w-24 h-24 md:w-40 md:h-40 rounded-2xl border-4 border-white/80 shadow-2xl overflow-hidden flex-shrink-0 bg-white">
                  <Image src={seller.logo} alt={seller.nombre_comercio} fill className="object-contain p-2" />
                </div>
              )}

              <div className="flex-1 min-w-0">

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {seller.estado_validacion === "aprobado" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-blue-600/90 text-white text-[10px] font-bold rounded-full">
                      <ShieldCheck className="w-3 h-3" /> Verificado
                    </span>
                  )}
                  {seller.plan === "founder" && seller.plan_activo && (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded-full">
                      <Star className="w-3 h-3" /> Founder
                    </span>
                  )}
                  <span className="px-3 py-0.5 bg-white/15 backdrop-blur border border-white/20 text-white/80 text-[10px] font-semibold rounded-full">
                    🧵 Hecho a mano
                  </span>
                  {ratingSummary && ratingSummary.total > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-amber-400/20 border border-amber-300/30 text-amber-200 text-[10px] font-bold rounded-full">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      {ratingSummary.avg_rating?.toFixed(1)} ({ratingSummary.total})
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                  {seller.nombre_comercio}
                </h1>
                <div className="mt-3 h-[3px] w-20 bg-amber-400 rounded-full" />

                {(seller.municipio || seller.departamento) && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm opacity-80">
                    <MapPin className="w-3.5 h-3.5" />
                    {[seller.municipio, seller.departamento].filter(Boolean).join(", ")}
                  </p>
                )}

                {seller.mensaje_destacado && (
                  <p className="mt-3 max-w-2xl text-sm md:text-base opacity-90 leading-relaxed">
                    {seller.mensaje_destacado}
                  </p>
                )}

                {/* Fast reply badge */}
                {showWhatsapp && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-green-200 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Respuesta rápida por WhatsApp
                  </div>
                )}

                <div className="flex flex-wrap gap-5 text-sm mt-4 opacity-80">
                  <span>🛍 {productos.length} productos</span>
                  {memberSince && <span>📅 Miembro desde {memberSince}</span>}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 mt-6">
                  {showWhatsapp && (
                    <button
                      onClick={() => handleWhatsappClick()}
                      className="inline-flex items-center gap-2.5 px-7 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full shadow-xl transition-all duration-200 active:scale-95 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      💬 Consultar por WhatsApp
                    </button>
                  )}
                  <a
                    href="#catalogo"
                    className="inline-flex items-center gap-2 px-7 py-3 bg-white/15 hover:bg-white/25 backdrop-blur border border-white/25 text-white font-semibold rounded-full transition-all duration-200 text-sm"
                  >
                    Ver catálogo <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Identity tags */}
            {seller.identidad_tags && seller.identidad_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {seller.identidad_tags.slice(0, 5).map((tag, i) => (
                  <span key={i} className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium hover:bg-white/20 transition">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TRUST BAR
      ══════════════════════════════════════════════ */}
      <div className="flex flex-wrap gap-6 items-center justify-center px-6 py-5 mb-12 bg-white border-b border-neutral-100 -mx-6 text-sm text-neutral-500">
        <span className="flex items-center gap-2">
          <span className="text-emerald-600 font-bold">✓</span>
          Artesanía guatemalteca auténtica
        </span>
        <span className="hidden sm:block w-px h-4 bg-neutral-200" />
        <span className="flex items-center gap-2">
          <span className="text-emerald-600 font-bold">✓</span>
          Compra directa al artesano
        </span>
        <span className="hidden sm:block w-px h-4 bg-neutral-200" />
        <span className="flex items-center gap-2">
          <span className="text-emerald-600 font-bold">✓</span>
          Pieza única hecha a mano
        </span>
      </div>

      {/* ══════════════════════════════════════════════
          ARTISAN STORY SECTION
      ══════════════════════════════════════════════ */}
      {seller.descripcion && (
        <section className="mb-16">
          <div className="bg-gradient-to-br from-amber-50 to-emerald-50 border border-amber-100 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-start">
            <div className="text-4xl flex-shrink-0">📖</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                  Historia del artesano
                </p>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">
                Sobre {seller.nombre_comercio}
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                {seller.descripcion}
              </p>
              {showWhatsapp && (
                <button
                  onClick={() => handleWhatsappClick()}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition"
                >
                  Hablar directamente con el artesano
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          FEATURED PRODUCT (when no destacados)
      ══════════════════════════════════════════════ */}
      {featuredProduct && (
        <section className="mb-16">
          <div className="mb-6">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">
              Lo más popular
            </p>
            <h2 className="text-2xl font-bold text-neutral-900">Producto destacado</h2>
          </div>
          <Link href={`/product/${featuredProduct.id}`}>
            <div className="group flex flex-col sm:flex-row gap-6 bg-white rounded-3xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all p-6 overflow-hidden">
              <div className="relative w-full sm:w-52 aspect-square bg-neutral-50 rounded-2xl overflow-hidden flex-shrink-0">
                <Image
                  src={featuredProduct.imagen_url || "/placeholder.jpg"}
                  alt={featuredProduct.nombre}
                  fill
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                    ⭐ Destacado
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-3 min-w-0">
                <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wide">
                  Artesanía de {seller.nombre_comercio}
                </p>
                <h3 className="text-xl font-bold text-neutral-900 group-hover:text-[#0F3D3A] transition-colors">
                  {featuredProduct.nombre}
                </h3>
                <p className="text-2xl font-black text-[#0F3D3A]">
                  Q{Number(featuredProduct.precio).toFixed(2)}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F3D3A] border border-[#0F3D3A]/30 px-4 py-2 rounded-full w-fit group-hover:bg-[#0F3D3A] group-hover:text-white transition-colors">
                  Ver producto <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          DESTACADOS
      ══════════════════════════════════════════════ */}
      {destacados.length > 0 && (
        <section className="mb-20">
          <div className="mb-8">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">
              Selección curada
            </p>
            <h2 className="text-2xl font-bold text-neutral-900">Productos destacados</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {destacados.map((p, index) => (
              <Link key={p.id} href={`/product/${p.id}`}>
                <div className={`group relative rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 bg-white ${index === 0 ? "md:col-span-2" : ""}`}>
                  <div className={`relative bg-neutral-50 ${index === 0 ? "aspect-[16/9]" : "aspect-square"}`}>
                    <Image src={p.imagen_url || "/placeholder.jpg"} alt={p.nombre} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">⭐ Destacado</span>
                    </div>
                  </div>
                  <div className="px-5 py-4 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wide mb-0.5">Producto destacado del artesano</p>
                      <h3 className="font-bold text-neutral-800 text-sm line-clamp-1 group-hover:text-[#0F3D3A] transition-colors">{p.nombre}</h3>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <p className="font-black text-[#0F3D3A] text-base">Q{Number(p.precio).toFixed(2)}</p>
                      <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#0F3D3A] border border-[#0F3D3A]/30 px-3 py-1.5 rounded-full group-hover:bg-[#0F3D3A] group-hover:text-white transition-colors">
                        Ver <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          PRODUCT GRID
      ══════════════════════════════════════════════ */}
      <section id="catalogo">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Catálogo completo</p>
            <h2 className="text-2xl font-bold text-neutral-900">Productos disponibles</h2>
          </div>
          {productos.length > 0 && (
            <span className="text-sm text-neutral-400">
              {productos.length} {productos.length === 1 ? "producto" : "productos"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {productos.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              favoriteId={favMap[p.id] ?? null}
              onToggleFavorite={handleToggleFavorite}
              isLoggedIn={isLoggedIn}
            />
          ))}
          {productos.length === 0 && (
            <div className="col-span-full text-center py-20 space-y-3">
              <p className="text-3xl opacity-40">🛍</p>
              <p className="text-neutral-500 font-medium">Este vendedor aún no tiene productos activos.</p>
            </div>
          )}
        </div>

        {/* Bottom WhatsApp strip */}
        {showWhatsapp && (
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-800 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
            <div>
              <p className="font-bold text-lg">¿Tienes alguna pregunta?</p>
              <p className="text-sm text-white/70 mt-1">Habla directamente con {seller.nombre_comercio}</p>
            </div>
            <button
              onClick={() => handleWhatsappClick()}
              className="shrink-0 inline-flex items-center gap-2.5 px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full shadow-lg transition-all active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              Consultar por WhatsApp
            </button>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════
          REVIEWS SECTION
      ══════════════════════════════════════════════ */}
      <section className="mt-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Opiniones</p>
            <h2 className="text-2xl font-bold text-neutral-900">Reseñas de clientes</h2>
          </div>

          {/* Rating summary */}
          {ratingSummary && ratingSummary.total > 0 && (
            <div className="text-right">
              <div className="text-3xl font-black text-neutral-900">
                {ratingSummary.avg_rating?.toFixed(1)}
              </div>
              <Stars rating={Math.round(ratingSummary.avg_rating ?? 0)} size="sm" />
              <p className="text-xs text-neutral-400 mt-0.5">{ratingSummary.total} reseñas</p>
            </div>
          )}
        </div>

        {/* Review list */}
        {reviews.length > 0 ? (
          <div className="space-y-4 mb-8">
            {(showAllReviews ? reviews : reviews.slice(0, 4)).map((r) => (
              <div key={r.id} className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm">
                      {r.buyer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-neutral-800">{r.buyer_name}</p>
                      <Stars rating={r.rating} />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 flex-shrink-0">
                    {new Date(r.created_at).toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                {r.comment && (
                  <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{r.comment}</p>
                )}
                {r.product_nombre && (
                  <p className="mt-2 text-xs text-neutral-400">
                    Sobre: <span className="text-neutral-600">{r.product_nombre}</span>
                  </p>
                )}
              </div>
            ))}

            {reviews.length > 4 && (
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="w-full py-3 text-sm font-semibold text-[#0F3D3A] border border-[#0F3D3A]/30 rounded-xl hover:bg-[#0F3D3A]/5 transition"
              >
                {showAllReviews ? "Ver menos" : `Ver todas las reseñas (${reviews.length})`}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-neutral-400 text-sm mb-8">
            Aún no hay reseñas. ¡Sé el primero en dejar tu opinión!
          </div>
        )}

        {/* Review form */}
        <ReviewForm sellerId={seller.id} onSubmitted={loadReviews} />
      </section>

    </ProductDiscoveryLayout>
  );
}
