// src/components/layout/seller/SellerSidebar.tsx
"use client";

import {
  Sidebar,
  SidebarGroup,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  IconDashboard,
  IconPackage,
  IconUsers,
  IconSettings,
} from "@/components/icons";

export default function SellerSidebar() {
  return (
    <Sidebar className="h-screen w-64 bg-zinc-900 p-4 text-white">
      <SidebarGroup title="Panel vendedor">
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/seller/metrics">
              <IconDashboard className="h-5 w-5" />
              <span>Métricas</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/seller/products">
              <IconPackage className="h-5 w-5" />
              <span>Productos</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/seller/orders">
              <IconUsers className="h-5 w-5" />
              <span>Pedidos</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/seller/reportes">
              <IconUsers className="h-5 w-5" />
              <span>reportes</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/seller/settings">
              <IconSettings className="h-5 w-5" />
              <span>Configuración</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarGroup>
    </Sidebar>
  );
}
