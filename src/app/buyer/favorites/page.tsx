"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Sparkles } from "lucide-react";
import { useFavorites, type FavoriteItem } from "@/hooks/useFavorites";
import { MarketingOptInNudge } from "@/components/consent/MarketingOptInNudge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuyerFavoritesPage() {
  const { favorites, loading } = useFavorites();

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-5 h-5 text-orange-400 fill-orange-400" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Mis Favoritos
          </h1>
        </div>
        <p className="text-sm text-gray-400 pl-7">
          {loading
            ? "Cargando tu lista..."
            : favorites.length > 0
            ? `${favorites.length} ${
                favorites.length === 1
                  ? "pieza guardada"
                  : "piezas guardadas"
              } — toca el corazón para quitar`
            : "Las piezas que guardes aparecerán aquí."}
        </p>
      </div>

      {!loading && favorites.length > 0 && (
        <MarketingOptInNudge
          promptKey="buyer_marketing_email_favorites"
          eligible={favorites.length > 0}
          eyebrow="Descubrimientos opcionales"
          title="Recibe avisos cuando aparezcan piezas, colecciones o promos que sí te interesen"
          description="Si ya guardaste favoritos, podemos avisarte por email sobre novedades y oportunidades promocionales relacionadas con tu exploración en Flowjuyu."
          bullets={[
            "Nuevas piezas y lanzamientos que se parecen a lo que ya guardaste.",
            "Promociones o temporadas especiales dentro del marketplace.",
            "Selecciones editoriales para descubrir más artesanos y estilos.",
          ]}
          settingsHref="/buyer/notifications/settings"
          surface="buyer_favorites"
        />
      )}

      {/* ── Skeleton ── */}
      {loading && <SkeletonGrid />}

      {/* ── Empty state ── */}
      {!loading && favorites.length === 0 && <EmptyState />}

      {/* ── Grid ── */}
      {!loading && favorites.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {favorites.map((fav) => (
            <FavoriteCard key={fav.id} fav={fav} />
          ))}
        </div>
      )}

    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function FavoriteCard({ fav }: { fav: FavoriteItem }) {
  return (
    <article className="group relative flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">

      {/*
        FavoriteButton is OUTSIDE the Link below so its click
        never triggers navigation. The filled orange heart is always
        visible on this page — tapping it removes the item.
      */}
      <div className="absolute top-2.5 right-2.5 z-10">
        <FavoriteButton productId={fav.product_id} size="sm" />
      </div>

      {/* Image + hover overlay — all inside the navigating Link */}
      <Link href={`/product/${fav.product_id}`} className="block flex-1">

        {/* Image */}
        <div className="relative aspect-[4/5] bg-[#f0ece4] overflow-hidden">
          <Image
            src={fav.product_imagen || "/images/productos/default.jpg"}
            alt={fav.product_nombre || "Producto"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />

          {/* Dark overlay with CTA — appears on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <span className="text-white text-[9px] uppercase tracking-[0.28em] font-medium">
              Ver esta pieza →
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 space-y-1.5">
          <p className="font-serif italic text-[14px] text-[#0d0d0b] leading-snug line-clamp-2">
            {fav.product_nombre || "Producto sin nombre"}
          </p>

          {fav.seller_nombre && (
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#0d0d0b]/40 truncate">
              {fav.seller_nombre}
            </p>
          )}

          {fav.product_precio && (
            <p className="text-sm font-semibold text-[#0d2d20] tracking-tight">
              Q{Number(fav.product_precio).toFixed(2)}
            </p>
          )}
        </div>

      </Link>
    </article>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">

      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100/80 flex items-center justify-center shadow-sm">
          <Heart className="w-9 h-9 text-orange-300" />
        </div>
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-[11px]">
          ✦
        </span>
      </div>

      {/* Copy */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Aún no tienes piezas guardadas
      </h2>
      <p className="text-sm text-gray-400 max-w-[260px] mb-8 leading-relaxed">
        Toca el corazón en cualquier pieza para guardarla aquí y encontrarla
        fácilmente después.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d2d20] text-white text-[11px] uppercase tracking-[0.20em] font-medium rounded-full hover:bg-[#163a2b] transition-colors duration-200"
        >
          <ShoppingBag className="w-4 h-4" />
          Explorar productos
        </Link>
        <Link
          href="/categorias"
          className="inline-flex items-center gap-2 px-6 py-3 border border-[#0d2d20]/20 text-[#0d0d0b]/60 text-[11px] uppercase tracking-[0.20em] font-medium rounded-full hover:border-[#0d2d20]/50 hover:text-[#0d0d0b] transition-colors duration-200"
        >
          <Sparkles className="w-4 h-4" />
          Ver categorías
        </Link>
      </div>

      {/* Hint */}
      <p className="mt-10 text-[10px] uppercase tracking-[0.24em] text-gray-300">
        Tus favoritos se guardan en tu cuenta
      </p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-gray-100 overflow-hidden bg-white"
        >
          <div className="aspect-[4/5] bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-3.5 bg-gray-100 rounded-sm w-5/6" />
            <div className="h-3 bg-gray-100 rounded-sm w-3/5" />
            <div className="h-4 bg-gray-100 rounded-sm w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
