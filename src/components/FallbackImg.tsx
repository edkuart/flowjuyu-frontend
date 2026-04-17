"use client";

import { useEffect, useState } from "react";

interface Props {
  src?: string | null;
  fallback: string;
  alt: string;
  className?: string;
}

function resolveImageSrc(src: string | null | undefined, fallback: string): string {
  if (!src || typeof src !== "string") return fallback;

  const value = src.trim();
  if (!value) return fallback;

  if (value.startsWith("/")) return value;

  try {
    const { protocol } = new URL(value);
    if (protocol !== "http:" && protocol !== "https:") return fallback;
    return value;
  } catch {
    return fallback;
  }
}

export default function FallbackImg({
  src,
  fallback,
  alt,
  className,
}: Props) {
  const [current, setCurrent] = useState(resolveImageSrc(src, fallback));

  // Sync when src changes (e.g. active seller switch in SellerHighlightSection).
  // Without this, useState keeps the initial URL and shows the wrong image
  // while the name/location already updated — the "mixed seller" bug.
  useEffect(() => {
    setCurrent(resolveImageSrc(src, fallback));
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
