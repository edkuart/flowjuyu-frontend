// src/components/layout/PageShell.tsx
//
// Single source of truth for authenticated content area spacing.
// Replaces the ad-hoc `flex-1 p-6 md:p-10` + inline max-w-* wrappers
// that were scattered across seller, admin, and buyer layouts.
//
// Usage:
//   <PageShell>{children}</PageShell>
//   <PageShell className="pt-0">{children}</PageShell>  ← override top padding only

import { cn } from "@/lib/utils";
import { Container } from "./Container";
import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn("relative z-0 flex-1 py-6 md:py-10", className)}>
      <Container size="wide">
        {children}
      </Container>
    </div>
  );
}
