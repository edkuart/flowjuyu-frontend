"use client";

// src/components/product/view/ProductInfo.tsx

import { useEffect, useState } from "react";
import { trackNavigationEnd } from "@/lib/performance";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronDown, ShieldCheck } from "lucide-react";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ProductContactCTA } from "@/components/product/ProductContactCTA";
import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";

type Props = {
  nombre: string;
  descripcion?: string | null;
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
  stock?: number | null;
  internal_code?: string | null;
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
        className="w-full flex items-center justify-between py-3 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="text-[13px] text-[#0d0d0b]/80 font-medium leading-snug">
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-[#0d2d20]/50 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="text-[12px] text-[#0d0d0b]/55 leading-relaxed pb-4 pr-6">
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
          className={n <= Math.round(rating) ? "text-[#0d2d20]" : "text-[#0d2d20]/20"}
        >
          <path d="M5 1l1.12 2.27L8.5 3.64l-1.75 1.7.41 2.41L5 6.52 2.84 7.75l.41-2.41L1.5 3.64l2.38-.37L5 1z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductInfo({
  nombre,
  descripcion,
  precio,
  productId,
  imagen_principal: _imagen_principal,
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
  stock,
  internal_code,
}: Props) {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  const FAQ = [
    { q: tr("pdp.faqShipping"),  a: tr("pdp.faqShippingAnswer") },
    { q: tr("pdp.faqMeasures"),  a: tr("pdp.faqMeasuresAnswer") },
    { q: tr("pdp.faqExact"),     a: tr("pdp.faqExactAnswer") },
  ];

  const precioNumber = Number(precio || 0);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => { trackNavigationEnd("Product Page") }, []);

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
      <section className="space-y-4 md:space-y-6 bg-white rounded-sm p-4 md:p-8 border border-[#0d2d20]/8">

        {/* ── Eyebrow: categoría + origen ── */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.26em] text-[#0d2d20]/55">
          {categoria && <span>{categoria}</span>}
          {categoria && ubicacion && <span aria-hidden>·</span>}
          {ubicacion && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {ubicacion}
            </span>
          )}
        </div>

        {/* ── Título ── */}
        <h1 className="font-serif italic text-[26px] md:text-[30px] text-[#0d0d0b] leading-[1.1]">
          {nombre}
        </h1>

        {/* ── Rating ── */}
        {rating_count > 0 ? (
          <a
            href="#reviews"
            className="flex items-center gap-2 group w-fit"
            aria-label={tr("pdp.seeReviews")}
          >
            <Stars rating={rating_avg} />
            <span className="text-[12px] text-[#0d0d0b]/50 group-hover:text-[#0d2d20] transition">
              {rating_avg.toFixed(1)} · {rating_count}{" "}
              {rating_count === 1 ? tr("pdp.review") : tr("pdp.reviews")}
            </span>
          </a>
        ) : (
          <a
            href="#reviews"
            className="text-[12px] text-[#0d0d0b]/35 hover:text-[#0d2d20] transition w-fit block"
          >
            {tr("pdp.noReviews")}
          </a>
        )}

        {internal_code && (
          <div className="flex items-center gap-2 text-[11px] text-[#0d0d0b]/40">
            <span>
              {tr("pdp.code")}:{" "}
              <span className="font-mono text-[#0d0d0b]/60">{internal_code}</span>
            </span>
            <button
              onClick={handleCopyCode}
              className="hover:text-[#0d0d0b]/70 transition-colors"
              aria-label={tr("pdp.copyCode")}
            >
              {codeCopied
                ? <span className="text-green-600">{tr("pdp.copied")}</span>
                : <span>{tr("pdp.copy")}</span>
              }
            </button>
          </div>
        )}

        <div className="h-px bg-[#0d2d20]/8" />

        {/* ── Precio ── */}
        <div>
          <p className="font-serif text-[36px] md:text-[40px] text-[#0d2d20] leading-none tracking-tight">
            {formatPrice(precioNumber)}
          </p>
        </div>

        <div className="h-px bg-[#0d2d20]/8" />

        {/* ── Descripción ── */}
        {descripcion && (
          <p className="text-[14px] text-[#0d0d0b]/65 leading-relaxed">
            {descripcion}
          </p>
        )}

        {/* ── Urgencia + seller + CTAs ── */}
        <div className="space-y-4">

          {stock === 1 && (
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#0d2d20] flex items-center gap-2">
              <span className="text-[8px]">✦</span>
              {tr("pdp.lastPiece")}
            </p>
          )}

          {(sellerNombre || sellerId) && (
            <div className="flex items-center gap-3 py-3 px-4 bg-[#f6f2ea] border border-[#0d2d20]/10 rounded-sm">
              <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-[#0d2d20]/10 bg-[#0d2d20]/10 flex items-center justify-center">
                {sellerLogo ? (
                  <Image
                    src={logoSrc}
                    alt={sellerNombre ?? "Artesano"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-bold text-[#0d2d20] uppercase leading-none">
                    {(sellerNombre ?? "A").charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#0d0d0b] leading-tight truncate">
                  {sellerNombre ?? "Tienda artesanal"}
                </p>
                <div className="flex items-center gap-1 mt-[2px]">
                  <ShieldCheck className="w-3 h-3 text-[#0d2d20]" />
                  <span className="text-[10px] text-[#0d2d20] uppercase tracking-[0.18em]">
                    {tr("pdp.verifiedBy")}
                  </span>
                </div>
              </div>
              {sellerId && (
                <Link
                  href={`/store/${sellerId}`}
                  className="text-[10px] uppercase tracking-[0.20em] text-[#0d0d0b]/40 hover:text-[#0d2d20] transition flex-shrink-0"
                >
                  {tr("pdp.viewStore")}
                </Link>
              )}
            </div>
          )}

          <ProductContactCTA
            productId={productId}
            productNombre={nombre}
            productPrecio={precioNumber}
            productImagen={_imagen_principal}
            internalCode={internal_code}
            productUrl={internal_code ? `/p/${internal_code}` : undefined}
            sellerWhatsapp={sellerWhatsapp}
            sellerNombre={sellerNombre}
          />

          <div className="flex items-center justify-between pt-1">
            <FavoriteButton productId={productId} showLabel />
            <p className="text-[10px] text-[#0d0d0b]/35 tracking-wide text-right">
              {tr("pdp.artisanResponds")}
            </p>
          </div>

        </div>

        <div className="h-px bg-[#0d2d20]/8" />

        {/* ── Trust signals ── */}
        <ul className="space-y-[6px]">
          {[tr("pdp.trustHandmade"), tr("pdp.trustDirect")].map((text) => (
            <li key={text} className="flex items-center gap-2 text-[11px] text-[#0d0d0b]/50">
              <span className="text-[#0d2d20] font-bold flex-shrink-0 text-[10px]">✔</span>
              {text}
            </li>
          ))}
        </ul>

        {/* ── FAQ ── */}
        <div className="space-y-0">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#0d0d0b]/40 mb-3">
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
