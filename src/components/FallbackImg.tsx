"use client";

import { useEffect, useState } from "react";

interface Props {
  src?: string | null;
  fallback: string;
  alt: string;
  className?: string;
}

export default function FallbackImg({
  src,
  fallback,
  alt,
  className,
}: Props) {
  const [current, setCurrent] = useState(src || fallback);

  // Sync when src changes (e.g. active seller switch in SellerHighlightSection).
  // Without this, useState keeps the initial URL and shows the wrong image
  // while the name/location already updated — the "mixed seller" bug.
  useEffect(() => {
    setCurrent(src || fallback);
  }, [src, fallback]);

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      onError={() => setCurrent(fallback)}
      loading="lazy"
    />
  );
}
