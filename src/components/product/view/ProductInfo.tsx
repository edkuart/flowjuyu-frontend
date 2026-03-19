"use client";

// src/components/product/view/ProductInfo.tsx

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Store, ChevronDown, ShieldCheck } from "lucide-react";
import WhatsAppModal from "@/components/product/WhatsAppModal";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

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
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(n);

/* ─── FAQ acordeón ─── */
const FAQ = [
  {
    q: "¿Cómo coordino el envío?",
    a: "Al contactar al artesano directamente, puedes coordinar el método de envío — correo, encomienda o entrega en persona si estás en el mismo departamento.",
  },
  {
    q: "¿Puedo pedir medidas exactas?",
    a: "Sí. Al ser piezas artesanales, muchos vendedores pueden adaptar dimensiones bajo pedido. Consúltalo directamente antes de confirmar tu compra.",
  },
  {
    q: "¿Esta pieza es exactamente igual a la foto?",
    a: "Los textiles artesanales tienen pequeñas variaciones naturales entre piezas — colores, tramas y detalles pueden variar ligeramente. Esto es parte de su autenticidad, no un defecto.",
  },
];

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

/* ─── Stars ─── */
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

/* ─── WhatsApp icon ─── */
function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ─── Main component ─── */
export default function ProductInfo({
  nombre,
  descripcion,
  precio,
  productId,
  imagen_principal,
  rating_avg = 0,
  rating_count = 0,
  sellerId,
  sellerWhatsapp,
  sellerPlan,
  sellerPlanActivo,
  sellerNombre,
  sellerLogo,
  ubicacion,
  categoria,
  stock,
}: Props) {
  const precioNumber = Number(precio || 0);
  const [modalOpen, setModalOpen] = useState(false);

  const showWhatsapp =
    !!sellerWhatsapp &&
    sellerPlan === "founder" &&
    sellerPlanActivo === true;

  // Mensaje base — el usuario puede editarlo en el modal
  const baseMessage =
    `Hola, vi esta pieza en Flowjuyu y me interesa:\n\n"${nombre}"\n\n` +
    `¿Sigue disponible? Me gustaría saber más y coordinar el envío. ¡Gracias!`;

  async function handleWhatsappConfirm(message: string) {
    // Registrar intención antes de abrir WhatsApp
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/intentions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productId,
            seller_id: sellerId,
            source: "product_whatsapp",
          }),
        }
      );
    } catch {}

    setModalOpen(false);
    window.open(
      `https://wa.me/${sellerWhatsapp}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  const logoSrc =
    sellerLogo && sellerLogo.startsWith("http")
      ? sellerLogo
      : "/images/tiendas/default.jpg";

  return (
    <>
      <section className="space-y-6 bg-white rounded-sm p-6 md:p-8 border border-[#0d2d20]/8">

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
            aria-label="Ver reseñas"
          >
            <Stars rating={rating_avg} />
            <span className="text-[12px] text-[#0d0d0b]/50 group-hover:text-[#0d2d20] transition">
              {rating_avg.toFixed(1)} · {rating_count}{" "}
              {rating_count === 1 ? "reseña" : "reseñas"}
            </span>
          </a>
        ) : (
          <a
            href="#reviews"
            className="text-[12px] text-[#0d0d0b]/35 hover:text-[#0d2d20] transition w-fit block"
          >
            Sin reseñas todavía — sé el primero
          </a>
        )}

        <div className="h-px bg-[#0d2d20]/8" />

        {/* ── Precio ── */}
        <div>
          <p className="font-serif text-[36px] md:text-[40px] text-[#0d2d20] leading-none tracking-tight">
            {formatPrice(precioNumber)}
          </p>
        </div>

        <div className="h-px bg-[#0d2d20]/8" />

        {/* ── Descripción — genera deseo antes del CTA ── */}
        {descripcion && (
          <p className="text-[14px] text-[#0d0d0b]/65 leading-relaxed">
            {descripcion}
          </p>
        )}

        {/* ── Urgencia + seller + CTAs ── */}
        <div className="space-y-4">

          {/* Urgencia contextual — solo cuando hay stock=1 */}
          {stock === 1 && (
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#0d2d20] flex items-center gap-2">
              <span className="text-[8px]">✦</span>
              Última pieza disponible
            </p>
          )}

          {/* Seller badge — confianza antes del clic */}
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
                    Verificado por Flowjuyu
                  </span>
                </div>
              </div>
              {sellerId && (
                <Link
                  href={`/store/${sellerId}`}
                  className="text-[10px] uppercase tracking-[0.20em] text-[#0d0d0b]/40 hover:text-[#0d2d20] transition flex-shrink-0"
                >
                  Ver tienda →
                </Link>
              )}
            </div>
          )}

          {/* CTAs */}
          <div className="space-y-2 pt-1">
            {showWhatsapp ? (
              /* WhatsApp — CTA primario con glow sutil en hover */
              <button
                onClick={() => setModalOpen(true)}
                className="
                  w-full flex items-center justify-center gap-2
                  bg-[#0d2d20] text-white
                  text-[11px] uppercase tracking-[0.18em]
                  py-4
                  hover:bg-[#163a2b]
                  transition-colors duration-200
                  relative overflow-hidden
                  group
                "
              >
                {/* Shimmer muy sutil en hover */}
                <span className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.04] transition-colors duration-300 pointer-events-none" />
                <WhatsAppIcon />
                Preguntar por esta pieza
              </button>
            ) : sellerId ? (
              <Link href={`/store/${sellerId}`} className="block">
                <span className="w-full flex items-center justify-center gap-2 bg-[#0d2d20] text-white text-[11px] uppercase tracking-[0.18em] py-4 hover:bg-[#163a2b] transition-colors duration-200">
                  <Store className="w-4 h-4" />
                  Conocer más de esta pieza
                </span>
              </Link>
            ) : null}

            {/* CTA secundario */}
            {showWhatsapp && sellerId && (
              <Link href={`/store/${sellerId}`} className="block">
                <span className="w-full flex items-center justify-center border border-[#0d2d20]/20 text-[#0d0d0b]/70 text-[10px] uppercase tracking-[0.18em] py-3 hover:border-[#0d2d20]/50 hover:text-[#0d0d0b] transition-colors duration-200">
                  Ver más de este artesano
                </span>
              </Link>
            )}
          </div>

          {/* Guardar pieza + nota de envío */}
          <div className="flex items-center justify-between pt-1">
            <FavoriteButton productId={productId} showLabel />
            <p className="text-[10px] text-[#0d0d0b]/35 tracking-wide text-right">
              El artesano responde directo
            </p>
          </div>

        </div>

        <div className="h-px bg-[#0d2d20]/8" />

        {/* ── Trust signals ── */}
        <ul className="space-y-[6px]">
          {[
            "Técnicas y materiales tradicionales",
            "Contacto directo con quien la hizo",
          ].map((text) => (
            <li key={text} className="flex items-center gap-2 text-[11px] text-[#0d0d0b]/50">
              <span className="text-[#0d2d20] font-bold flex-shrink-0 text-[10px]">✔</span>
              {text}
            </li>
          ))}
        </ul>

        {/* ── FAQ ── */}
        <div className="space-y-0">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#0d0d0b]/40 mb-3">
            Preguntas frecuentes
          </p>
          {FAQ.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

      </section>

      {/* ── WhatsApp Modal ── */}
      <WhatsAppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleWhatsappConfirm}
        product={{
          nombre,
          precio: precioNumber,
          imagen: imagen_principal,
        }}
        seller={{
          nombre: sellerNombre ?? null,
        }}
        initialMessage={baseMessage}
      />
    </>
  );
}
