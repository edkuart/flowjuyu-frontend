"use client";

import type { ElementType, ReactNode, RefObject } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function StudioBadge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "success" | "warning";
}) {
  const toneClass = {
    default: "border-[var(--seller-line)] bg-white text-[var(--seller-muted)]",
    accent:
      "border-[color:color-mix(in_srgb,var(--seller-accent)_22%,white)] bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)] text-[var(--seller-accent)]",
    success: "border-emerald-100 bg-emerald-50 text-emerald-700",
    warning: "border-amber-100 bg-amber-50 text-amber-700",
  }[tone];

  return (
    <span className={`inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-5 ${toneClass}`}>
      <span className="truncate">{children}</span>
    </span>
  );
}

export function StudioSection({
  refObject,
  icon: Icon,
  title,
  subtitle,
  open,
  onToggle,
  children,
  action,
}: {
  refObject?: RefObject<HTMLDivElement | null>;
  icon: ElementType;
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      ref={refObject}
      className="scroll-mt-4 overflow-hidden rounded-[16px] border border-[var(--seller-line)] bg-white shadow-[var(--seller-shadow-panel)]"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition hover:bg-[var(--seller-panel)]"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)] text-[var(--seller-accent)]">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-[var(--seller-ink)]">
              {title}
            </p>
            {subtitle && (
              <p className="truncate text-[10px] leading-tight text-[var(--seller-faint-text)]">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          {open ? (
            <ChevronUp className="h-4 w-4 text-[var(--seller-faint-text)]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--seller-faint-text)]" />
          )}
        </div>
      </button>
      {open && <div className="border-t border-[var(--seller-line)] p-3.5 sm:p-4">{children}</div>}
    </div>
  );
}
