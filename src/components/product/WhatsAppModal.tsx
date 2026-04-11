"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface WhatsAppModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void;
  product?: {
    nombre: string;
    precio: number;
    imagen?: string | null;
  };
  seller: {
    nombre: string | null;
    imagen?: string | null;
  };
  initialMessage: string;
  copy: {
    ariaLabel: string;
    title: string;
    subtitle: string;
    notice: string;
    messageLabel: string;
    hint: string;
    confirm: string;
    cancel: string;
    footer: string;
  };
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(n);

export default function WhatsAppModal({
  open,
  onClose,
  onConfirm,
  product,
  seller,
  initialMessage,
  copy,
}: WhatsAppModalProps) {
  const [message, setMessage] = useState(initialMessage);
  const [imgError, setImgError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;

    setMessage(initialMessage);
    const timeoutId = window.setTimeout(
      () => textareaRef.current?.focus(),
      150,
    );
    return () => window.clearTimeout(timeoutId);
  }, [open, initialMessage]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const visualSrc = !imgError ? product?.imagen || seller.imagen || null : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-0 sm:items-center sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label={copy.ariaLabel}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative z-10 w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-sm sm:rounded-sm">
        <div className="border-b border-[#0d2d20]/8 px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[9px] tracking-[0.30em] text-[#0d0d0b]/35 uppercase">
                WhatsApp
              </p>
              <h2 className="font-serif text-[18px] leading-tight text-[#0d0d0b] italic">
                {copy.title}
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[#0d0d0b]/45">
                {copy.subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label={copy.cancel}
              className="mt-[2px] flex h-8 w-8 flex-shrink-0 items-center justify-center text-[#0d0d0b]/30 transition hover:text-[#0d0d0b]/70"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#f6f2ea]/50 px-6 py-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm bg-[#ede8e0]">
            {visualSrc ? (
              <Image
                src={visualSrc}
                alt={product?.nombre ?? seller.nombre ?? "Flowjuyu"}
                width={56}
                height={56}
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="h-full w-full bg-[#d8d0c4]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-serif text-[14px] leading-tight text-[#0d0d0b] italic">
              {product?.nombre ?? seller.nombre ?? "Flowjuyu"}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              {product ? (
                <p className="text-[12px] font-semibold text-[#0d2d20]">
                  {formatPrice(product.precio)}
                </p>
              ) : null}
              {seller.nombre ? (
                <span className="truncate text-[10px] text-[#0d0d0b]/35">
                  {product ? `· ${seller.nombre}` : seller.nombre}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-2 px-6 py-4">
          <div className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-[11px] leading-relaxed text-amber-900/85">
              {copy.notice}
            </p>
          </div>
          <label
            htmlFor="wa-message"
            className="block text-[10px] tracking-[0.25em] text-[#0d0d0b]/40 uppercase"
          >
            {copy.messageLabel}
          </label>
          <textarea
            id="wa-message"
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-sm border border-[#0d2d20]/12 bg-white px-3 py-3 text-[13px] leading-relaxed text-[#0d0d0b]/80 transition-colors placeholder:text-[#0d0d0b]/25 focus:border-[#0d2d20]/35 focus:outline-none"
          />
          <p className="text-[10px] leading-relaxed text-[#0d0d0b]/30">
            {copy.hint}
          </p>
        </div>

        <div className="space-y-3 px-6 pb-6">
          <button
            onClick={() => onConfirm(message)}
            disabled={!message.trim()}
            className="flex w-full items-center justify-center gap-3 bg-[#0d2d20] py-4 text-[11px] tracking-[0.20em] text-white uppercase transition-colors duration-200 hover:bg-[#163a2b] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {copy.confirm}
          </button>

          <button
            onClick={onClose}
            className="w-full py-1 text-center text-[10px] tracking-[0.22em] text-[#0d0d0b]/30 uppercase transition-colors hover:text-[#0d0d0b]/60"
          >
            {copy.cancel}
          </button>
        </div>

        <div className="px-6 pb-5">
          <p className="text-center text-[9px] leading-relaxed text-[#0d0d0b]/25">
            {copy.footer}
          </p>
        </div>
      </div>
    </div>
  );
}
