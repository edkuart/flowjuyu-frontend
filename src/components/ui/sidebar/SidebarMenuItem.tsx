// src/components/ui/sidebar/SidebarMenuItem.tsx
import { ReactNode } from 'react'

interface SidebarMenuItemProps {
  children: ReactNode
}

export function SidebarMenuItem({ children }: SidebarMenuItemProps) {
  return <li className="px-2">{children}</li>
}
