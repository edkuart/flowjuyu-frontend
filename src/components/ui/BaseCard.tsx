import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type BaseCardProps = {
  id?: string
  children: ReactNode
  className?: string
  contentClassName?: string
  hover?: boolean
  padding?: "none" | "sm" | "md" | "lg"
  tone?: "default" | "subtle"
}

const PADDING: Record<NonNullable<BaseCardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
}

const TONE: Record<NonNullable<BaseCardProps["tone"]>, string> = {
  default: "border-neutral-200 bg-white",
  subtle: "border-neutral-200/80 bg-neutral-50/80",
}

export function BaseCard({
  id,
  children,
  className,
  contentClassName,
  hover = false,
  padding = "md",
  tone = "default",
}: BaseCardProps) {
  const needsWrapper = padding !== "none" || !!contentClassName

  return (
    <div
      id={id}
      className={cn(
        "rounded-3xl border shadow-sm",
        TONE[tone],
        hover && "transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      {needsWrapper ? (
        <div className={cn(PADDING[padding], contentClassName)}>{children}</div>
      ) : (
        children
      )}
    </div>
  )
}
