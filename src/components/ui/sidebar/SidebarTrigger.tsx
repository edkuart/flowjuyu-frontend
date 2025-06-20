'use client'

import { useSidebar } from '@/components/ui/sidebar/SidebarContext'
import { Menu } from 'lucide-react'

export function SidebarTrigger() {
  const { toggle } = useSidebar()

  return (
    <button
      onClick={toggle}
      className="text-zinc-800 dark:text-white hover:text-primary transition-colors"
      aria-label="Abrir menú lateral"
    >
      <Menu className="h-6 w-6" />
    </button>
  )
}
