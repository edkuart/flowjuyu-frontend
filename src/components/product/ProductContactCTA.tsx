"use client";

import { useCallback, useMemo, useState } from "react";

import WhatsAppModal from "@/components/product/WhatsAppModal";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";
import {
  buildProductWhatsAppMessage,
  buildWhatsAppHref,
  extractWhatsAppPhone,
} from "@/lib/whatsapp";
import { LEGAL_WHATSAPP_NOTICE } from "@/lib/legal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://flowjuyu.com";

export interface ProductContactCTAProps {
  productId: string | number;
  productNombre: string;
  productPrecio?: number;
  productImagen?: string | null;
  internalCode?: string | null;
  productUrl?: string | null;
  sellerWhatsapp?: unknown;
  sellerNombre?: string | null;
  compact?: boolean;
}

const WA_ICON = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export function ProductContactCTA({
  productId,
  productNombre,
  productPrecio,
  productImagen,
  internalCode,
  productUrl,
  sellerWhatsapp,
  sellerNombre,
  compact = false,
}: ProductContactCTAProps) {
  const { dictionary, language } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const [modalOpen, setModalOpen] = useState(false);

  const cleanPhone = extractWhatsAppPhone(sellerWhatsapp);
  const hasPhone = Boolean(cleanPhone);

  const canonicalUrl = productUrl
    ? productUrl.startsWith("http")
      ? productUrl
      : `${SITE_URL}${productUrl}`
    : undefined;

  const message = useMemo(() => {
    return buildProductWhatsAppMessage({
      language,
      sellerName: sellerNombre,
      productName: productNombre,
      productCode: internalCode,
      productUrl: canonicalUrl,
    });
  }, [canonicalUrl, internalCode, language, productNombre, sellerNombre]);

  const buttonLabel = compact ? tr("pdp.stickyCta") : tr("pdp.askAboutPiece");

  const handleConfirm = useCallback(
    async (nextMessage: string) => {
      setModalOpen(false);

      try {
        await fetch(`${API_BASE}/api/intentions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productId,
            source: "product_whatsapp",
          }),
        });
      } catch {}

      const href = buildWhatsAppHref(cleanPhone ?? "", nextMessage);
      if (!href) return;

      window.open(href, "_blank", "noopener,noreferrer");
    },
    [cleanPhone, productId],
  );

  async function handleShare() {
    const shareUrl =
      canonicalUrl ??
      (typeof window !== "undefined" ? window.location.href : "");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: productNombre, url: shareUrl });
        return;
      } catch {}
    }
    const text = `${productNombre}${internalCode ? ` (${internalCode})` : ""} — ${shareUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <>
      {compact ? (
        <div className="w-full">
          {hasPhone ? (
            <button
              onClick={() => setModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d2d20] px-5 py-3 text-[11px] font-semibold tracking-[0.18em] text-white uppercase transition-colors duration-200 hover:bg-[#163a2b]"
            >
              {WA_ICON}
              {buttonLabel}
            </button>
          ) : (
            <div className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#0d2d20]/25 px-5 py-3 text-[11px] tracking-[0.18em] text-white/50 uppercase select-none">
              {WA_ICON}
              {buttonLabel}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          {hasPhone ? (
            <button
              onClick={() => setModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 bg-[#0d2d20] py-4 text-[11px] tracking-[0.18em] text-white uppercase transition-colors duration-200 hover:bg-[#163a2b]"
            >
              {WA_ICON}
              {buttonLabel}
            </button>
          ) : (
            <div className="flex w-full cursor-not-allowed items-center justify-center gap-2 bg-[#0d2d20]/25 py-4 text-[11px] tracking-[0.18em] text-white/50 uppercase select-none">
              {WA_ICON}
              {buttonLabel}
            </div>
          )}

          <button
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 border border-[#0d2d20]/20 py-3 text-[11px] tracking-[0.18em] text-[#0d2d20]/70 uppercase transition-colors duration-200 hover:bg-[#0d2d20]/5"
          >
            {tr("pdp.share")}
          </button>

          <p className="text-center text-[11px] tracking-wide text-[#0d0d0b]/40">
            {hasPhone ? tr("pdp.artisanResponds") : tr("pdp.noWhatsapp")}
          </p>
        </div>
      )}

      {hasPhone && (
        <WhatsAppModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirm}
          product={{
            nombre: productNombre,
            precio: productPrecio ?? 0,
            imagen: productImagen,
          }}
          seller={{ nombre: sellerNombre ?? null }}
          initialMessage={message}
          copy={{
            ariaLabel: tr("pdp.whatsappModalAriaLabel"),
            title: tr("pdp.whatsappModalTitle"),
            subtitle: language !== "es" ? tr("pdp.whatsappModalSubtitleBilingual") : tr("pdp.whatsappModalSubtitle"),
            notice: LEGAL_WHATSAPP_NOTICE,
            messageLabel: tr("pdp.whatsappModalMessageLabel"),
            hint: tr("pdp.whatsappModalHint"),
            confirm: tr("pdp.whatsappModalConfirm"),
            cancel: tr("pdp.whatsappModalCancel"),
            footer: tr("pdp.whatsappModalFooter"),
          }}
        />
      )}
    </>
  );
}
