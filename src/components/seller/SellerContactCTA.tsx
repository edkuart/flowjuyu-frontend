"use client";

import {
  ChevronRight,
  Hand,
  Leaf,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import WhatsAppModal from "@/components/product/WhatsAppModal";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";
import { LEGAL_WHATSAPP_NOTICE } from "@/lib/legal";
import { buildWhatsAppHref, extractWhatsAppPhone } from "@/lib/whatsapp";

export interface SellerContactCTAProps {
  whatsapp?: string | null;
  nombreComercio?: string | null;
  storeUrl?: string | null;
}

function fillTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template,
  );
}

export function SellerContactCTA({
  whatsapp,
  nombreComercio,
  storeUrl,
}: SellerContactCTAProps) {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const [modalOpen, setModalOpen] = useState(false);

  const cleanPhone = extractWhatsAppPhone(whatsapp);
  const hasWhatsapp = Boolean(cleanPhone);

  const buttonLabel = useMemo(() => {
    if (nombreComercio) {
      return fillTemplate(tr("seller.talkWithName"), { name: nombreComercio });
    }

    return tr("seller.talkWithArtisan");
  }, [nombreComercio, tr]);

  const initialMessage = useMemo(
    () =>
      fillTemplate(tr("seller.whatsappMessageTemplate"), {
        namePart: nombreComercio ? ` ${nombreComercio}` : "",
      }),
    [nombreComercio, tr],
  );

  const trustBadges = [
    { icon: Hand, label: tr("seller.badgeHandmade") },
    { icon: Leaf, label: tr("seller.badgeLocal") },
    { icon: ShieldCheck, label: tr("seller.badgeVerified") },
  ];

  return (
    <div className="space-y-3">
      {hasWhatsapp ? (
        <button
          onClick={() => setModalOpen(true)}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#16a34a] px-6 py-4 text-base font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#15803d] hover:shadow-xl active:translate-y-0 active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5 flex-shrink-0" />
          {buttonLabel}
        </button>
      ) : (
        <div className="flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-2xl border border-neutral-200 bg-neutral-100 px-6 py-4 text-base font-semibold text-neutral-400 select-none">
          <MessageCircle className="h-5 w-5 flex-shrink-0" />
          {buttonLabel}
        </div>
      )}

      {storeUrl && (
        <a
          href={storeUrl}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50"
        >
          {tr("seller.viewCatalog")}
          <ChevronRight className="h-4 w-4 text-neutral-400" />
        </a>
      )}

      <p className="text-center text-xs text-neutral-400">
        {hasWhatsapp
          ? tr("seller.fastReplyNoCommitment")
          : nombreComercio
            ? `${nombreComercio} — ${tr("seller.noWhatsapp")}`
            : tr("seller.noWhatsapp")}
      </p>

      <div className="grid grid-cols-3 gap-2 pt-1">
        {trustBadges.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-neutral-100 bg-neutral-50 px-2 py-3 text-center"
          >
            <Icon className="h-4 w-4 text-[#0F3D3A]" />
            <span className="text-[10px] leading-tight font-semibold text-neutral-600">
              {label}
            </span>
          </div>
        ))}
      </div>

      {hasWhatsapp && (
        <WhatsAppModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={(message) => {
            setModalOpen(false);
            const href = buildWhatsAppHref(cleanPhone ?? "", message);
            if (!href) return;
            window.open(href, "_blank", "noopener,noreferrer");
          }}
          seller={{ nombre: nombreComercio ?? null }}
          initialMessage={initialMessage}
          copy={{
            ariaLabel: tr("seller.whatsappModalAriaLabel"),
            title: tr("seller.whatsappModalTitle"),
            subtitle: tr("seller.whatsappModalSubtitle"),
            notice: LEGAL_WHATSAPP_NOTICE,
            messageLabel: tr("seller.whatsappModalMessageLabel"),
            hint: tr("seller.whatsappModalHint"),
            confirm: tr("seller.whatsappModalConfirm"),
            cancel: tr("seller.whatsappModalCancel"),
            footer: tr("seller.whatsappModalFooter"),
          }}
        />
      )}
    </div>
  );
}
