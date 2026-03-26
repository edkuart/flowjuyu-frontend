"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  src?: string | null;
  fallback: string;
  alt: string;
  sizes?: string;
  className?: string;
  fill?: boolean;
}

function isValidSrc(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string") return false;
  try {
    const { protocol } = new URL(url.trim());
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

export default function SafeImage({
  src,
  fallback,
  alt,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className = "object-cover",
  fill = true,
}: Props) {
  const resolved = isValidSrc(src) ? src.trim() : fallback;
  const [current, setCurrent] = useState(resolved);

  return (
    <Image
      src={current}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      onError={() => setCurrent(fallback)}
    />
  );
}
