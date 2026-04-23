// src/components/layout/Container.tsx
//
// Single source of truth for horizontal layout constraints.
// Use this instead of repeating max-w-screen-xl mx-auto px-4 md:px-8 everywhere.
//
// Usage:
//   <Container>...</Container>
//   <Container as="section" className="py-16">...</Container>
//   <Container size="narrow">...</Container>

import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ElementType } from "react";

type ContainerSize = "default" | "narrow" | "wide";

const sizes: Record<ContainerSize, string> = {
  narrow: "max-w-3xl",       // ~768px  — article / form pages
  default: "max-w-screen-xl", // ~1280px — standard page content
  wide: "max-w-[1400px]",    // ~1400px — full dashboard / landing
};

type ContainerProps<T extends ElementType = "div"> = {
  as?: T;
  size?: ContainerSize;
  className?: string;
  children: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "size" | "className" | "children">;

export function Container<T extends ElementType = "div">({
  as,
  size = "default",
  className,
  children,
  ...props
}: ContainerProps<T>) {
  const Tag = as ?? "div";

  return (
    <Tag
      className={cn(
        "mx-auto w-full px-6 md:px-6 lg:px-8",
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
