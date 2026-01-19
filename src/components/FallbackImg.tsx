"use client";

import { useState } from "react";

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
