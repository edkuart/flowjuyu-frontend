// src/components/ui/SectionHeader.tsx

import Link from "next/link";

type Props = {
  eyebrow?: string;
  title: string;
  linkHref?: string;
  linkLabel?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  linkHref,
  linkLabel,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">

      <div className="space-y-4">

        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#0d2d20] opacity-80">
            {eyebrow}
          </p>
        )}

        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 leading-tight">
          {title}
        </h2>

        {/* Línea cultural elegante */}
        <div className="h-[2px] w-16 bg-gradient-to-r from-[#0d2d20] via-[#d97706] to-[#0d2d20] rounded-full" />
      </div>

      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className="text-sm font-semibold text-[#0d2d20] tracking-wide hover:opacity-70 transition-opacity"
        >
          {linkLabel} →
        </Link>
      )}

    </div>
  );
}