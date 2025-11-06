"use client";

import { ReactNode } from "react";
import { useSidebar } from "./SidebarContext";

interface Props {
  className?: string;
  children?: ReactNode;
}

export function SidebarTrigger({ className, children }: Props) {
  const { toggle } = useSidebar();

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center justify-center ${className}`}
      aria-label="Abrir menú"
    >
      {children}
    </button>
  );
}
