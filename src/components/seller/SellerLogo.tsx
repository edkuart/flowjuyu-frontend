// src/components/seller/SellerLogo.tsx
// Reusable circular seller logo for hero sections.
// Uses next/image with fill + object-cover for consistent rendering across
// /store/[id], /seller/my-business, and any other seller-facing page.

import Image from "next/image"
import { cn } from "@/lib/utils"

const SIZE: Record<string, string> = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-24 h-24 md:w-36 md:h-36",
}

interface SellerLogoProps {
  src?:       string | null
  alt:        string
  /** sm = 64px · md = 96px · lg = 96/144px responsive  (default: lg) */
  size?:      "sm" | "md" | "lg"
  className?: string
}

export function SellerLogo({ src, alt, size = "lg", className }: SellerLogoProps) {
  const initials = alt.trim().charAt(0).toUpperCase() || "?"

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden shrink-0 bg-white",
        "border-4 border-white/30 ring-2 ring-white/15 shadow-2xl",
        SIZE[size],
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover scale-105"
          sizes="(max-width: 768px) 96px, 144px"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-white/10 text-white/60 font-bold text-xl select-none">
          {initials}
        </div>
      )}
    </div>
  )
}
