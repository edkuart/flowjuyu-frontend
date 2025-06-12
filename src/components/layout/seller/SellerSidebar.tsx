'use client'

import { Sidebar } from '@/components/ui/sidebar'
import { SidebarGroup, SidebarMenuItem } from '@/components/ui/sidebar'
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
        <SidebarMenuItem icon={<IconDashboard />} href="/seller/dashboard">
          Dashboard
        </SidebarMenuItem>
        <SidebarMenuItem icon={<IconPackage />} href="/seller/products">
          Productos
        </SidebarMenuItem>
        <SidebarMenuItem icon={<IconUsers />} href="/seller/orders">
          Pedidos
        </SidebarMenuItem>
        <SidebarMenuItem icon={<IconSettings />} href="/seller/settings">
          Configuración
        </SidebarMenuItem>
      </SidebarGroup>
    </Sidebar>
  )
}
