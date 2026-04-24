"use client";

import { CollectionPreviewBox } from "@/components/seller/CollectionArtworkPreview";
import { ArrowLeft, Store } from "lucide-react";

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
  } | null;
};

export default function CollectionPublicClient({
  collection,
}: {
  collection: CollectionData;
}) {
  const { seller, products } = collection;
  const storeHref = seller?.user_id ? `/store/${seller.user_id}` : "/";

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* ── Top nav ── */}
      <header className="sticky top-0 z-30 border-b border-neutral-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <a
            href={storeHref}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a la tienda</span>
          </a>

          <div className="ml-auto flex items-center gap-2">
            {seller?.logo_url ? (
              <img
                src={seller.logo_url}
                alt={seller.nombre_comercio}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100">
                <Store className="h-4 w-4 text-neutral-400" />
              </div>
            )}
            <span className="text-sm font-medium text-neutral-700">
              {seller?.nombre_comercio ?? "Tienda"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8">
        {/* ── Canvas preview ── */}
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <CollectionPreviewBox
            name={collection.name}
            imageUrl={collection.promo_image_url ?? collection.background_image_url ?? null}
            items={collection.items}
            backgroundColor={collection.background_color}
            backgroundStyle={collection.background_style}
            canvasWidth={collection.canvas_width}
            canvasHeight={collection.canvas_height}
            maxWidth={1200}
            maxHeight={700}
            className="w-full"
          />
        </div>

        {/* ── Collection info ── */}
        <div className="mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Colección
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
            {collection.name}
          </h1>
          {collection.description ? (
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-neutral-500">
              {collection.description}
            </p>
          ) : null}
        </div>

        {/* ── Products grid ── */}
        {products.length > 0 ? (
          <section className="mt-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Productos en esta colección · {products.length}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm"
                >
                  <div className="aspect-square w-full overflow-hidden bg-neutral-50">
                    {product.imagen_url ? (
                      <img
                        src={product.imagen_url}
                        alt={product.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-200 text-4xl">
                        ·
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-neutral-800">
                      {product.nombre}
                    </p>
                    {product.precio != null ? (
                      <p className="mt-0.5 text-sm font-semibold text-neutral-900">
                        Q{Number(product.precio).toFixed(2)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── Seller link ── */}
        <div className="mt-12 flex items-center justify-between rounded-2xl border border-neutral-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            {seller?.logo_url ? (
              <img
                src={seller.logo_url}
                alt={seller.nombre_comercio}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                <Store className="h-5 w-5 text-neutral-400" />
              </div>
            )}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Vendedor
              </p>
              <p className="text-sm font-semibold text-neutral-800">
                {seller?.nombre_comercio ?? "Tienda"}
              </p>
            </div>
          </div>
          <a
            href={storeHref}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
          >
            Ver tienda →
          </a>
        </div>
      </main>
    </div>
  );
}
