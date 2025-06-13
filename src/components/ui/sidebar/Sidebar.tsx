// src/components/ui/sidebar/Sidebar.tsx
import { ReactNode } from 'react'

interface SidebarProps {
  children: ReactNode
  className?: string
}

export function Sidebar({ children, className = '' }: SidebarProps) {
  return <aside className={`flex flex-col ${className}`}>{children}</aside>
}
