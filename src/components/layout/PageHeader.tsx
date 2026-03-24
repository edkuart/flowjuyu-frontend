// src/components/layout/PageHeader.tsx
//
// Top-of-page heading block for all authenticated areas.
// Pairs a title + optional description on the left with an
// optional action area (buttons, links, menus) on the right.
//
// The title renders as <h1> — the global CSS rule in globals.css
// applies Playfair Display automatically to h1/h2/h3, so internal
// pages inherit the brand typeface without extra class noise.
//
// Usage:
//   — minimal:
//   <PageHeader title="Mis Pedidos" />
//
//   — with description:
//   <PageHeader title="Productos" description="Administra tu catálogo activo." />
//
//   — with action:
//   <PageHeader
//     title="Productos"
//     description="Administra tu catálogo activo."
//     action={<Button size="sm">Añadir producto</Button>}
//   />

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Right-aligned area — typically a primary CTA or action menu. */
  action?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        "mb-8 pb-6 border-b border-border",
        className
      )}
    >
      {/* Left: title + description */}
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Right: actions — shrink-0 prevents compression on small viewports */}
      {action && (
        <div className="shrink-0 flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}
