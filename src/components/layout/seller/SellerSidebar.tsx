// src/components/layout/seller/SellerSidebar.tsx
'use client'

import {
  Sidebar,
  SidebarGroup,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import {
  IconDashboard,
  IconPackage,
  IconUsers,
  IconSettings,
} from '@/components/icons'

export default function SellerSidebar() {
  return (
    <Sidebar className="h-screen w-64 bg-zinc-900 text-white p-4">
      <SidebarGroup title="Panel vendedor">
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/seller/dashboard">
              <IconDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/seller/products">
              <IconPackage className="w-5 h-5" />
              <span>Productos</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/seller/orders">
              <IconUsers className="w-5 h-5" />
              <span>Pedidos</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/seller/settings">
              <IconSettings className="w-5 h-5" />
              <span>Configuración</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarGroup>
    </Sidebar>
  )
}
