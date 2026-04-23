"use client"

import type { ReactNode } from "react"
import { BaseCard } from "@/components/ui/BaseCard"
import { SellerPanelHeader } from "@/components/seller/ui/SellerPrimitives"
import { cn } from "@/lib/utils"

type SellerSectionCardProps = {
  title: string
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export function SellerSectionCard({
  title,
  children,
  className,
  bodyClassName,
}: SellerSectionCardProps) {
  return (
    <BaseCard
      padding="none"
      className={cn(
        "seller-surface-card overflow-hidden",
        className,
      )}
    >
      <SellerPanelHeader
        title={
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--seller-soft-text)]">
            {title}
          </p>
        }
        className="bg-[var(--seller-panel)] px-6 py-4"
      />
      <div className={cn("p-6 md:p-8", bodyClassName)}>{children}</div>
    </BaseCard>
  )
}

export function SellerSectionHeading({ children }: { children: ReactNode }) {
  return (
    <p className="border-b border-[var(--seller-line)] bg-[var(--seller-panel-soft)] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--seller-soft-text)]">
      {children}
    </p>
  )
}

type SellerInfoRowProps = {
  label: string
  children: ReactNode
  className?: string
}

export function SellerInfoRow({
  label,
  children,
  className,
}: SellerInfoRowProps) {
  return (
    <div
      className={cn(
        "grid items-start gap-3 border-b border-[var(--seller-line)] px-6 py-4 last:border-0 sm:grid-cols-[156px_1fr] sm:gap-5",
        className,
      )}
    >
      <span className="pt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--seller-muted)]">
        {label}
      </span>
      <div className="text-[15px] leading-relaxed text-[var(--seller-text)]">{children}</div>
    </div>
  )
}
