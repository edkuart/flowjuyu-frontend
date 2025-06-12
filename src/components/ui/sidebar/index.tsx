import Link from 'next/link'
import { ReactNode } from 'react'

interface SidebarProps {
  children: ReactNode
  className?: string
}

export function Sidebar({ children, className = '' }: SidebarProps) {
  return <aside className={`flex flex-col ${className}`}>{children}</aside>
}

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
        className="flex items-center gap-3 px-2 py-2 rounded hover:bg-zinc-800 transition-colors"
      >
        {icon && <span className="w-5 h-5">{icon}</span>}
        <span>{children}</span>
      </Link>
    </li>
  )
}
