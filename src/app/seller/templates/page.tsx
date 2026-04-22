"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

type CollectionTemplate = {
  id: number;
  name: string;
  thumbnail_url: string | null;
  canvas_width: number;
  canvas_height: number;
  background_color: string;
  background_style: string | null;
  background_image_url: string | null;
  item_count: number;
  created_at: string;
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

export default function SellerTemplatesPage() {
  const [templates, setTemplates] = useState<CollectionTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/collections/templates")
      .then((r) => r.json())
      .then((data) => setTemplates(Array.isArray(data?.data) ? data.data : []))
      .finally(() => setLoading(false));
  }, []);

  const sortedTemplates = [...templates].sort((a, b) => {
    const metaA = getTemplateMeta(a.name);
    const metaB = getTemplateMeta(b.name);
    return metaA.family.localeCompare(metaB.family) || metaA.variant.localeCompare(metaB.variant);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/seller/collections" className="mb-2 inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-800">
            <ArrowLeft className="h-4 w-4" />
            Volver a colecciones
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Plantillas</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Biblioteca premium para lanzar colecciones con mejor jerarquia, tono y adaptacion por formato.
          </p>
        </div>
      </div>

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
            return (
            <div key={template.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div
                className="relative h-40 w-full overflow-hidden"
                style={{ background: template.background_style || template.background_color || "#FFFFFF" }}
              >
                {(template.thumbnail_url || template.background_image_url) && (
                  <img
                    src={template.thumbnail_url || template.background_image_url || ""}
                    alt={template.name}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 shadow-sm">
                  {templateMeta.variant}
                </div>
                <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white">
                  {template.canvas_width} × {template.canvas_height}
                </div>
              </div>
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
