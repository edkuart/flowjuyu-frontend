// src/components/ui/EmptyState.tsx
//
// Standardized empty state for lists, tables, and data sections.
// Replaces ad-hoc "no data" blocks scattered across buyer, seller, and admin.
//
// Usage:
//
//   — no action:
//   <EmptyState
//     icon={Package}
//     title="Sin pedidos aún"
//     description="Cuando realices tu primera compra, aparecerá aquí."
//   />
//
//   — with CTA:
//   <EmptyState
//     icon={Store}
//     title="Tu catálogo está vacío"
//     description="Añade tu primer producto para comenzar a vender."
//     action={
//       <Button asChild>
//         <Link href="/seller/products/new">Añadir producto</Link>
//       </Button>
//     }
//   />
//
//   — inside a DashboardCard (common pattern):
//   <DashboardCard title="Pedidos recientes">
//     <EmptyState icon={ShoppingCart} title="Sin pedidos" description="..." />
//   </DashboardCard>

import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

type EmptyStateProps = {
  /** Lucide icon component — rendered at w-5 h-5 inside a muted pill. */
  icon: ElementType;
  title: string;
  description: string;
  /** Optional CTA — typically a <Button> or <Button asChild><Link>. */
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "py-12 px-6",
        className
      )}
    >
      {/* Icon container — uses muted background so icon floats on any card surface */}
      <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-muted-foreground" aria-hidden />
      </div>

      {/* Title — h3 picks up Playfair from global heading rule */}
      <h3 className="text-sm font-semibold text-foreground">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-[28ch]">
        {description}
      </p>

      {/* CTA */}
      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}
