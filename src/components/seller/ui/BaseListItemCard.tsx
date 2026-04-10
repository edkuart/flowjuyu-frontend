import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BaseCard } from "@/components/ui/BaseCard";

type BaseListItemCardProps = {
  id?: string;
  expanded?: boolean;
  onToggle?: () => void;
  media?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
};

export function BaseListItemCard({
  id,
  expanded = false,
  onToggle,
  media,
  title,
  subtitle,
  badges,
  trailing,
  children,
  className,
  headerClassName,
  bodyClassName,
}: BaseListItemCardProps) {
  const HeaderTag = onToggle ? "button" : "div";

  return (
    <BaseCard
      id={id}
      padding="none"
      className={cn(
        "overflow-hidden",
        expanded ? "border-primary/20" : "border-neutral-200",
        className
      )}
    >
      <HeaderTag
        type={onToggle ? "button" : undefined}
        onClick={onToggle}
        aria-expanded={onToggle ? expanded : undefined}
        className={cn(
          "flex w-full flex-col gap-3 p-4 text-left transition-colors sm:p-5 md:flex-row md:items-start md:justify-between",
          onToggle
            ? expanded
              ? "bg-muted/40"
              : "cursor-pointer hover:bg-muted/20 md:hover:bg-muted/30"
            : "",
          headerClassName
        )}
      >
        {media}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="min-w-0">{title}</div>
          {subtitle}
          {badges}
        </div>

        {trailing && (
          <div className="flex items-center justify-end md:flex-shrink-0 md:items-start md:pt-0.5">
            {trailing}
          </div>
        )}
      </HeaderTag>

      {expanded && children && (
        <div
          className={cn(
            "border-t border-border bg-muted/30 px-4 py-4 sm:px-5",
            bodyClassName
          )}
        >
          {children}
        </div>
      )}
    </BaseCard>
  );
}
