"use client";

import { useEffect, useMemo, useState } from "react";
import { trackNavigationEnd } from "@/lib/performance";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronDown, ShieldCheck } from "lucide-react";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ProductContactCTA } from "@/components/product/ProductContactCTA";
import { ProductDetailsBlock } from "@/components/product/ProductDetailsBlock";
import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";
import { getLocalizedField } from "@/lib/getLocalizedField";
import type { ProductAtributos } from "@/types/product-edit";

type Props = {
  nombre: string;
  nombre_kiche?: string | null;
  nombre_kaqchikel?: string | null;
  nombre_qeqchi?: string | null;
  descripcion?: string | null;
  descripcion_kiche?: string | null;
  descripcion_kaqchikel?: string | null;
  descripcion_qeqchi?: string | null;
  precio: any;
  productId: string;
  imagen_principal?: string | null;
  rating_avg?: number;
  rating_count?: number;
  sellerId?: number;
  sellerWhatsapp?: string | null;
  sellerPlan?: "free" | "founder";
  sellerPlanActivo?: boolean;
  sellerNombre?: string | null;
  sellerLogo?: string | null;
  ubicacion?: string;
  categoria?: string | null;
  categoria_kiche?: string | null;
  categoria_kaqchikel?: string | null;
  categoria_qeqchi?: string | null;
  stock?: number | null;
  internal_code?: string | null;
  atributos?: ProductAtributos | null;
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(n);

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#0d2d20]/10 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between gap-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-[13px] leading-snug font-medium text-[#0d0d0b]/80">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-[#0d2d20]/50 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="pr-6 pb-4 text-[12px] leading-relaxed text-[#0d0d0b]/55">
          {a}
        </p>
      )}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-[2px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="11"
          height="11"
          viewBox="0 0 10 10"
          fill="currentColor"
          className={
            n <= Math.round(rating) ? "text-[#0d2d20]" : "text-[#0d2d20]/20"
          }
        >
          <path d="M5 1l1.12 2.27L8.5 3.64l-1.75 1.7.41 2.41L5 6.52 2.84 7.75l.41-2.41L1.5 3.64l2.38-.37L5 1z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductInfo({
  nombre,
  nombre_kiche,
  nombre_kaqchikel,
  nombre_qeqchi,
  descripcion,
  descripcion_kiche,
  descripcion_kaqchikel,
  descripcion_qeqchi,
  precio,
  productId,
  imagen_principal: imagenPrincipal,
  rating_avg = 0,
  rating_count = 0,
  sellerId,
  sellerWhatsapp,
  sellerPlan: _sellerPlan,
  sellerPlanActivo: _sellerPlanActivo,
  sellerNombre,
  sellerLogo,
  ubicacion,
  categoria,
  categoria_kiche,
  categoria_kaqchikel,
  categoria_qeqchi,
  stock,
  internal_code,
  atributos,
}: Props) {
  const { dictionary, language } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  const localizedNombre = useMemo(
    () =>
      getLocalizedField(
        { nombre, nombre_kiche, nombre_kaqchikel, nombre_qeqchi },
        "nombre",
        language,
      ) ?? nombre,
    [language, nombre, nombre_kaqchikel, nombre_kiche, nombre_qeqchi],
  );

  const localizedDescripcion = useMemo(
    () =>
      getLocalizedField(
        {
          descripcion,
          descripcion_kiche,
          descripcion_kaqchikel,
          descripcion_qeqchi,
        },
        "descripcion",
        language,
      ) ??
      descripcion ??
      null,
    [
      descripcion,
      descripcion_kaqchikel,
      descripcion_kiche,
      descripcion_qeqchi,
      language,
    ],
  );

  const localizedCategoria = useMemo(
    () =>
      getLocalizedField(
        {
          nombre: categoria,
          nombre_kiche: categoria_kiche,
          nombre_kaqchikel: categoria_kaqchikel,
          nombre_qeqchi: categoria_qeqchi,
        },
        "nombre",
        language,
      ) ??
      categoria ??
      null,
    [
      categoria,
      categoria_kaqchikel,
      categoria_kiche,
      categoria_qeqchi,
      language,
    ],
  );

  const FAQ = [
    { q: tr("pdp.faqShipping"), a: tr("pdp.faqShippingAnswer") },
    { q: tr("pdp.faqMeasures"), a: tr("pdp.faqMeasuresAnswer") },
    { q: tr("pdp.faqExact"), a: tr("pdp.faqExactAnswer") },
  ];

  const precioNumber = Number(precio || 0);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    trackNavigationEnd("Product Page");
  }, []);

  async function handleCopyCode() {
    if (!internal_code) return;
    try {
      await navigator.clipboard.writeText(internal_code);
    } catch {
      const el = document.createElement("textarea");
      el.value = internal_code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  const logoSrc =
    sellerLogo && sellerLogo.startsWith("http")
      ? sellerLogo
      : "/images/tiendas/default.jpg";

  return (
    <>
      <section className="space-y-4 rounded-sm border border-[#0d2d20]/8 bg-[#fdfcf9] p-4 md:space-y-6 md:p-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] tracking-[0.26em] text-[#0d2d20]/55 uppercase">
          {localizedCategoria && <span>{localizedCategoria}</span>}
          {localizedCategoria && ubicacion && <span aria-hidden>·</span>}
          {ubicacion && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {ubicacion}
            </span>
          )}
        </div>

        <h1 className="font-serif text-[26px] leading-[1.1] text-[#0d0d0b] italic md:text-[30px]">
          {localizedNombre}
        </h1>

        {rating_count > 0 ? (
          <a
            href="#reviews"
            className="group flex w-fit items-center gap-2"
            aria-label={tr("pdp.seeReviews")}
          >
            <Stars rating={rating_avg} />
            <span className="text-[12px] text-[#0d0d0b]/50 transition group-hover:text-[#0d2d20]">
              {rating_avg.toFixed(1)} · {rating_count}{" "}
              {rating_count === 1 ? tr("pdp.review") : tr("pdp.reviews")}
            </span>
          </a>
        ) : (
          <a
            href="#reviews"
            className="block w-fit text-[12px] text-[#0d0d0b]/35 transition hover:text-[#0d2d20]"
          >
            {tr("pdp.noReviews")}
          </a>
        )}

        {internal_code && (
          <div className="flex items-center gap-2 text-[11px] text-[#0d0d0b]/40">
            <span>
              {tr("pdp.code")}:{" "}
              <span className="font-mono text-[#0d0d0b]/60">
                {internal_code}
              </span>
            </span>
            <button
              onClick={handleCopyCode}
              className="transition-colors hover:text-[#0d0d0b]/70"
              aria-label={tr("pdp.copyCode")}
            >
              {codeCopied ? (
                <span className="text-green-600">{tr("pdp.copied")}</span>
              ) : (
                <span>{tr("pdp.copy")}</span>
              )}
            </button>
          </div>
        )}

        <div className="h-px bg-[#0d2d20]/8" />

        <div>
          <p className="font-serif text-[36px] leading-none tracking-tight text-[#0d2d20] md:text-[40px]">
            {formatPrice(precioNumber)}
          </p>
        </div>

        <ProductDetailsBlock atributos={atributos} variant="product" />

        {localizedDescripcion && (
          <section className="space-y-2">
            <p className="text-[10px] tracking-[0.28em] text-[#0d0d0b]/40 uppercase">
              Descripción
            </p>
            <p className="text-[14px] leading-relaxed text-[#0d0d0b]/65">
              {localizedDescripcion}
            </p>
          </section>
        )}

        <div className="space-y-4">
          {stock === 1 && (
            <p className="flex items-center gap-2 text-[11px] tracking-[0.22em] text-[#0d2d20] uppercase">
              <span className="text-[8px]">✦</span>
              {tr("pdp.lastPiece")}
            </p>
          )}

          {(sellerNombre || sellerId) && (
            <div className="flex items-center gap-3 rounded-xl border border-[#0d2d20]/8 bg-[#f6f2ea] px-4 py-3">
              <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#0d2d20]/10 bg-[#0d2d20]/10">
                {sellerLogo ? (
                  <Image
                    src={logoSrc}
                    alt={sellerNombre ?? "Artesano"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-[11px] leading-none font-bold text-[#0d2d20] uppercase">
                    {(sellerNombre ?? "A").charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] leading-tight font-semibold text-[#0d0d0b]">
                  {sellerNombre ?? "Tienda artesanal"}
                </p>
                <div className="mt-[2px] flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-[#0d2d20]" />
                  <span className="text-[10px] tracking-[0.18em] text-[#0d2d20] uppercase">
                    {tr("pdp.verifiedBy")}
                  </span>
                </div>
              </div>
              {sellerId && (
                <Link
                  href={`/store/${sellerId}`}
                  className="flex-shrink-0 text-[10px] tracking-[0.20em] text-[#0d0d0b]/40 uppercase transition hover:text-[#0d2d20]"
                >
                  {tr("pdp.viewStore")}
                </Link>
              )}
            </div>
          )}

          <ProductContactCTA
            productId={productId}
            productNombre={localizedNombre}
            productPrecio={precioNumber}
            productImagen={imagenPrincipal}
            internalCode={internal_code}
            productUrl={internal_code ? `/p/${internal_code}` : undefined}
            sellerWhatsapp={sellerWhatsapp}
            sellerNombre={sellerNombre}
          />

          <div className="flex items-center justify-between pt-1">
            <FavoriteButton productId={productId} showLabel />
            <p className="text-right text-[10px] tracking-wide text-[#0d0d0b]/35">
              {tr("pdp.artisanResponds")}
            </p>
          </div>
        </div>

        <div className="h-px bg-[#0d2d20]/8" />

        <ul className="space-y-[6px]">
          {[tr("pdp.trustHandmade"), tr("pdp.trustDirect")].map((text) => (
            <li
              key={text}
              className="flex items-center gap-2 text-[11px] text-[#0d0d0b]/50"
            >
              <span className="flex-shrink-0 text-[9px] text-[#d4a853]">
                ✦
              </span>
              {text}
            </li>
          ))}
        </ul>

        <div className="space-y-0">
          <p className="mb-3 text-[10px] tracking-[0.28em] text-[#0d0d0b]/40 uppercase">
            {tr("pdp.faqTitle")}
          </p>
          {FAQ.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>
    </>
  );
}
