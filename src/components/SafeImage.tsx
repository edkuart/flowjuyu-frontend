"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface Props {
  src?: string | null;
  fallback: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function SafeImage({
  src,
  fallback,
  alt,
  width,
  height,
  className
}: Props) {

  const [current, setCurrent] = useState(fallback);

  useEffect(() => {
    if (!src || src === "null" || src === "undefined") {
      setCurrent(fallback);
      return;
    }

    // FIX TS error: use HTMLImageElement instead of Image()
    const test = new window.Image() as HTMLImageElement;
    test.src = src;

    test.onload = () => setCurrent(src);
    test.onerror = () => setCurrent(fallback);
  }, [src, fallback]);

  return (
    <Image
      src={current}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}
