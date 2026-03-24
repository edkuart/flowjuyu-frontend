// src/components/ui/DashboardCard.tsx
//
// General-purpose content card for dashboard pages.
// Used across buyer, seller, and admin for stat panels,
// data sections, and any contained piece of page content.
//
// Two composition patterns:
//
//   1. Plain content wrapper (no header):
//   <DashboardCard>
//     <p>Content here</p>
//   </DashboardCard>
//
//   2. Titled section (with optional action):
//   <DashboardCard
//     title="Pedidos recientes"
//     description="Últimos 30 días"
//     action={<Button variant="ghost" size="sm">Ver todos</Button>}
//   >
//     <OrderList />
//   </DashboardCard>
//
// The title renders as <h2>, which inherits Playfair Display from the
// global heading rule — matching the brand typeface in all areas.

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type DashboardCardProps = {
  title?: string;
  description?: string;
  /** Right side of the card header — typically a ghost button or link. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Override padding on the content area only. */
  contentClassName?: string;
};

export function DashboardCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: DashboardCardProps) {
  const hasHeader = title || action;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card",
        // flowSoft shadow from tailwind.config — softer than shadow-sm, warmer feel
        "shadow-[0_4px_12px_rgba(0,0,0,0.04)]",
        className
      )}
    >
      {/* ── Card header — only rendered when title or action is present ── */}
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold text-foreground leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      {/* ── Card content ── */}
      <div className={cn("p-5", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
