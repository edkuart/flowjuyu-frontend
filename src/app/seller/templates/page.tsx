"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Loader2, Shuffle } from "lucide-react";
import { PageBackNav } from "@/components/ui/PageBackNav";
import { CollectionPreviewBox } from "@/components/seller/CollectionArtworkPreview";
import { apiFetch } from "@/lib/api";

type TemplateCanvasItem = {
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

type CollectionTemplate = {
  id: number;
  name: string;
  thumbnail_url: string | null;
  items_snapshot?: TemplateCanvasItem[] | string | null;
  canvas_width: number;
  canvas_height: number;
  background_color: string;
  background_style: string | null;
  background_image_url: string | null;
  item_count: number;
  created_at: string;
};

type SellerProduct = {
  id: string;
  nombre?: string;
};

type ProductEditPreview = {
  imagen_principal?: string | null;
  imagenes?: Array<{ id: number; url: string }>;
};

function getCanvasFormatLabel(width: number, height: number) {
  if (width === height) return "Square";
  if (height > width) return "Portrait";
  return "Landscape";
}

function getTemplateMeta(name: string) {
  const [familyRaw, variantRaw] = name.split("/").map((part) => part.trim());
  const family = familyRaw || name;
  const variant = variantRaw || "Base";

  const descriptions: Record<string, string> = {
    "Maison Editorial": "Lanzamientos premium con direccion editorial y hero dominante.",
    "Signature Drop": "Drops de alto impacto para novedades y capsulas cortas.",
    "Crafted Heritage": "Textiles, origen y oficio con tono de lujo artesanal.",
    "Modern Atelier": "Moda refinada, limpia y contemporanea para colecciones sobrias.",
    "Premium Offer": "Promociones elegantes que siguen priorizando percepcion de marca.",
    "Lookbook Grid": "Presentacion de multiples piezas con lectura editorial clara.",
  };

  return {
    family,
    variant,
    description: descriptions[family] ?? "Plantilla premium pensada para lanzar colecciones con mas criterio comercial.",
  };
}

function parseTemplateItems(itemsSnapshot: CollectionTemplate["items_snapshot"]): TemplateCanvasItem[] {
  if (Array.isArray(itemsSnapshot)) return itemsSnapshot;
  if (typeof itemsSnapshot !== "string" || !itemsSnapshot.trim()) return [];
  try {
    const parsed = JSON.parse(itemsSnapshot);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildSampleProductImages(product: ProductEditPreview | null): string[] {
  if (!product) return [];
  const gallery = Array.isArray(product.imagenes)
    ? product.imagenes.map((image) => image?.url).filter((url): url is string => typeof url === "string" && url.length > 0)
    : [];
  const merged = [product.imagen_principal, ...gallery].filter((url): url is string => typeof url === "string" && url.length > 0);
  return [...new Set(merged)].slice(0, 3);
}

function injectSampleProductImages(items: TemplateCanvasItem[], sampleImages: string[]): TemplateCanvasItem[] {
  if (sampleImages.length === 0) return items;
  let sampleIndex = 0;
  return items.map((item) => {
    if (item.element_type !== "product") return item;
    const nextImage = sampleImages[Math.min(sampleIndex, sampleImages.length - 1)] ?? item.product_image ?? null;
    sampleIndex += 1;
    return {
      ...item,
      product_image: nextImage,
    };
  });
}

export default function SellerTemplatesPage() {
  const [templates, setTemplates] = useState<CollectionTemplate[]>([]);
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [selectedSampleProductId, setSelectedSampleProductId] = useState<string>("");
  const [sampleProductPreview, setSampleProductPreview] = useState<ProductEditPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/collections/templates").then((r) => r.json()),
      apiFetch("/api/seller/products").then((r) => r.json()).catch(() => []),
    ])
      .then(([templatesRes, sellerProductsRes]) => {
        setTemplates(Array.isArray(templatesRes?.data) ? templatesRes.data : []);

        const sellerProducts = Array.isArray(sellerProductsRes)
          ? sellerProductsRes
          : sellerProductsRes?.data ?? sellerProductsRes?.productos ?? [];
        const normalizedProducts = Array.isArray(sellerProducts) ? sellerProducts : [];
        setSellerProducts(normalizedProducts);
        if (normalizedProducts.length > 0) {
          const randomIndex = Math.floor(Math.random() * normalizedProducts.length);
          setSelectedSampleProductId(normalizedProducts[randomIndex]?.id ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSampleProductId) {
      setSampleProductPreview(null);
      return;
    }

    let cancelled = false;

    apiFetch(`/api/productos/${selectedSampleProductId}/edit`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSampleProductPreview(data?.product ?? null);
      })
      .catch(() => {
        if (!cancelled) setSampleProductPreview(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSampleProductId]);

  const selectedSampleProduct = useMemo(
    () => sellerProducts.find((product) => product.id === selectedSampleProductId) ?? null,
    [sellerProducts, selectedSampleProductId],
  );

  const sortedTemplates = [...templates].sort((a, b) => {
    const metaA = getTemplateMeta(a.name);
    const metaB = getTemplateMeta(b.name);
    return metaA.family.localeCompare(metaB.family) || metaA.variant.localeCompare(metaB.variant);
  });

  function pickRandomSampleProduct() {
    if (sellerProducts.length < 2) return;
    const availableProducts = sellerProducts.filter((product) => product.id !== selectedSampleProductId);
    const randomIndex = Math.floor(Math.random() * availableProducts.length);
    setSelectedSampleProductId(availableProducts[randomIndex]?.id ?? selectedSampleProductId);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <PageBackNav
            variant="panel"
            onClick={() => (window.location.href = "/seller/collections")}
            label="Volver a colecciones"
            meta="Colecciones"
            title={<p className="truncate text-[15px] font-semibold text-[#14231c]">Plantillas</p>}
            className="mb-3"
          />
          <h1 className="text-2xl font-bold text-neutral-900">Plantillas</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Biblioteca premium para lanzar colecciones con mejor jerarquia, tono y adaptacion por formato.
          </p>
        </div>
        {sellerProducts.length > 0 ? (
          <div className="hidden min-w-[240px] items-center gap-2 md:flex">
            <select
              value={selectedSampleProductId}
              onChange={(e) => setSelectedSampleProductId(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-[#0F3D3A]"
            >
              {sellerProducts.map((product, index) => (
                <option key={product.id} value={product.id}>
                  {product.nombre || `Producto ${index + 1}`}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={pickRandomSampleProduct}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-50"
              disabled={sellerProducts.length < 2}
              title="Cambiar producto de muestra"
            >
              <Shuffle className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      {sellerProducts.length > 0 ? (
        <div className="flex items-center gap-2 md:hidden">
          <select
            value={selectedSampleProductId}
            onChange={(e) => setSelectedSampleProductId(e.target.value)}
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-[#0F3D3A]"
          >
            {sellerProducts.map((product, index) => (
              <option key={product.id} value={product.id}>
                {product.nombre || `Producto ${index + 1}`}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={pickRandomSampleProduct}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-50"
            disabled={sellerProducts.length < 2}
            title="Cambiar producto de muestra"
          >
            <Shuffle className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {selectedSampleProduct ? (
        <p className="text-xs text-neutral-500">
          Muestra: {selectedSampleProduct.nombre || "Producto seleccionado"}
        </p>
      ) : null}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
          Todavía no hay plantillas públicas.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sortedTemplates.map((template) => {
            const templateMeta = getTemplateMeta(template.name);
            const templateItems = injectSampleProductImages(
              parseTemplateItems(template.items_snapshot),
              buildSampleProductImages(sampleProductPreview),
            );
            return (
            <div key={template.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <CollectionPreviewBox
                name={template.name}
                imageUrl={template.thumbnail_url || template.background_image_url || null}
                items={templateItems}
                backgroundColor={template.background_color}
                backgroundStyle={template.background_style}
                canvasWidth={template.canvas_width}
                canvasHeight={template.canvas_height}
                maxWidth={600}
                maxHeight={600}
                imageFit="cover"
                emptyTitle="Vista previa"
                emptyDescription="Sin preview"
                className="w-full"
              >
                <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 shadow-sm">
                  {templateMeta.variant}
                </div>
                <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white">
                  {template.canvas_width} × {template.canvas_height}
                </div>
              </CollectionPreviewBox>
              <div className="space-y-3 p-4">
                <div>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[#F3F7F6] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0F3D3A]">
                      {templateMeta.family}
                    </span>
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      {getCanvasFormatLabel(template.canvas_width, template.canvas_height)}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-neutral-900">{templateMeta.family}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">{templateMeta.description}</p>
                  <p className="mt-2 text-xs text-neutral-400">{template.item_count} elementos</p>
                </div>
                <Link
                  href="/seller/collections"
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Abrir editor para usarla
                </Link>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
