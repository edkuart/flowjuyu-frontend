"use client";

// src/components/product/view/ArtisanStory.tsx

import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";

type Props = {
  ubicacion?: string;
  nombreArtesano?: string;
};

export default function ArtisanStory({ ubicacion, nombreArtesano }: Props) {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  const origen = ubicacion || "Guatemala";
  const artesano = nombreArtesano || "artesanos guatemaltecos";

  const pillars = [
    { label: tr("pdp.pillarHandmade"),  body: tr("pdp.pillarHandmadeBody") },
    { label: tr("pdp.pillarDirect"),    body: tr("pdp.pillarDirectBody") },
    { label: tr("pdp.pillarAncestral"), body: tr("pdp.pillarAncestralBody") },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">

      <div className="space-y-6">
        <p className="text-[10px] uppercase tracking-[0.30em] text-[#0d2d20]/50">
          {tr("pdp.whyMatters")}
        </p>
        <h2 className="font-serif italic text-[28px] md:text-[36px] text-[#0d0d0b] leading-[1.1]">
          {tr("pdp.madeInLocation")} {origen}.
        </h2>
        <p className="text-[15px] text-[#0d0d0b]/60 leading-relaxed max-w-md">
          {tr("pdp.madeByArtisan")} {artesano}. {tr("pdp.madeByContext")}
        </p>
      </div>

      <div className="space-y-8">
        {pillars.map(({ label, body }) => (
          <div key={label} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-px bg-[#0d2d20]/40" />
              <p className="text-[11px] uppercase tracking-[0.26em] text-[#0d2d20] font-semibold">
                {label}
              </p>
            </div>
            <p className="text-[14px] text-[#0d0d0b]/55 leading-relaxed pl-7">
              {body}
            </p>
          </div>
        ))}
      </div>

    </section>
  );
}
