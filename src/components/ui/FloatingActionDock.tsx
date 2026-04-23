"use client";

import type { ComponentType } from "react";
import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

type DockAction = {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  active?: boolean;
};

type Props = {
  actions: DockAction[];
  className?: string;
  maxVisible?: number;
  compact?: boolean;
  variant?: "editorial" | "buyer";
};

export function FloatingActionDock({
  actions,
  className,
  maxVisible = 6,
  compact = false,
  variant = "editorial",
}: Props) {
  const visibleActions = actions.slice(0, maxVisible);
  const hasOverflow = actions.length > maxVisible;

  return (
    <div
      className={cn(
        variant === "buyer"
          ? compact
            ? "rounded-[22px] border border-neutral-200/80 bg-white/90 p-1.5 shadow-[0_16px_38px_rgba(15,23,42,0.12)] backdrop-blur-xl"
            : "rounded-[24px] border border-neutral-200/80 bg-white/92 p-2 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl"
          : compact
            ? "rounded-[22px] border border-[color:color-mix(in_srgb,var(--seller-accent)_10%,transparent)] bg-white/92 p-1.5 shadow-[0_16px_38px_rgba(15,61,58,0.14)] backdrop-blur-xl"
            : "rounded-[24px] border border-[color:color-mix(in_srgb,var(--seller-accent)_10%,transparent)] bg-white/94 p-2 shadow-[0_18px_45px_rgba(15,61,58,0.16)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {visibleActions.map(({ key, label, icon: Icon, onClick, active }) => (
          <button
            key={key}
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
              compact
                ? "flex min-w-[58px] flex-col items-center justify-center gap-1 rounded-[16px] px-2 py-2 text-[10px] font-semibold transition-all duration-150"
                : "flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-[18px] px-2.5 py-2 text-[10px] font-semibold transition-all duration-150",
              active
                ? variant === "buyer"
                  ? "bg-[#0f2e22] text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
                  : "bg-[var(--seller-accent)] text-white shadow-[0_10px_24px_rgba(15,61,58,0.2)]"
                : variant === "buyer"
                  ? "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                  : "text-[var(--seller-soft-text)] hover:bg-[var(--seller-panel)] hover:text-[var(--seller-ink)]",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="leading-none">{label}</span>
          </button>
        ))}

        {hasOverflow ? (
          <button
            type="button"
            className={cn(
              compact
                ? "flex min-w-[48px] flex-col items-center justify-center gap-1 rounded-[16px] px-2 py-2 text-[10px] font-semibold text-[var(--seller-soft-text)] transition-all duration-150 hover:bg-[var(--seller-panel)] hover:text-[var(--seller-ink)]"
                : "flex min-w-[52px] flex-col items-center justify-center gap-1 rounded-[18px] px-2.5 py-2 text-[10px] font-semibold text-[var(--seller-soft-text)] transition-all duration-150 hover:bg-[var(--seller-panel)] hover:text-[var(--seller-ink)]",
            )}
            aria-label="Mas acciones"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="leading-none">Mas</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
