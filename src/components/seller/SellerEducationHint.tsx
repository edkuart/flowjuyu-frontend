"use client"

import type { ReactNode } from "react"
import { Lightbulb } from "lucide-react"

import { cn } from "@/lib/utils"

type SellerEducationHintProps = {
  title?: string
  children: ReactNode
  tone?: "default" | "success"
  className?: string
}

export function SellerEducationHint({
  title = "Tip Flowjuyu",
  children,
  tone = "default",
  className,
}: SellerEducationHintProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-3",
        tone === "success"
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-amber-200 bg-amber-50/80",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            tone === "success"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700",
          )}
        >
          <Lightbulb className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold text-neutral-900">{title}</p>
          <div className="text-xs leading-relaxed text-neutral-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
