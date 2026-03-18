// src/components/product/WhatsAppModal.tsx
//
// Modal de pre-envío de WhatsApp.
//
// Flujo UX:
//   1. Usuario hace click en "Preguntar por esta pieza"
//   2. Este modal abre — muestra la pieza + el mensaje que se enviará
//   3. El mensaje es editable (el usuario puede personalizarlo)
//   4. Al confirmar → registro de evento + apertura de WhatsApp
//   5. "Cancelar" cierra el modal sin acción
//
// Propósito de conversión:
//   - El usuario ve el mensaje antes de enviarlo → más confianza
//   - Puede personalizarlo → mayor tasa de respuesta del artesano
//   - La pantalla intermedia crea un momento de intención consciente
//     (no un click accidental que abre WhatsApp de golpe)

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ─── Props ───────────────────────────────────────────────── */

interface WhatsAppModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void;

  product: {
    nombre: string;
    precio: number;
    imagen?: string | null;
  };
  seller: {
    nombre: string | null;
  };

  initialMessage: string;
}

/* ─── Price formatter ─────────────────────────────────────── */

const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(n);

/* ─── Component ───────────────────────────────────────────── */

export default function WhatsAppModal({
  open,
  onClose,
  onConfirm,
  product,
  seller,
  initialMessage,
}: WhatsAppModalProps) {
  const [message, setMessage] = useState(initialMessage);
  const [imgError, setImgError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sincronizar mensaje cuando el modal se abre (por si cambia el producto)
  useEffect(() => {
    if (open) {
      setMessage(initialMessage);
      // Focus en textarea después de la animación de apertura
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [open, initialMessage]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const imgSrc = !imgError && product.imagen ? product.imagen : null;

  return (
    /* ── Overlay ── */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Contactar al artesano por WhatsApp"
    >
      {/* Fondo oscuro */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      {/* Card — sube desde abajo en mobile, centrado en desktop */}
      <div className="
        relative z-10 w-full sm:max-w-sm
        bg-white rounded-t-2xl sm:rounded-sm
        overflow-hidden
        shadow-2xl
      ">

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-[#0d2d20]/8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.30em] text-[#0d0d0b]/35 mb-1">
                Antes de ir a WhatsApp
              </p>
              <h2 className="font-serif italic text-[18px] text-[#0d0d0b] leading-tight">
                Confirma tu mensaje
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#0d0d0b]/30 hover:text-[#0d0d0b]/70 transition mt-[2px]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Producto ── */}
        <div className="px-6 py-4 flex items-center gap-4 bg-[#f6f2ea]/50">
          {/* Thumbnail */}
          <div className="w-14 h-14 flex-shrink-0 rounded-sm overflow-hidden bg-[#ede8e0]">
            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={product.nombre}
                width={56}
                height={56}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-[#d8d0c4]" />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="font-serif italic text-[14px] text-[#0d0d0b] leading-tight line-clamp-2">
              {product.nombre}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-[12px] font-semibold text-[#0d2d20]">
                {formatPrice(product.precio)}
              </p>
              {seller.nombre && (
                <span className="text-[10px] text-[#0d0d0b]/35 truncate">
                  · {seller.nombre}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Mensaje editable ── */}
        <div className="px-6 py-4 space-y-2">
          <label
            htmlFor="wa-message"
            className="block text-[10px] uppercase tracking-[0.25em] text-[#0d0d0b]/40"
          >
            Tu mensaje al artesano
          </label>
          <textarea
            id="wa-message"
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="
              w-full text-[13px] text-[#0d0d0b]/80 leading-relaxed
              border border-[#0d2d20]/12 rounded-sm
              px-3 py-3 resize-none
              focus:outline-none focus:border-[#0d2d20]/35
              bg-white placeholder:text-[#0d0d0b]/25
              transition-colors
            "
          />
          <p className="text-[10px] text-[#0d0d0b]/30 leading-relaxed">
            Puedes editar el mensaje antes de enviarlo.
          </p>
        </div>

        {/* ── CTAs ── */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={() => onConfirm(message)}
            disabled={!message.trim()}
            className="
              w-full flex items-center justify-center gap-3
              bg-[#0d2d20] text-white
              text-[11px] uppercase tracking-[0.20em]
              py-4
              hover:bg-[#163a2b]
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors duration-200
            "
          >
            {/* WhatsApp icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Abrir WhatsApp
          </button>

          <button
            onClick={onClose}
            className="
              w-full text-center
              text-[10px] uppercase tracking-[0.22em]
              text-[#0d0d0b]/30 hover:text-[#0d0d0b]/60
              transition-colors py-1
            "
          >
            Cancelar
          </button>
        </div>

        {/* ── Nota informativa ── */}
        <div className="px-6 pb-5">
          <p className="text-[9px] text-[#0d0d0b]/25 text-center leading-relaxed">
            Se abrirá WhatsApp en una ventana nueva.
            El artesano responde directamente — sin intermediarios.
          </p>
        </div>

      </div>
    </div>
  );
}
