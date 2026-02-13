//src/components/ui/SectionHeader.tsx

import Link from "next/link";
import React from "react";

type Props = {
  eyebrow?: string;      // texto pequeño arriba
  title: string;         // título principal
  linkHref?: string;     // si tiene "Ver más"
  linkLabel?: string;    // texto del link
};

export default function SectionHeader({
  eyebrow,
  title,
  linkHref,
  linkLabel,
}: Props): React.ReactElement {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div className="space-y-2">
        {eyebrow && (
          <p className="text-sm uppercase tracking-widest text-orange-600 font-semibold">
            {eyebrow}
          </p>
        )}

        <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900">
          {title}
        </h2>
      </div>

      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className="text-orange-600 font-medium hover:underline"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
