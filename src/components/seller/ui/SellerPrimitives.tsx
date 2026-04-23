"use client"

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

type SellerSurfaceCardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "soft" | "muted"
}

export function SellerSurfaceCard({
  className,
  tone = "default",
  ...props
}: SellerSurfaceCardProps) {
  return (
    <div
      className={cn(
        tone === "soft"
          ? "seller-surface-soft"
          : tone === "muted"
            ? "seller-panel-subtle"
            : "seller-surface-card",
        className,
      )}
      {...props}
    />
  )
}

type SellerPanelHeaderProps = {
  icon?: ReactNode
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
  contentClassName?: string
}

export function SellerPanelHeader({
  icon,
  eyebrow,
  title,
  description,
  action,
  className,
  contentClassName,
}: SellerPanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-[var(--seller-line)] px-5 py-5",
        className,
      )}
    >
      <div className={cn("flex min-w-0 items-start gap-3", contentClassName)}>
        {icon ? (
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[var(--seller-radius-xl)] border border-[var(--seller-line)] bg-[color:color-mix(in_srgb,var(--seller-accent)_7%,white)] text-[var(--seller-accent)]">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 space-y-1">
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--seller-faint-text)]">
              {eyebrow}
            </p>
          ) : null}
          <div className="text-sm font-semibold text-[var(--seller-ink)]">{title}</div>
          {description ? (
            <p className="text-sm leading-6 text-[var(--seller-muted)]">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="flex flex-shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  )
}

export function SellerIconBadge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-[var(--seller-radius-xl)] border border-[color:color-mix(in_srgb,var(--seller-accent)_10%,transparent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)] text-[var(--seller-accent)]",
        className,
      )}
    >
      {children}
    </span>
  )
}

type SellerDetailPanelProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
}

export function SellerDetailPanel({
  icon,
  title,
  description,
  className,
  children,
  ...props
}: SellerDetailPanelProps) {
  return (
    <div
      className={cn("seller-surface-card p-5", className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        {icon ? <SellerIconBadge>{icon}</SellerIconBadge> : null}
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-[var(--seller-ink)]">{title}</p>
          {description ? (
            <p className="text-xs leading-relaxed text-[var(--seller-muted)]">{description}</p>
          ) : null}
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}

type SellerPillProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "success" | "warning" | "danger" | "info" | "neutral"
}

const sellerPillToneClasses: Record<NonNullable<SellerPillProps["tone"]>, string> = {
  default:
    "border-[color:color-mix(in_srgb,var(--seller-accent)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_7%,white)] text-[var(--seller-accent)]",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700",
  danger:
    "border-red-200 bg-red-50 text-red-700",
  info:
    "border-blue-200 bg-blue-50 text-blue-700",
  neutral:
    "border-[var(--seller-line)] bg-[var(--seller-panel-soft)] text-[var(--seller-muted)]",
}

export function SellerPill({
  className,
  tone = "default",
  ...props
}: SellerPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        sellerPillToneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}

type SellerActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "glass" | "neutral"
}

export function SellerActionButton({
  className,
  tone = "primary",
  type = "button",
  ...props
}: SellerActionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--seller-radius-md)] px-4 py-2.5 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60",
        tone === "glass"
          ? "seller-button-glass"
          : tone === "neutral"
            ? "border border-[var(--seller-line)] bg-[var(--seller-panel)] text-[var(--seller-text)] hover:border-[var(--seller-line-strong)] hover:text-[var(--seller-ink)]"
            : "seller-button-primary",
        className,
      )}
      {...props}
    />
  )
}
