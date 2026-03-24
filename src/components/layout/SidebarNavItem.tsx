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
};

export function SidebarNavItem({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
  badge,
}: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        // base — shared across all variants
        "group flex items-center gap-2.5 px-3 py-2 rounded-lg",
        "text-sm font-medium transition-colors duration-150",
        // left accent border — subtle active indicator
        "border-l-2",
        isActive
          ? "bg-primary/10 text-primary font-semibold border-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 shrink-0",
          isActive
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge}
    </Link>
  );
}
