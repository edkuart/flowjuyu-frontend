// src/components/ui/sidebar/SidebarMenuItem.tsx
import Link from 'next/link'
import { ReactNode } from 'react'

interface SidebarMenuItemProps {
  icon?: ReactNode
  href: string
  children: ReactNode
}

export function SidebarMenuItem({ icon, href, children }: SidebarMenuItemProps) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-zinc-800 transition-colors"
      >
        {icon && <span className="w-5 h-5">{icon}</span>}
        <span className="truncate">{children}</span>
      </Link>
    </li>
  )
}
