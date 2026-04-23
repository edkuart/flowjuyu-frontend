"use client";

import { Feather, Ruler, Scissors, Sparkles } from "lucide-react";
import { formatMeasuresForStore } from "@/lib/productMeasures";
import type { ProductAtributos } from "@/types/product-edit";

type ProductDetailsBlockProps = {
  atributos?: ProductAtributos | null;
  variant?: "store" | "product";
};

type DetailItem = {
  label: string;
  value: string;
  Icon: React.ElementType;
};

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function buildDetails(atributos?: ProductAtributos | null): DetailItem[] {
  if (!atributos || typeof atributos !== "object") return [];

  const medidas = formatMeasuresForStore(atributos.medidas);
  const material = cleanText(atributos.material_principal);
  const tecnica = cleanText(atributos.tecnica);
  const cuidados = cleanText(atributos.cuidados);

  return [
    medidas ? { label: "Medidas", value: medidas, Icon: Ruler } : null,
    material ? { label: "Material", value: material, Icon: Sparkles } : null,
    tecnica ? { label: "Técnica", value: tecnica, Icon: Scissors } : null,
    cuidados ? { label: "Cuidados", value: cuidados, Icon: Feather } : null,
  ].filter(Boolean) as DetailItem[];
}

export function ProductDetailsBlock({
  atributos,
  variant = "store",
}: ProductDetailsBlockProps) {
  const details = buildDetails(atributos);

  if (details.length === 0) return null;

  if (variant === "product") {
    return (
      <section className="rounded-sm border border-[#0d2d20]/10 bg-[#f6f2ea]/70 px-4 py-4">
        <div className="mb-4">
          <p className="text-[10px] tracking-[0.28em] text-[#0d2d20]/45 uppercase">
            Detalles de la pieza
          </p>
          <h2 className="mt-1 font-serif text-xl leading-tight text-[#0d0d0b] italic">
            Materiales, técnica y medidas
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {details.map(({ label, value, Icon }) => (
            <div
              key={label}
              className="flex min-w-0 gap-3 rounded-sm border border-[#0d2d20]/8 bg-white/70 p-3"
            >
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0d2d20]/8 text-[#0d2d20]">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] tracking-[0.20em] text-[#0d0d0b]/40 uppercase">
                  {label}
                </p>
                <p className="mt-1 break-words text-[14px] leading-snug font-semibold text-[#0d0d0b]/80">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div
      className="grid gap-2 rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3 sm:grid-cols-2"
      data-variant={variant}
    >
      {details.map(({ label, value, Icon }) => (
        <div key={label} className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#0F3D3A] shadow-sm">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-wide text-neutral-400 uppercase">
              {label}
            </p>
            <p className="break-words text-xs leading-snug font-semibold text-neutral-700">
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
