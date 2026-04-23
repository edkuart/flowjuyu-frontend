"use client"

import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PageBackNavProps = {
  label?: string
  onClick: () => void
  className?: string
  variant?: "minimal" | "panel"
  meta?: ReactNode
  title?: ReactNode
  trailing?: ReactNode
}

export function PageBackNav({
  label = "Volver",
  onClick,
  className,
  variant = "minimal",
  meta,
  title,
  trailing,
}: PageBackNavProps) {
  if (variant === "panel") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-[var(--seller-line)] bg-[var(--seller-white-soft)] px-3 py-3 shadow-[var(--seller-shadow-panel)] backdrop-blur-xl sm:px-4",
          className,
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          aria-label={label}
          className="h-10 w-10 flex-shrink-0 rounded-2xl border border-[var(--seller-line)] bg-white/80 text-[var(--seller-soft-text)] transition-all duration-150 hover:bg-[var(--seller-panel-soft)] hover:text-[var(--seller-text)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {(meta || title) && (
          <div className="min-w-0 flex-1">
            {meta ? (
              <p className="text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-[var(--seller-faint-text)]">
                {meta}
              </p>
            ) : null}
            {title ? <div className="mt-1 min-w-0">{title}</div> : null}
          </div>
        )}

        {trailing ? <div className="flex flex-shrink-0 items-center gap-2">{trailing}</div> : null}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-[#7f8b84] transition-colors hover:text-[#27332d]",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  )
}
