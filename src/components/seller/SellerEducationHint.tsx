"use client"

import type { ReactNode } from "react"
import { Lightbulb } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
    <div className={cn("flex justify-start", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={title}
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2e22]/20",
              tone === "success"
                ? "border-emerald-200/70 bg-emerald-100/20 text-emerald-700 hover:bg-emerald-100/35"
                : "border-amber-200/70 bg-amber-100/15 text-amber-700 hover:bg-amber-100/30",
            )}
          >
            <Lightbulb className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="start"
          className="z-[80] w-[260px] rounded-2xl border border-amber-200/80 bg-white p-3 shadow-[0_18px_50px_-20px_rgba(15,46,34,0.35)]"
        >
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-neutral-900">{title}</p>
            <div className="text-[11px] leading-relaxed text-neutral-600">
              {children}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
