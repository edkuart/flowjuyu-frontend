// src/components/layout/SidebarNavItem.tsx
//
// Single nav item used across all authenticated sidebars.
// Encapsulates the unified active/inactive state so every area
// (buyer, seller, admin) expresses the same visual language
// without repeating the className logic three times.
//
// Usage:
//   <SidebarNavItem href="/seller/products" label="Productos" icon={Package} isActive={isActive} />
//
//   — with badge (admin numeric count):
//   <SidebarNavItem ... badge={<span className="...">{count}</span>} />
//
//   — with close handler (mobile sheet):
//   <SidebarNavItem ... onClick={() => setOpen(false)} />

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

type SidebarNavItemProps = {
  href: string;
  label: string;
  icon: ElementType;
  isActive: boolean;
  onClick?: () => void;
  /** Optional badge node — numeric count, "Pronto" pill, etc. */
  badge?: ReactNode;
  className?: string;
  labelClassName?: string;
  iconClassName?: string;
};

export function SidebarNavItem({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
  badge,
  className,
  labelClassName,
  iconClassName,
}: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        // base — shared across all variants
        "group flex items-center gap-2.5 rounded-xl px-3 py-2.5",
        "border text-sm font-medium transition-all duration-150",
        isActive
          ? "border-primary/25 bg-primary/10 text-primary font-semibold shadow-[0_10px_24px_-20px_rgba(15,23,42,0.35)]"
          : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 shrink-0",
          isActive
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground",
          iconClassName,
        )}
      />
      <span className={cn("flex-1 truncate", labelClassName)}>{label}</span>
      {badge}
    </Link>
  );
}
