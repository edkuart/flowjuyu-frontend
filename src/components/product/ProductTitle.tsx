"use client"

import { memo, useMemo } from "react"
import { buildProductTitle } from "@/lib/buildProductTitle"
import { cn } from "@/lib/utils"

type ProductTitleVariant = "editor" | "preview" | "list" | "compact"

type ProductTitleProps = {
  value: string
  variant?: ProductTitleVariant
  className?: string
}

const variantClasses: Record<
  Exclude<ProductTitleVariant, "compact">,
  {
    root: string
    main: string
    descriptor: string
  }
> = {
  editor: {
    root: "min-h-[2.75rem]",
    main: "line-clamp-1 text-lg font-bold leading-tight text-gray-900",
    descriptor: "mt-0.5 line-clamp-1 text-sm font-normal leading-snug text-gray-500",
  },
  preview: {
    root: "min-h-[2.35rem]",
    main: "line-clamp-1 text-[13px] font-semibold leading-snug text-gray-900",
    descriptor: "line-clamp-1 text-[11px] leading-snug text-gray-400",
  },
  list: {
    root: "min-h-[2.5rem]",
    main: "line-clamp-1 text-base font-semibold leading-tight text-foreground",
    descriptor: "mt-0.5 line-clamp-1 text-xs leading-snug text-muted-foreground",
  },
}

export const ProductTitle = memo(function ProductTitle({
  value,
  variant = "list",
  className,
}: ProductTitleProps) {
  const title = useMemo(() => buildProductTitle(value), [value])
  const fullTitle = title.raw
  const descriptor = title.descriptor || "Artesanía tradicional"

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "block truncate break-words text-sm font-medium leading-tight",
          className
        )}
        title={fullTitle}
      >
        {title.short}
      </span>
    )
  }

  const classes = variantClasses[variant]
  const RootTag = variant === "editor" ? "span" : "div"
  const MainTag = variant === "preview" ? "h2" : variant === "list" ? "h3" : "span"
  const DescriptorTag = variant === "editor" ? "span" : "p"

  return (
    <RootTag
      className={cn("block min-w-0 break-words", classes.root, className)}
      title={fullTitle}
    >
      <MainTag className={cn("block break-words", classes.main)}>
        {title.main}
      </MainTag>
      <DescriptorTag className={cn("block break-words", classes.descriptor)}>
        {descriptor}
      </DescriptorTag>
    </RootTag>
  )
})
