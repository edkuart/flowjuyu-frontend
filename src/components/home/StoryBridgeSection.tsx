"use client";

import Link from "next/link";

import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";

export default function StoryBridgeSection() {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  return (
    <section className="relative overflow-hidden bg-[#0d2d20] py-24 md:py-32">
      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Radial amber glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: "radial-gradient(60% 50% at 50% 50%, rgba(212,168,83,0.10), transparent 70%)" }}
        aria-hidden
      />
      {/* Woven accent bars */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4a853]/55 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4a853]/35 to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-12">
        <div className="mb-10 flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-white/15" />
          <span className="text-[10px] text-[#d4a853]/60">✦</span>
          <div className="h-px w-12 bg-white/15" />
        </div>

        <blockquote>
          <p className="font-serif text-[28px] leading-[1.15] tracking-[-0.01em] text-white italic md:text-[40px] lg:text-[48px]">
            {tr("home.storyQuoteLine1")}
            <br className="hidden md:block" /> {tr("home.storyQuoteLine2")}
          </p>
        </blockquote>

        <p className="mx-auto mt-6 max-w-[42ch] text-[13px] leading-relaxed text-white/40 md:text-[15px]">
          {tr("home.storyDescription")}
        </p>

        <div className="mt-10">
          <Link
            href="/productos"
            className="inline-flex items-center gap-3 border-b border-white/15 pb-[3px] text-[10px] tracking-[0.30em] text-white/50 uppercase transition-colors duration-300 hover:border-white/40 hover:text-white/90"
          >
            {tr("home.storyLink")}
            <svg
              width="14"
              height="8"
              viewBox="0 0 14 8"
              fill="none"
              aria-hidden
            >
              <path
                d="M0 4H12M9 1L12.5 4L9 7"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="h-px w-8 bg-white/10" />
          <span className="text-[9px] tracking-[0.3em] text-white/15 uppercase">
            {tr("home.storyFooter")}
          </span>
          <div className="h-px w-8 bg-white/10" />
        </div>
      </div>
    </section>
  );
}
