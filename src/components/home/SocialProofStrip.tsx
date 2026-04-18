// src/components/home/SocialProofStrip.tsx
// Cierra el journey del comprador con confianza.
// Usa proposiciones de valor verificables — no métricas infladas para demo.

"use client";

import { ShieldCheck, Heart, Leaf, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";
import type { LucideIcon } from "lucide-react";

type Pillar = {
  Icon: LucideIcon;
  title: string;
  description: string;
};

export default function SocialProofStrip() {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  const pillars: Pillar[] = [
    { Icon: ShieldCheck, title: tr("home.socialPillar1Title"), description: tr("home.socialPillar1Desc") },
    { Icon: Heart,       title: tr("home.socialPillar2Title"), description: tr("home.socialPillar2Desc") },
    { Icon: Leaf,        title: tr("home.socialPillar3Title"), description: tr("home.socialPillar3Desc") },
    { Icon: Sparkles,    title: tr("home.socialPillar4Title"), description: tr("home.socialPillar4Desc") },
  ];

  return (
    <section className="relative bg-[#0d2d20] py-14 md:py-20">
      {/* Top hairline */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4a853]/25 to-transparent" />
      {/* Bottom hairline */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-0 md:divide-x md:divide-white/10">
          {pillars.map(({ Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3.5 px-6">
              <span className="text-[#d4a853] transition-transform duration-500 hover:scale-110" aria-hidden>
                <Icon size={20} strokeWidth={1.4} />
              </span>
              <p className="font-serif italic text-white text-[21px] leading-tight max-w-[18ch]">
                {title}
              </p>
              <p className="text-[11.5px] text-white/45 leading-relaxed max-w-[22ch]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
