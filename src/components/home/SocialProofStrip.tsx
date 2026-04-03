// src/components/home/SocialProofStrip.tsx
// Cierra el journey del comprador con confianza.
// Usa proposiciones de valor verificables — no métricas infladas para demo.

"use client";

import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";

export default function SocialProofStrip() {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  const pillars = [
    { icon: "✦", title: tr("home.socialPillar1Title"), description: tr("home.socialPillar1Desc") },
    { icon: "✦", title: tr("home.socialPillar2Title"), description: tr("home.socialPillar2Desc") },
    { icon: "✦", title: tr("home.socialPillar3Title"), description: tr("home.socialPillar3Desc") },
    { icon: "✦", title: tr("home.socialPillar4Title"), description: tr("home.socialPillar4Desc") },
  ];

  return (
    <section className="bg-[#0d2d20] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-white/10">
          {pillars.map(({ icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3 px-6">
              <span className="text-[#d4a853] text-xs" aria-hidden>
                {icon}
              </span>
              <p className="font-serif italic text-white text-lg leading-tight">
                {title}
              </p>
              <p className="text-[11px] text-white/40 leading-relaxed max-w-[160px]">
                {description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
