"use client";

import { useState, useCallback } from "react";
import { CollectionPreviewBox } from "@/components/seller/CollectionArtworkPreview";
import {
  ArrowLeft,
  Store,
  Share2,
  Check,
  MessageCircle,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import { buildWhatsAppHref, extractWhatsAppPhone } from "@/lib/whatsapp";

type Product = {
  id: string;
  nombre: string;
  precio?: number | string | null;
  imagen_url?: string | null;
};

type CanvasItem = {
  id?: number | null;
  element_type?: "product" | "text" | "shape" | "image";
  content?: Record<string, unknown> | null;
  product_id?: string | null;
  pos_x?: number;
  pos_y?: number;
  width?: number;
  height?: number;
  z_index?: number;
  product_name?: string | null;
  product_image?: string | null;
};

type CollectionData = {
  id: number;
  public_id: string | null;
  name: string;
  description: string | null;
  promo_image_url: string | null;
  background_image_url: string | null;
  background_color: string;
  background_style: string | null;
  canvas_width: number;
  canvas_height: number;
  product_count: number;
  products: Product[];
  items: CanvasItem[];
  seller: {
    nombre_comercio: string;
    user_id: number;
    logo_url: string | null;
    whatsapp?: string | null;
  } | null;
};

export default function CollectionPublicClient({
  collection,
}: {
  collection: CollectionData;
}) {
  const { seller, products } = collection;
  const storeHref = seller?.user_id ? `/store/${seller.user_id}` : "/";

  const [shared, setShared] = useState(false);

  const whatsappPhone = seller?.whatsapp
    ? extractWhatsAppPhone(seller.whatsapp)
    : null;
  const whatsappHref = whatsappPhone
    ? buildWhatsAppHref(
        whatsappPhone,
        `Hola! Vi la colección "${collection.name}" en Flowjuyu y me gustaría saber más.`
      )
    : null;

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: collection.name,
      text: `Mira esta colección: ${collection.name}`,
      url,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } catch {
        /* silent */
      }
    }
  }, [collection.name]);

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* ── Sticky nav ── */}
      <header className="sticky top-0 z-30 border-b border-neutral-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <a
            href={storeHref}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver a la tienda</span>
          </a>

          <div className="ml-auto flex items-center gap-2">
            {/* Share button */}
            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                shared
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              {shared ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Enlace copiado</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Compartir</span>
                </>
              )}
            </button>

            {/* Seller badge */}
            <a
              href={storeHref}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              {seller?.logo_url ? (
                <img
                  src={seller.logo_url}
                  alt={seller.nombre_comercio}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
                  <Store className="h-3.5 w-3.5 text-neutral-400" />
                </div>
              )}
              <span className="text-xs font-medium text-neutral-700">
                {seller?.nombre_comercio ?? "Tienda"}
              </span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8">
        {/* ── Canvas preview ── */}
        <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
          <CollectionPreviewBox
            name={collection.name}
            imageUrl={
              !(collection.items?.length)
                ? (collection.promo_image_url ?? collection.background_image_url ?? null)
                : null
            }
            backgroundImageUrl={collection.background_image_url ?? undefined}
            items={collection.items}
            backgroundColor={collection.background_color}
            backgroundStyle={collection.background_style}
            canvasWidth={collection.canvas_width}
            canvasHeight={collection.canvas_height}
            maxWidth={1200}
            maxHeight={700}
            className="w-full"
            playAnimations
          />
        </div>

        {/* ── Collection header ── */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
              Colección
            </p>
            <h1 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-neutral-500">
                {collection.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 gap-2">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 hover:shadow"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Contactar</span>
              </a>
            )}
            <button
              onClick={handleShare}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                shared
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              {shared ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Compartir
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Products grid ── */}
        {products.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Productos · {products.length}
              </h2>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-emerald-600 transition hover:text-emerald-700"
                >
                  Preguntar por precio →
                </a>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {products.map((product) => (
                <a
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-md"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-neutral-50">
                    {product.imagen_url ? (
                      <img
                        src={product.imagen_url}
                        alt={product.nombre}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-neutral-200" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/5" />
                    <div className="absolute bottom-2 right-2 translate-y-1 rounded-full bg-white/90 p-1.5 opacity-0 shadow-sm backdrop-blur-sm transition group-hover:translate-y-0 group-hover:opacity-100">
                      <ExternalLink className="h-3 w-3 text-neutral-600" />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-neutral-800 group-hover:text-neutral-900">
                      {product.nombre}
                    </p>
                    {product.precio != null ? (
                      <p className="mt-0.5 text-sm font-semibold text-neutral-900">
                        Q{Number(product.precio).toFixed(2)}
                      </p>
                    ) : null}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── Seller card ── */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {seller?.logo_url ? (
                <img
                  src={seller.logo_url}
                  alt={seller.nombre_comercio}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-neutral-100"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                  <Store className="h-6 w-6 text-neutral-400" />
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                  Vendedor
                </p>
                <p className="text-base font-semibold text-neutral-900">
                  {seller?.nombre_comercio ?? "Tienda"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              <a
                href={storeHref}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                Ver tienda →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
