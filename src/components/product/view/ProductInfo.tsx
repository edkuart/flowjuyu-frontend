"use client";

import { Button } from "@/components/ui/button";
import { MapPin, MessageCircle, ShieldCheck, Store } from "lucide-react";
import Link from "next/link";

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
  ubicacion,
}: {
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
  ubicacion?: string;
}) {
  const precioNumber = Number(precio || 0);

  const showWhatsapp =
    !!sellerWhatsapp &&
    sellerPlan === "founder" &&
    sellerPlanActivo === true;

  async function handleWhatsappClick() {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/intentions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          seller_id: sellerId,
          source: "product_whatsapp",
        }),
      });
    } catch {}
    const mensaje = `Hola 👋\n\nEstoy interesado en el producto "${nombre}" que vi en Flowjuyu.\n\n¿Sigue disponible?`;
    window.open(
      `https://wa.me/${sellerWhatsapp}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  }

  function scrollToReviews() {
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="space-y-5">

      {/* ── BADGES ── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wide">
          🧵 Hecho a mano
        </span>
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-[11px] font-bold px-3 py-1 rounded-full border border-green-200 uppercase tracking-wide">
          <ShieldCheck className="w-3 h-3" />
          Tienda verificada
        </span>
        {ubicacion && (
          <span className="inline-flex items-center gap-1 text-neutral-500 text-xs">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {ubicacion}
          </span>
        )}
      </div>

      {/* ── TITLE ── */}
      <h1 className="text-3xl font-bold text-neutral-900 leading-tight">
        {nombre}
      </h1>

      {/* ── RATING ── */}
      {rating_count > 0 ? (
        <button
          onClick={scrollToReviews}
          className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
          aria-label="Ver reseñas"
        >
          <div className="flex text-yellow-400 text-base leading-none">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < Math.round(rating_avg) ? "★" : "☆"}</span>
            ))}
          </div>
          <span className="text-sm text-neutral-600 group-hover:underline">
            {rating_avg.toFixed(1)} ·{" "}
            {rating_count === 1 ? "1 reseña" : `${rating_count} reseñas`}
          </span>
        </button>
      ) : (
        <button
          onClick={scrollToReviews}
          className="text-sm text-neutral-400 hover:text-neutral-600 hover:underline text-left transition-colors"
        >
          Sin reseñas todavía — ¡Sé el primero en opinar!
        </button>
      )}

      {/* ── PRICE — brand color, prominent ── */}
      <div>
        <p className="text-4xl font-black text-[#0F3D3A] tracking-tight">
          Q{precioNumber.toFixed(2)}
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          Precio directo del artesano · Sin intermediarios
        </p>
      </div>

      {/* ── DESCRIPTION ── */}
      <div className="space-y-3">
        <p className="text-neutral-600 leading-relaxed text-[15px]">
          {descripcion || "Sin descripción disponible."}
        </p>

        {/* Cultural micro-story */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-lg flex-shrink-0 mt-0.5">🎨</span>
          <p className="text-sm text-amber-800 leading-relaxed">
            Cada pieza es única, elaborada a mano por artesanos guatemaltecos.
            Al adquirirla apoyas directamente a una familia y preservas una
            técnica ancestral.
          </p>
        </div>
      </div>

      {/* ── CTAs ── */}
      <div className="space-y-2.5 pt-1">

        {/* Primary — contact artisan */}
        {showWhatsapp ? (
          <Button
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-md shadow-green-100 gap-2"
            onClick={handleWhatsappClick}
          >
            <MessageCircle className="w-5 h-5" />
            Contactar artesano
          </Button>
        ) : sellerId ? (
          <Link href={`/store/${sellerId}`} className="block">
            <Button className="w-full h-12 bg-[#0F3D3A] hover:bg-[#0C2F2C] text-white font-bold text-base shadow-md gap-2">
              <Store className="w-5 h-5" />
              Contactar artesano
            </Button>
          </Link>
        ) : null}

        {/* Secondary — view store */}
        {sellerId && (
          <Link href={`/store/${sellerId}`} className="block">
            <Button
              variant="outline"
              className="w-full h-11 font-semibold border-neutral-200 text-neutral-700 hover:border-neutral-400 transition-colors"
            >
              Ver tienda completa
            </Button>
          </Link>
        )}

        {showWhatsapp && (
          <p className="text-xs text-center text-neutral-400">
            Responde generalmente en menos de 24 horas
          </p>
        )}
      </div>

      {/* ── TRUST SIGNALS — clean list, no heavy containers ── */}
      <ul className="pt-3 border-t border-neutral-100 space-y-1.5">
        {[
          "Artesano guatemalteco verificado",
          "Pieza única, no fabricada en serie",
          "Contacto directo con quien lo hizo",
          "Materiales y técnicas tradicionales",
        ].map((text) => (
          <li key={text} className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="text-green-500 font-bold flex-shrink-0">✔</span>
            {text}
          </li>
        ))}
      </ul>

    </section>
  );
}
