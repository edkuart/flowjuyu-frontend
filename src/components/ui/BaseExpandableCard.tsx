"use client"

import { useId, useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { BaseCard } from "./BaseCard"

type BaseExpandableCardProps = {
  title: string
  summary?: string
  children: ReactNode
  isExpanded?: boolean
  expanded?: boolean
  defaultExpanded?: boolean
  onToggle?: () => void
  className?: string
  bodyClassName?: string
}

export function BaseExpandableCard({
  title,
  summary,
  children,
  isExpanded,
  expanded,
  defaultExpanded = false,
  onToggle,
  className,
  bodyClassName,
}: BaseExpandableCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const controlledExpanded = isExpanded ?? expanded
  const isControlled = controlledExpanded !== undefined
  const open = isControlled ? controlledExpanded : internalExpanded
  const contentId = useId()

  function handleToggle() {
    if (!isControlled) setInternalExpanded((prev) => !prev)
    onToggle?.()
  }

  return (
    <BaseCard hover padding="none" className={className}>
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left sm:px-5"
      >
        <div className="min-w-0 space-y-1.5">
          <h3 className="text-base font-semibold leading-snug text-neutral-900">
            {title}
          </h3>
          {summary && (
            <p className="text-sm leading-relaxed text-neutral-600">
              {summary}
            </p>
          )}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-50">
          <ChevronDown
            className={cn(
              "h-4 w-4 text-neutral-500 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </span>
      </button>

      {open && (
        <div
          id={contentId}
          className={cn("px-3 pb-3 sm:px-4 sm:pb-4", bodyClassName)}
        >
          {children}
        </div>
      )}
    </BaseCard>
  )
}
