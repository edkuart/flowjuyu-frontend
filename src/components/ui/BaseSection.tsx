import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type BaseSectionProps = {
  children: ReactNode
  className?: string
}

export function BaseSection({ children, className }: BaseSectionProps) {
  return <section className={cn("space-y-4", className)}>{children}</section>
}
