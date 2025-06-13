// src/components/ui/sidebar/SidebarGroup.tsx
import { ReactNode } from 'react'

interface SidebarGroupProps {
  title: string
  children: ReactNode
}

export function SidebarGroup({ title, children }: SidebarGroupProps) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold uppercase text-gray-400 mb-2">
        {title}
      </h2>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}
