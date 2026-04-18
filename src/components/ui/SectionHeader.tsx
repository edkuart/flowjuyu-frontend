// src/components/ui/SectionHeader.tsx

import Link from "next/link";

type Props = {
  eyebrow?: string;
  title: string;
  linkHref?: string;
  linkLabel?: string;
  dark?: boolean;
};

export default function SectionHeader({
  eyebrow,
  title,
  linkHref,
  linkLabel,
  dark = false,
}: Props) {

  const eyebrowColor = dark
    ? "text-white/60"
    : "text-[#0d2d20] opacity-80";

  const titleColor = dark
    ? "text-white"
    : "text-neutral-900";

  const linkColor = dark
    ? "text-white/70 hover:text-white"
    : "text-[#0d2d20] hover:opacity-70";

  const lineGradient = dark
    ? "from-white/40 via-[#d97706] to-white/40"
    : "from-[#0d2d20] via-[#d97706] to-[#0d2d20]";

  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">

      <div className="space-y-4">

        {eyebrow && (
          <p className={`text-[10px] font-medium uppercase tracking-[0.28em] ${eyebrowColor}`}>
            <span className="text-[#d4a853] mr-2" aria-hidden>✦</span>
            {eyebrow}
          </p>
        )}

        <h2 className={`font-serif italic text-[2rem] md:text-[2.75rem] leading-[1.05] tracking-[-0.02em] ${titleColor}`}>
          {title}
        </h2>

        {/* Línea cultural elegante */}
        <div
          className={`h-[2px] w-16 bg-gradient-to-r ${lineGradient} rounded-full`}
        />

      </div>

      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] transition-colors ${linkColor}`}
        >
          {linkLabel}
          <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
        </Link>
      )}

    </div>
  );
}